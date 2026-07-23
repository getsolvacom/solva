import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
  api: {
    bodyParser: false,
  },
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verifyShopifyHmac(rawBody, hmacHeader, secret) {
  if (!hmacHeader) return false;
  const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
  try {
    const bufA = Buffer.from(computed, 'base64');
    const bufB = Buffer.from(hmacHeader, 'base64');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const rawBody = await getRawBody(req);
    const hmacHeader = req.headers['x-shopify-hmac-sha256'];

    if (!verifyShopifyHmac(rawBody, hmacHeader, process.env.SHOPIFY_CLIENT_SECRET)) {
      console.error('Invalid Shopify HMAC signature — rejecting webhook');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    let order;
    try {
      order = JSON.parse(rawBody.toString('utf8'));
    } catch (err) {
      console.error('Failed to parse webhook body as JSON:', err);
      return res.status(400).json({ error: 'Invalid JSON' });
    }
    const shopDomain = req.headers['x-shopify-shop-domain'];

    console.log('New order received:', order.id, 'from', shopDomain);

    // Get store info from Supabase
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('shop_domain', shopDomain)
      .maybeSingle();

    if (!store) {
      console.log('Store not found for domain:', shopDomain);
      return res.status(200).json({ received: true });
    }

    // If this order was from an abandoned cart recovery, mark cart as recovered
    const cartToken = order.cart_token;
    if (cartToken) {
      const { data: recoveredCarts, error: cartUpdateError } = await supabase
        .from('carts')
        .update({ status: 'recovered', recovered_at: new Date().toISOString() })
        .eq('shopify_cart_id', cartToken)
        .eq('store_id', store.id)
        .select('id');

      if (cartUpdateError) {
        console.error('Failed to mark cart as recovered:', cartUpdateError);
      } else {
        console.log('Cart marked as recovered for token:', cartToken);
      }

      // Customer completed checkout, so cancel any still-queued recovery emails
      // for this cart. Only touch rows still waiting ('queued') — never ones
      // already sent/sending/failed/canceled. A failure here must not 500 the
      // handler: the order is already recorded, which is the important outcome.
      const recoveredCartId = recoveredCarts?.[0]?.id;
      if (recoveredCartId) {
        const { data: canceledMsgs, error: cancelError } = await supabase
          .from('scheduled_messages')
          .update({ status: 'canceled' })
          .eq('type', 'cart_recovery')
          .eq('ref_id', recoveredCartId)
          .eq('status', 'queued')
          .select('id');

        if (cancelError) {
          console.error('Failed to cancel queued cart_recovery messages:', cancelError);
        } else {
          console.log(`Canceled ${canceledMsgs?.length ?? 0} queued cart_recovery message(s) for cart ${recoveredCartId}`);
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Order webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}
