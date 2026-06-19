import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const cart = req.body;
    const shopDomain = req.headers['x-shopify-shop-domain'];

    console.log('Abandoned checkout received:', cart.id, 'from', shopDomain);

    // Get store and user info from Supabase
    const { data: store } = await supabase
      .from('stores')
      .select('user_id, shop_name, shop_domain')
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

    // Call AI cart recovery function
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://solva-sigma.vercel.app';

    const aiResponse = await fetch(`${baseUrl}/api/ai/cart-recovery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems,
        customerName,
        storeName: store.shop_name || shopDomain,
        brandTone: 'friendly',
        discountCode: 'COMEBACK10',
      }),
    });

    const aiData = await aiResponse.json();
    const recoveryEmail = aiData.response;

    console.log('AI cart recovery email generated for:', customerEmail);
    console.log('Recovery email:', recoveryEmail);

    // Save to carts table in Supabase
    await supabase.from('carts').upsert({
      user_id: store.user_id,
      shopify_cart_id: String(cart.id),
      customer_email: customerEmail,
      customer_name: customerName,
      cart_value: parseFloat(cart.total_price || 0),
      cart_items: cartItems,
      ai_recovery_email: recoveryEmail,
      status: 'in_sequence',
      created_at: new Date().toISOString(),
    }, { onConflict: 'shopify_cart_id' });

    res.status(200).json({ received: true, aiGenerated: true });
  } catch (err) {
    console.error('Checkout webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}
