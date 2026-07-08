import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const rawBody = await req.text();

    // Verify this request genuinely came from Resend
    const svixId = req.headers.get('svix-id');
    const svixTimestamp = req.headers.get('svix-timestamp');
    const svixSignature = req.headers.get('svix-signature');
    const secret = Deno.env.get('RESEND_WEBHOOK_SECRET');

    if (!svixId || !svixTimestamp || !svixSignature || !secret) {
      return new Response('Missing signature headers', { status: 401 });
    }

    const encoder = new TextEncoder();
    const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
    const secretBytes = Uint8Array.from(atob(secret.split('_')[1] ?? secret), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey('raw', secretBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(signedContent));
    const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));

    const validSignatures = svixSignature.split(' ').map(s => s.split(',')[1]);
    if (!validSignatures.includes(expectedSignature)) {
      console.error('Signature verification failed');
      return new Response('Invalid signature', { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    if (payload.type !== 'email.received') {
      return new Response('Ignored event type', { status: 200 });
    }

    const emailId = payload.data.email_id;
    const fromAddress = payload.data.from;
    const toAddress = Array.isArray(payload.data.to) ? payload.data.to[0] : payload.data.to;
    const subject = payload.data.subject || '(no subject)';

    // Extract store_id from "ticket-{store_id}@support.getsolva.app"
    const match = toAddress?.match(/^ticket-([a-f0-9-]+)@/i);
    if (!match) {
      console.error('Could not parse store_id from to address:', toAddress);
      return new Response('Unrecognized recipient format', { status: 200 });
    }
    const storeId = match[1];

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const emailDetailRes = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
      headers: { 'Authorization': `Bearer ${resendApiKey}` },
    });
    const emailDetail = await emailDetailRes.json();
    const messageBody = emailDetail.text || emailDetail.html || '(no content)';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: ticket, error } = await supabase.from('tickets').insert({
      store_id: storeId,
      customer_email: fromAddress,
      customer_name: fromAddress?.split('@')[0] || 'Customer',
      subject: subject,
      messages: [{ role: 'customer', text: messageBody, at: new Date().toISOString() }],
      status: 'pending',
      source: 'email',
      inbound_email_id: emailId,
    }).select().single();

    if (error) {
      console.error('Failed to insert ticket:', error);
      return new Response(JSON.stringify({ error: error.message, details: error.details, hint: error.hint, code: error.code }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    console.log('Ticket created:', ticket.id, 'for store', storeId);
    return new Response('ok', { status: 200 });

  } catch (err) {
    console.error('Webhook processing error:', err);
    return new Response('Internal error', { status: 500 });
  }
});
