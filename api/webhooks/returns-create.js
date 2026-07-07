import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const returnRequest = req.body;
    const shopDomain = req.headers['x-shopify-shop-domain'];

    console.log('Return request received:', returnRequest.id, 'from', shopDomain);

    // Get store info from Supabase
    const { data: store } = await supabase
      .from('stores')
      .select('id, user_id, shop_name, shop_domain')
      .eq('shop_domain', shopDomain)
      .maybeSingle();

    if (!store) {
      console.log('Store not found for domain:', shopDomain);
      return res.status(200).json({ received: true });
    }

    // Extract return details from Shopify webhook
    const refundLineItems = returnRequest.refund_line_items || [];
    const productName = refundLineItems[0]?.line_item?.title || 'their purchase';
    const customerName = returnRequest.order?.billing_address?.first_name || 'there';
    const customerEmail = returnRequest.order?.email;
    const returnReason = returnRequest.note || 'Customer requested return';
    const orderValue = parseFloat(returnRequest.transactions?.[0]?.amount || 0);

    // Call AI return deflection function
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://solva-sigma.vercel.app';

    const aiResponse = await fetch(`${baseUrl}/api/ai/return-deflect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        returnReason,
        productName,
        customerName,
        storeName: store.shop_name || shopDomain,
        storeId: store.id,
        userId: store.user_id,
      }),
    });

    const aiData = await aiResponse.json();
    const deflectionResponse = aiData.response;

    console.log('AI deflection response generated for:', customerEmail);
    console.log('Deflection response:', deflectionResponse);

    // Save to returns table in Supabase
    await supabase.from('returns').upsert({
      user_id: store.user_id,
      shopify_return_id: String(returnRequest.id),
      customer_email: customerEmail,
      customer_name: customerName,
      product_name: productName,
      return_reason: returnReason,
      order_value: orderValue,
      ai_deflection_response: deflectionResponse,
      status: 'pending',
      created_at: new Date().toISOString(),
    }, { onConflict: 'shopify_return_id' });

    res.status(200).json({ received: true, aiGenerated: true });
  } catch (err) {
    console.error('Return webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}
