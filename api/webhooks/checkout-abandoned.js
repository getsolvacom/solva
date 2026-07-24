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

    let cart;
    try {
      cart = JSON.parse(rawBody.toString('utf8'));
    } catch (err) {
      console.error('Failed to parse webhook body as JSON:', err);
      return res.status(400).json({ error: 'Invalid JSON' });
    }
    const shopDomain = req.headers['x-shopify-shop-domain'];

    console.log('Abandoned checkout received:', cart.id, 'from', shopDomain);

    // Get store and user info from Supabase
    const { data: store } = await supabase
      .from('stores')
      .select('id, user_id, shop_name, shop_domain')
      .eq('shop_domain', shopDomain)
      .maybeSingle();

    if (!store) {
      console.log('Store not found for domain:', shopDomain);
      return res.status(200).json({ received: true });
    }

    // Build cart items string from Shopify webhook data
    const lineItems = cart.line_items || [];
    const cartItems = lineItems.map(item =>
      `${item.quantity}x ${item.title} - $${item.price}`
    ).join(', ');

    const customerName = cart.billing_address?.first_name ||
                         cart.email?.split('@')[0] || 'there';
    const customerEmail = cart.email;

    if (!cartItems || !customerEmail) {
      console.log('Missing cart items or email, skipping AI');
      return res.status(200).json({ received: true });
    }

    // MARKETING CONSENT GATE
    // Shopify's abandoned-checkout payload carries the buyer's email-marketing
    // choice as the top-level boolean `buyer_accepts_marketing` (the checkbox
    // shown at checkout). This is distinct from a Customer object's
    // `accepts_marketing` / `email_marketing_consent` — it lives on the checkout
    // payload we already parse here. Recovery touches are marketing email, so we
    // only proceed with consent.
    const buyerAcceptsMarketing = cart.buyer_accepts_marketing;

    // Case A — consent explicitly declined: never queue. Return 200 so Shopify
    // treats the webhook as handled and does not retry.
    if (buyerAcceptsMarketing === false) {
      console.log(`Buyer declined marketing (buyer_accepts_marketing=false) for cart ${cart.id} — skipping recovery, nothing queued.`);
      return res.status(200).json({ received: true, skipped: 'no_marketing_consent' });
    }

    // Case B — field missing/undefined (payload omitted it). Treat absence as
    // consent-WITHHELD (compliance-conservative) and skip.
    if (buyerAcceptsMarketing === undefined || buyerAcceptsMarketing === null) {
      console.warn(`buyer_accepts_marketing absent on cart ${cart.id} — treating as NO consent, skipping recovery. If this fires frequently, verify the Shopify API version still includes the field.`);
      return res.status(200).json({ received: true, skipped: 'marketing_consent_unknown' });
    }

    // buyer_accepts_marketing === true → fall through to normal processing.

    // IDEMPOTENCY GUARD: Shopify can fire this webhook multiple times for the
    // same cart (address changes, etc). If we've already processed this cart,
    // do not regenerate AI content or re-queue anything.
    const { data: existingCart, error: existingCartError } = await supabase
      .from('carts')
      .select('id')
      .eq('shopify_cart_id', String(cart.id))
      .maybeSingle();

    if (existingCartError) {
      console.error('Error checking for existing cart:', existingCartError);
    }

    if (existingCart) {
      console.log('Cart already processed, skipping:', cart.id);
      return res.status(200).json({ received: true, alreadyProcessed: true });
    }

    // Insert the new cart row
    const { data: newCart, error: cartError } = await supabase
      .from('carts')
      .insert({
        store_id: store.id,
        shopify_cart_id: String(cart.id),
        customer_email: customerEmail,
        customer_name: customerName,
        cart_value: parseFloat(cart.total_price || 0),
        cart_items: cartItems,
        status: 'abandoned',
        recovery_sequence_step: 0,
      })
      .select()
      .single();

    if (cartError) {
      console.error('Failed to insert cart:', cartError);
      return res.status(500).json({ error: cartError.message });
    }

    console.log('Cart inserted:', newCart.id, 'for', customerEmail);

    // Load the store's recovery delay settings, falling back to defaults if the
    // settings row is missing rather than failing the whole webhook.
    const { data: settings, error: settingsError } = await supabase
      .from('store_settings')
      .select('cart_delay1_minutes, cart_delay2_minutes, cart_delay3_minutes')
      .eq('store_id', store.id)
      .maybeSingle();

    if (settingsError) {
      console.error('Error loading store_settings:', settingsError);
    }

    const delayByTouch = {
      1: settings?.cart_delay1_minutes ?? 60,
      2: settings?.cart_delay2_minutes ?? 360,
      3: settings?.cart_delay3_minutes ?? 1440,
    };

    // Generate and queue each recovery touch. Sequential (not parallel) to keep
    // tracing easy. A failure on one touch must not abort the others.
    const baseUrl = 'https://getsolva.app';

    let queued = 0;

    for (const touchNumber of [1, 2, 3]) {
      let aiData;
      try {
        const aiResponse = await fetch(`${baseUrl}/api/ai/cart-recovery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_AI_SECRET },
          body: JSON.stringify({
            cartItems,
            customerName,
            storeName: store.shop_name || shopDomain,
            storeId: store.id,
            userId: store.user_id,
            touchNumber,
          }),
        });

        if (!aiResponse.ok) {
          const errText = await aiResponse.text().catch(() => '');
          console.error(`AI cart-recovery touch ${touchNumber} failed: status ${aiResponse.status}`, errText);
          continue;
        }

        aiData = await aiResponse.json();
        console.log(`AI cart-recovery touch ${touchNumber} generated for:`, customerEmail);
      } catch (err) {
        console.error(`AI cart-recovery touch ${touchNumber} threw:`, err);
        continue;
      }

      if (!aiData || !aiData.response) {
        console.error(`AI cart-recovery touch ${touchNumber} returned no response`);
        continue;
      }

      // Split the AI output into subject + body on the first blank line. Fall
      // back to a generic subject if no blank line is present.
      let subject;
      let body;
      const splitIndex = aiData.response.indexOf('\n\n');
      if (splitIndex === -1) {
        subject = 'Your cart is waiting';
        body = aiData.response.trim();
      } else {
        subject = aiData.response.slice(0, splitIndex).trim();
        body = aiData.response.slice(splitIndex + 2).trim();
      }

      const delayMinutes = delayByTouch[touchNumber];

      const { data: queuedMsg, error: queueError } = await supabase
        .from('scheduled_messages')
        .insert({
          store_id: store.id,
          type: 'cart_recovery',
          ref_id: newCart.id,
          touch_number: touchNumber,
          to_email: customerEmail,
          from_name: store.shop_name || 'Support',
          reply_to: null,
          subject,
          body,
          send_at: new Date(Date.now() + delayMinutes * 60000).toISOString(),
          status: 'queued',
        })
        .select()
        .single();

      if (queueError) {
        console.error(`Failed to queue scheduled_message for touch ${touchNumber}:`, queueError);
        continue;
      }

      console.log(`Queued scheduled_message ${queuedMsg.id} for touch ${touchNumber}, send_at in ${delayMinutes}min`);
      queued += 1;
    }

    console.log(`Cart recovery complete for ${customerEmail}: ${queued} touch(es) queued`);
    res.status(200).json({ received: true, queued });
  } catch (err) {
    console.error('Checkout webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}
