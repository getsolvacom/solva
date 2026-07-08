import { createClient } from 'npm:@supabase/supabase-js@2';
import { getEntitlements } from '../_shared/entitlements.ts';

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
    console.log('Resend email detail fetch status:', emailDetailRes.status);
    console.log('Resend email detail raw response:', JSON.stringify(emailDetail));
    const messageBody = emailDetail.text || emailDetail.html || '(no content)';

    const secretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      secretKeys.default ?? ''
    );

    // Guard against Resend retrying delivery of the same email (idempotency)
    const { data: existing } = await supabase
      .from('tickets')
      .select('id')
      .eq('inbound_email_id', emailId)
      .maybeSingle();

    if (existing) {
      console.log('Duplicate webhook delivery, ticket already exists');
      return new Response('ok', { status: 200 });
    }

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

    // Draft generation runs after the ticket is safely saved. Any failure here
    // must NOT surface as a non-200, or Resend would retry and duplicate work —
    // the ticket already exists, so we swallow errors and still return 200.
    try {
      // Resolve the store owner and their plan entitlements
      let entitlements = getEntitlements({});
      const { data: store } = await supabase
        .from('stores')
        .select('user_id')
        .eq('id', storeId)
        .maybeSingle();

      if (store?.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan, plan_status, trial_ends_at')
          .eq('id', store.user_id)
          .maybeSingle();
        if (profile) {
          entitlements = getEntitlements(profile);
        }
      }

      // Count tickets created this calendar month for the store
      const monthStart = new Date();
      monthStart.setUTCDate(1);
      monthStart.setUTCHours(0, 0, 0, 0);
      const { count } = await supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('store_id', storeId)
        .gte('created_at', monthStart.toISOString());

      if ((count ?? 0) >= entitlements.ticketCap) {
        console.log('Ticket cap reached for store', storeId);
        return new Response('ok', { status: 200 });
      }

      // Load the store's AI settings (same lookup as ticket-resolve.js)
      let aiConfig = {
        brand_description: '',
        customer_description: '',
        global_instructions: '',
        response_detail: 'balanced',
        faqs: [],
        ai_tone: 'friendly',
      };
      const { data: settings } = await supabase
        .from('store_settings')
        .select('brand_description, customer_description, global_instructions, response_detail, faqs, ai_tone')
        .eq('store_id', storeId)
        .maybeSingle();

      if (settings) {
        aiConfig = {
          ...aiConfig,
          ...settings,
          faqs: (() => { try { return JSON.parse(settings.faqs || '[]'); } catch (e) { return []; } })(),
          ai_tone: settings.ai_tone || 'friendly',
        };
      }

      const faqSection = aiConfig.faqs && aiConfig.faqs.length > 0
        ? `\n\nSTORE FAQs — use these exact answers when customers ask related questions:\n${aiConfig.faqs.map(f => `Q: ${f.q}\nA: ${f.a}`).join('\n\n')}`
        : '';
      const brandSection = aiConfig.brand_description
        ? `\n\nABOUT THIS STORE: ${aiConfig.brand_description}`
        : '';
      const customerSection = aiConfig.customer_description
        ? `\n\nABOUT THEIR CUSTOMERS: ${aiConfig.customer_description}`
        : '';
      const instructionsSection = aiConfig.global_instructions
        ? `\n\nMANDATORY RULES — always follow these:\n${aiConfig.global_instructions}`
        : '';
      const lengthInstruction = aiConfig.response_detail === 'short'
        ? 'Keep your response to 1-2 sentences maximum. Be direct and concise.'
        : aiConfig.response_detail === 'detailed'
        ? 'Give a thorough, detailed response covering all relevant information.'
        : 'Keep your response concise but complete. Aim for 2-4 sentences.';
      const toneInstruction = aiConfig.ai_tone === 'professional'
        ? 'Use a formal, precise, professional tone.'
        : aiConfig.ai_tone === 'casual'
        ? 'Use a relaxed, casual, conversational tone.'
        : 'Use a warm, friendly, helpful tone.';

      const systemPrompt = `You are an AI customer support assistant drafting a reply for a store.

This is a DRAFT that a human support agent will review and edit before it is sent — it is NOT auto-sent to the customer. Write it as a ready-to-review reply.

TONE: ${toneInstruction}
LENGTH: ${lengthInstruction}${brandSection}${customerSection}${instructionsSection}${faqSection}

IMPORTANT: If the customer's question matches or is similar to one of the store FAQs above, use that exact answer. Be helpful and empathetic. Do not add unnecessary markdown formatting like ## headers or ** bold text. Write in plain conversational text only.`;

      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            { role: 'user', content: `Subject: ${subject}\n\n${messageBody}` },
          ],
        }),
      });

      const anthropicData = await anthropicRes.json();
      if (!anthropicRes.ok) {
        console.error('Anthropic API error:', anthropicData);
        return new Response('ok', { status: 200 });
      }

      const draft = anthropicData.content?.[0]?.text ?? '';
      await supabase.from('tickets').update({ ai_draft_reply: draft }).eq('id', ticket.id);
      console.log('Draft reply generated for ticket', ticket.id);
    } catch (draftErr) {
      console.error('Draft generation failed (ticket still saved):', draftErr);
    }

    return new Response('ok', { status: 200 });

  } catch (err) {
    console.error('Webhook processing error:', err);
    return new Response('Internal error', { status: 500 });
  }
});
