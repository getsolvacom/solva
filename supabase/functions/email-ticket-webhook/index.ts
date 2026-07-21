import { createClient } from 'npm:@supabase/supabase-js@2';
import { getEntitlements } from '../_shared/entitlements.ts';

function stripQuotedReply(text) {
  const patterns = [
    /^On .+wrote:[\s\S]*$/m,
    /^-{2,}\s*Original Message\s*-{2,}[\s\S]*$/mi,
    /^>.+$/m,
  ];
  let result = text;
  for (const pattern of patterns) {
    const match = result.match(pattern);
    if (match && match.index > 0) {
      result = result.slice(0, match.index).trim();
    }
  }
  return result.trim() || text.trim();
}

// Shared draft-generation logic used by both the new-ticket and reply-append
// paths. Behavior is identical to the original inline block (same model, same
// entitlements logic, same fallback defaults) — this is a refactor only.
async function generateDraftForTicket(supabase, ticketId, storeId, subject, messageText, customerEmail) {
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
    return;
  }

  // Load the store's AI settings (same lookup as ticket-resolve.js)
  let aiConfig = {
    brand_description: '',
    customer_description: '',
    global_instructions: '',
    response_detail: 'balanced',
    faqs: [],
    ai_tone: 'friendly',
    ai_auto_send_enabled: false,
  };
  const { data: settings } = await supabase
    .from('store_settings')
    .select('brand_description, customer_description, global_instructions, response_detail, faqs, ai_tone, ai_auto_send_enabled')
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

  const systemPrompt = `You are an AI customer support assistant handling a reply for a store.

You must both CLASSIFY the customer's message and DRAFT a reply, returned via the classify_and_draft tool.

TONE: ${toneInstruction}
LENGTH: ${lengthInstruction}${brandSection}${customerSection}${instructionsSection}${faqSection}

CLASSIFICATION — choose exactly one category:
- 'faq': the question is directly answerable from the store's FAQ list above.
- 'product_question': a general question about a product, answerable from the brand/product info already provided above.
- 'other': anything involving money, refunds, order-specific status, complaints, or anything not clearly answerable from the info given. When in doubt, choose 'other'.

CONFIDENCE — be honest and conservative, NOT optimistic:
- 'high': ONLY if you are certain the reply is accurate and complete with zero guessing.
- 'medium' or 'low': for anything less than certain.
A 'high'-confidence reply may be auto-sent to a real customer with NO human review, so a wrong 'high' rating can send an incorrect reply. When unsure, rate 'medium' or 'low'.

MATCHED_FAQ_QUESTION — if (and only if) you classify this as 'faq' with 'high' confidence, you MUST set matched_faq_question to the exact text of the specific store FAQ question your reply is based on, copied verbatim from the FAQ list above — do NOT paraphrase, reword, or invent it. This value is checked mechanically against the real FAQ list: if it does not exactly match a real FAQ question, the reply will NOT be sent automatically (it will be downgraded and held for human review). If category is not 'faq' or confidence is not 'high', leave matched_faq_question as an empty string.

REPLY — write it as a ready-to-send reply. If the customer's question matches or is similar to one of the store FAQs above, use that exact answer. Be helpful and empathetic. Do not add unnecessary markdown formatting like ## headers or ** bold text. Write in plain conversational text only.`;

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
      tools: [
        {
          name: 'classify_and_draft',
          description: 'Classify the customer message and provide a draft reply.',
          input_schema: {
            type: 'object',
            properties: {
              category: { type: 'string', enum: ['faq', 'product_question', 'other'] },
              confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
              reply: { type: 'string' },
              matched_faq_question: { type: 'string', description: 'If category is faq and confidence is high, the EXACT text of the store FAQ question this reply is based on, copied verbatim from the provided FAQ list. Leave as an empty string if no FAQ was matched or category is not faq.' },
            },
            required: ['category', 'confidence', 'reply', 'matched_faq_question'],
          },
        },
      ],
      tool_choice: { type: 'tool', name: 'classify_and_draft' },
      messages: [
        { role: 'user', content: `Subject: ${subject}\n\n${messageText}` },
      ],
    }),
  });

  const anthropicData = await anthropicRes.json();
  if (!anthropicRes.ok) {
    console.error('Anthropic API error:', anthropicData);
    return;
  }

  // Parse the structured tool-use output. Fail closed on anything missing or
  // malformed — treat as 'other'/'low' so a parsing failure can never auto-send.
  let category = 'other';
  let confidence = 'low';
  let matchedFaqQuestion = '';
  let reply = anthropicData.content?.find(b => b.type === 'text')?.text || '';

  const toolBlock = anthropicData.content?.find(b => b.type === 'tool_use');
  if (toolBlock && toolBlock.input
    && typeof toolBlock.input.category === 'string'
    && typeof toolBlock.input.confidence === 'string'
    && typeof toolBlock.input.reply === 'string'
    && typeof toolBlock.input.matched_faq_question === 'string') {
    category = toolBlock.input.category;
    confidence = toolBlock.input.confidence;
    reply = toolBlock.input.reply;
    matchedFaqQuestion = toolBlock.input.matched_faq_question;
  }

  // Never trust the model's self-reported confidence alone — verify a claimed
  // high-confidence FAQ answer actually corresponds to a real, merchant-configured
  // FAQ entry before allowing it to count as auto-send-eligible.
  if (category === 'faq' && confidence === 'high') {
    const realMatch = Array.isArray(aiConfig.faqs) && aiConfig.faqs.some(
      f => f.q && f.q.trim().toLowerCase() === matchedFaqQuestion.trim().toLowerCase()
    );
    if (!realMatch) {
      console.log('Claimed high-confidence FAQ match did not correspond to a real FAQ entry — downgrading to medium.', { ticketId, matchedFaqQuestion });
      confidence = 'medium';
    }
  }

  const eligible = category === 'faq' && confidence === 'high' && aiConfig.ai_auto_send_enabled === true;

  if (!eligible) {
    await supabase.from('tickets').update({ ai_draft_reply: reply, ai_category: category, ai_confidence: confidence }).eq('id', ticketId);
    console.log('Draft reply generated for ticket', ticketId, 'category:', category, 'confidence:', confidence);
    return;
  }

  // Eligible for auto-send. Wrap in its own try/catch so any failure falls back
  // gracefully to draft-only behavior rather than leaving the ticket broken.
  try {
    const { data: store } = await supabase
      .from('stores')
      .select('shop_name')
      .eq('id', storeId)
      .maybeSingle();
    const storeName = store?.shop_name || 'Support';

    const sendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${storeName} <support@support.getsolva.app>`,
        to: [customerEmail],
        reply_to: `ticket-${ticketId}@support.getsolva.app`,
        subject: subject?.startsWith('Re:') ? subject : `Re: ${subject}`,
        text: reply,
      }),
    });

    if (!sendRes.ok) {
      const errBody = await sendRes.text();
      console.error('Auto-send Resend failed for ticket', ticketId, errBody);
      await supabase.from('tickets').update({ ai_draft_reply: reply, ai_category: category, ai_confidence: confidence }).eq('id', ticketId);
      return;
    }

    // Re-read the CURRENT messages fresh — never reuse a possibly-stale array.
    const { data: freshTicket } = await supabase
      .from('tickets')
      .select('messages')
      .eq('id', ticketId)
      .maybeSingle();
    const updatedMessages = [
      ...(Array.isArray(freshTicket?.messages) ? freshTicket.messages : []),
      { from: 'ai', text: reply, time: new Date().toISOString() },
    ];

    await supabase.from('tickets').update({
      messages: updatedMessages,
      status: 'resolved',
      ai_resolved: true,
      approved_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ai_draft_reply: reply,
      ai_category: category,
      ai_confidence: confidence,
    }).eq('id', ticketId);

    console.log('Auto-sent ticket', ticketId, 'category:', category, 'confidence:', confidence);
  } catch (sendErr) {
    console.error('Auto-send failed (falling back to draft) for ticket', ticketId, sendErr);
    await supabase.from('tickets').update({ ai_draft_reply: reply, ai_category: category, ai_confidence: confidence }).eq('id', ticketId);
  }
}

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

    // Extract the uuid from "ticket-{uuid}@support.getsolva.app". It may be an
    // existing ticket id (a customer reply) or a store id (a brand new ticket).
    const ticketMatch = toAddress?.match(/^ticket-([a-f0-9-]+)@/i);
    const returnMatch = !ticketMatch ? toAddress?.match(/^return-([a-f0-9-]+)@/i) : null;

    if (!ticketMatch && !returnMatch) {
      console.error('Could not parse recipient address:', toAddress);
      return new Response('Unrecognized recipient format', { status: 200 });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const emailDetailRes = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
      headers: { 'Authorization': `Bearer ${resendApiKey}` },
    });
    const emailDetail = await emailDetailRes.json();
    console.log('Resend email detail fetch status:', emailDetailRes.status);
    console.log('Resend email detail raw response:', JSON.stringify(emailDetail));
    const messageBody = emailDetail.text || emailDetail.html || '(no content)';
    const cleanedMessageBody = stripQuotedReply(messageBody);

    const secretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      secretKeys.default ?? ''
    );

    if (returnMatch) {
      const returnId = returnMatch[1];

      const { data: returnRow, error: returnFetchError } = await supabase
        .from('returns')
        .select('id, messages')
        .eq('id', returnId)
        .maybeSingle();

      if (returnFetchError || !returnRow) {
        console.error('Could not find matching return for inbound reply:', returnId, returnFetchError);
        return new Response('Return not found', { status: 200 });
      }

      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      const emailDetailRes = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
        headers: { 'Authorization': `Bearer ${resendApiKey}` },
      });
      const emailDetail = await emailDetailRes.json();
      const messageBody = emailDetail.text || emailDetail.html || '(no content)';
      const cleanedMessageBody = stripQuotedReply(messageBody);

      const updatedMessages = [
        ...(Array.isArray(returnRow.messages) ? returnRow.messages : []),
        { from: 'customer', text: cleanedMessageBody, time: new Date().toISOString() },
      ];

      const { error: updateError } = await supabase
        .from('returns')
        .update({ messages: updatedMessages, updated_at: new Date().toISOString() })
        .eq('id', returnId);

      if (updateError) {
        console.error('Failed to append inbound reply to return:', returnId, updateError);
        return new Response('Failed to update return', { status: 200 });
      }

      console.log('Appended inbound customer reply to return:', returnId);
      return new Response('ok', { status: 200 });
    }

    const uuid = ticketMatch[1];

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

    // Does this uuid match an existing ticket the customer is replying to?
    const { data: existingTicket } = await supabase
      .from('tickets')
      .select('id, store_id, subject, messages')
      .eq('id', uuid)
      .maybeSingle();

    if (existingTicket) {
      // Reply to an existing conversation — append the new message and re-open
      // the ticket for fresh review (the previous draft/approval no longer applies).
      const updatedMessages = [
        ...(Array.isArray(existingTicket.messages) ? existingTicket.messages : []),
        { from: 'customer', text: cleanedMessageBody, time: new Date().toISOString() },
      ];

      const { error: updateError } = await supabase
        .from('tickets')
        .update({
          messages: updatedMessages,
          status: 'pending',
          ai_resolved: false,
          updated_at: new Date().toISOString(),
          ai_draft_reply: null,
          sent_at: null,
          approved_at: null,
        })
        .eq('id', existingTicket.id);

      if (updateError) {
        console.error('Failed to append reply to ticket:', updateError);
        return new Response(JSON.stringify({ error: updateError.message, details: updateError.details, hint: updateError.hint, code: updateError.code }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }

      // A fresh customer reply needs a new draft. Any failure here must NOT
      // surface as a non-200 — the reply is already saved, and returning an
      // error would make Resend retry and duplicate work.
      try {
        await generateDraftForTicket(supabase, existingTicket.id, existingTicket.store_id, existingTicket.subject || subject, cleanedMessageBody, fromAddress);
      } catch (draftErr) {
        console.error('Draft generation failed (reply still saved):', draftErr);
      }

      console.log('Reply appended to existing ticket:', existingTicket.id);
      return new Response('ok', { status: 200 });
    }

    // No matching ticket — treat the uuid as a store id and open a new ticket.
    const storeId = uuid;
    const { data: ticket, error } = await supabase.from('tickets').insert({
      store_id: storeId,
      customer_email: fromAddress,
      customer_name: fromAddress?.split('@')[0] || 'Customer',
      subject: subject,
      messages: [{ from: 'customer', text: cleanedMessageBody, time: new Date().toISOString() }],
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
      await generateDraftForTicket(supabase, ticket.id, storeId, subject, cleanedMessageBody, fromAddress);
    } catch (draftErr) {
      console.error('Draft generation failed (ticket still saved):', draftErr);
    }

    return new Response('ok', { status: 200 });

  } catch (err) {
    console.error('Webhook processing error:', err);
    return new Response('Internal error', { status: 500 });
  }
});
