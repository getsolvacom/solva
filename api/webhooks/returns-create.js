import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const topic = req.headers['x-shopify-topic'];

  // This endpoint is subscribed to two topics. A refunds/create payload means a
  // refund was issued: if we still have a pending return for that order, mark it
  // processed and cancel any queued deflection emails. Only an EXACT topic match
  // takes this path — a missing/unrecognized header falls through to the
  // existing returns/create logic below, unchanged.
  if (topic === 'refunds/create') {
    try {
      const refund = req.body;
      const shopDomain = req.headers['x-shopify-shop-domain'];
      const orderId = refund.order_id ? String(refund.order_id) : null;

      console.log('Refund received for order:', orderId, 'from', shopDomain);

      const { data: matchingReturn, error: lookupError } = await supabase
        .from('returns')
        .select('id, status')
        .eq('order_id', orderId)
        .maybeSingle();

      if (lookupError) {
        console.error('Error looking up return for refunded order:', lookupError);
      }

      if (!matchingReturn) {
        console.log(`No matching return found for refunded order: ${orderId} — nothing to cancel`);
        return res.status(200).json({ received: true, matched: false });
      }

      // Only advance rows that are still pending, so we never clobber a return
      // that was already deflected or processed by another path.
      if (matchingReturn.status === 'pending') {
        const { error: updateError } = await supabase
          .from('returns')
          .update({ status: 'processed', deflected: false })
          .eq('id', matchingReturn.id);

        if (updateError) {
          console.error('Failed to mark return as processed:', updateError);
        }
      }

      // Cancel any still-queued deflection emails for this return. Only touches
      // rows still waiting ('queued') — never sent/sending/failed/canceled.
      const { data: canceledMsgs, error: cancelError } = await supabase
        .from('scheduled_messages')
        .update({ status: 'canceled' })
        .eq('type', 'return_deflection')
        .eq('ref_id', matchingReturn.id)
        .eq('status', 'queued')
        .select('id');

      if (cancelError) {
        console.error('Failed to cancel queued return_deflection messages:', cancelError);
      }

      const canceled = canceledMsgs?.length ?? 0;
      console.log(`Canceled ${canceled} queued return_deflection message(s) for return ${matchingReturn.id}`);

      return res.status(200).json({ received: true, matched: true, canceled });
    } catch (err) {
      console.error('Refund webhook error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

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
