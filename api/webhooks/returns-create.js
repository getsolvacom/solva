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
    const orderId = returnRequest.order?.id ? String(returnRequest.order.id) : null;
    const returnReason = returnRequest.note || 'Customer requested return';
    const orderValue = parseFloat(returnRequest.transactions?.[0]?.amount || 0);

    // IDEMPOTENCY GUARD: Shopify can fire return-related webhooks more than once
    // for the same return. If we've already processed it, do not regenerate the
    // deflection or re-queue anything.
    const { data: existingReturn, error: existingReturnError } = await supabase
      .from('returns')
      .select('id')
      .eq('shopify_return_id', String(returnRequest.id))
      .maybeSingle();

    if (existingReturnError) {
      console.error('Error checking for existing return:', existingReturnError);
    }

    if (existingReturn) {
      console.log('Return already processed, skipping:', returnRequest.id);
      return res.status(200).json({ received: true, alreadyProcessed: true });
    }

    // Insert the new return row
    const { data: newReturn, error: returnError } = await supabase
      .from('returns')
      .insert({
        store_id: store.id,
        shopify_return_id: String(returnRequest.id),
        order_id: orderId,
        customer_email: customerEmail,
        customer_name: customerName,
        product_name: productName,
        reason: returnReason,
        order_value: orderValue,
        status: 'pending',
      })
      .select()
      .single();

    if (returnError) {
      console.error('Failed to insert return:', returnError);
      return res.status(500).json({ error: returnError.message });
    }

    console.log('Return inserted:', newReturn.id, 'for', customerEmail);

    // Load the store's response window, falling back to a default if the
    // settings row is missing rather than failing the whole webhook.
    const { data: settings, error: settingsError } = await supabase
      .from('store_settings')
      .select('return_response_window_minutes')
      .eq('store_id', store.id)
      .maybeSingle();

    if (settingsError) {
      console.error('Error loading store_settings:', settingsError);
    }

    const windowMinutes = settings?.return_response_window_minutes ?? 1440;

    // Generate the AI deflection response. The return row already exists, so a
    // failure here should not be a 500 — the return is still recorded.
    const baseUrl = 'https://getsolva.app';

    let aiData;
    try {
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

      if (!aiResponse.ok) {
        const errText = await aiResponse.text().catch(() => '');
        console.error(`AI return-deflect failed: status ${aiResponse.status}`, errText);
        return res.status(200).json({ received: true, queued: 0 });
      }

      aiData = await aiResponse.json();
      console.log('AI return-deflect generated for:', customerEmail);
    } catch (err) {
      console.error('AI return-deflect threw:', err);
      return res.status(200).json({ received: true, queued: 0 });
    }

    if (!aiData || !aiData.response) {
      console.error('AI return-deflect returned no response');
      return res.status(200).json({ received: true, queued: 0 });
    }

    // Split the AI output into subject + body on the first blank line. Fall back
    // to a generic subject if no blank line is present.
    let subject;
    let body;
    const splitIndex = aiData.response.indexOf('\n\n');
    if (splitIndex === -1) {
      subject = 'About your return request';
      body = aiData.response.trim();
    } else {
      subject = aiData.response.slice(0, splitIndex).trim();
      body = aiData.response.slice(splitIndex + 2).trim();
    }

    const { data: queuedMsg, error: queueError } = await supabase
      .from('scheduled_messages')
      .insert({
        store_id: store.id,
        type: 'return_deflection',
        ref_id: newReturn.id,
        touch_number: 1,
        to_email: customerEmail,
        from_name: store.shop_name || 'Support',
        reply_to: null,
        subject,
        body,
        send_at: new Date(Date.now() + windowMinutes * 60000).toISOString(),
        status: 'queued',
      })
      .select()
      .single();

    if (queueError) {
      console.error('Failed to queue scheduled_message for return deflection:', queueError);
      return res.status(200).json({ received: true, queued: 0 });
    }

    console.log(`Queued scheduled_message ${queuedMsg.id} for return deflection, send_at in ${windowMinutes}min`);
    res.status(200).json({ received: true, queued: 1 });
  } catch (err) {
    console.error('Return webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}
