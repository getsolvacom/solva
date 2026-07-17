import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), { status: 401, headers: { ...corsHeaders } });
    }

    const publishableKeys = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') ?? '{}');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      publishableKeys.default ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { returnId, replyText } = await req.json();
    if (!returnId || !replyText) {
      return new Response(JSON.stringify({ error: 'Missing returnId or replyText' }), { status: 400, headers: { ...corsHeaders } });
    }

    const { data: returnRow, error: returnError } = await supabase
      .from('returns')
      .select('id, store_id, customer_email, product_name, messages')
      .eq('id', returnId)
      .single();

    if (returnError || !returnRow) {
      return new Response(JSON.stringify({ error: 'Return not found or access denied' }), { status: 404, headers: { ...corsHeaders } });
    }

    if (!returnRow.customer_email) {
      return new Response(JSON.stringify({ error: 'This return has no customer email to reply to' }), { status: 400, headers: { ...corsHeaders } });
    }

    const { data: store } = await supabase
      .from('stores')
      .select('shop_name')
      .eq('id', returnRow.store_id)
      .single();

    const storeName = store?.shop_name || 'Support';
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const subject = `Re: Your return${returnRow.product_name ? ` for ${returnRow.product_name}` : ''}`;

    const sendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${storeName} <support@support.getsolva.app>`,
        to: [returnRow.customer_email],
        reply_to: `return-${returnRow.id}@support.getsolva.app`,
        subject: subject,
        text: replyText,
      }),
    });

    if (!sendRes.ok) {
      const errBody = await sendRes.text();
      console.error('Resend send failed:', errBody);
      return new Response(JSON.stringify({ error: 'Failed to send email', details: errBody }), { status: 502, headers: { ...corsHeaders } });
    }

    const updatedMessages = [
      ...(Array.isArray(returnRow.messages) ? returnRow.messages : []),
      { from: 'agent', text: replyText, time: new Date().toISOString() },
    ];

    const { error: updateError } = await supabase
      .from('returns')
      .update({
        messages: updatedMessages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', returnId);

    if (updateError) {
      console.error('Failed to update return after send:', updateError);
      return new Response(JSON.stringify({ success: true, warning: 'Email sent, but failed to save the update. Refresh and check the return.', updateError: updateError.message }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('send-return-reply error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: { ...corsHeaders } });
  }
});
