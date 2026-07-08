import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), { status: 401 });
    }

    const publishableKeys = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') ?? '{}');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      publishableKeys.default ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { ticketId, replyText } = await req.json();
    if (!ticketId || !replyText) {
      return new Response(JSON.stringify({ error: 'Missing ticketId or replyText' }), { status: 400 });
    }

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, store_id, customer_email, subject, messages')
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return new Response(JSON.stringify({ error: 'Ticket not found or access denied' }), { status: 404 });
    }

    if (!ticket.customer_email) {
      return new Response(JSON.stringify({ error: 'This ticket has no customer email to reply to' }), { status: 400 });
    }

    const { data: store } = await supabase
      .from('stores')
      .select('shop_name')
      .eq('id', ticket.store_id)
      .single();

    const storeName = store?.shop_name || 'Support';
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    const sendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${storeName} <support@support.getsolva.app>`,
        to: [ticket.customer_email],
        reply_to: `ticket-${ticket.store_id}@support.getsolva.app`,
        subject: ticket.subject?.startsWith('Re:') ? ticket.subject : `Re: ${ticket.subject}`,
        text: replyText,
      }),
    });

    if (!sendRes.ok) {
      const errBody = await sendRes.text();
      console.error('Resend send failed:', errBody);
      return new Response(JSON.stringify({ error: 'Failed to send email', details: errBody }), { status: 502 });
    }

    const updatedMessages = [
      ...(Array.isArray(ticket.messages) ? ticket.messages : []),
      { at: new Date().toISOString(), role: 'agent', text: replyText },
    ];

    const { error: updateError } = await supabase
      .from('tickets')
      .update({
        messages: updatedMessages,
        status: 'resolved',
        approved_at: new Date().toISOString(),
        sent_at: new Date().toISOString(),
      })
      .eq('id', ticketId);

    if (updateError) {
      console.error('Failed to update ticket after send:', updateError);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('send-ticket-reply error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
});
