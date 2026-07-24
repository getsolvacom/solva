import { createClient } from '@supabase/supabase-js';
import { getEntitlements } from '../../src/lib/entitlements.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Router: dispatches on req.body.action. Each sub-handler below is the verbatim
// body of its original standalone endpoint (api/ai/{ticket-resolve,cart-recovery,
// return-deflect}.js), merged here only to stay under Vercel's function cap. The
// shared POST guard is hoisted here since it was identical across all three.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  switch (req.body?.action) {
    case 'ticket-resolve': return ticketResolve(req, res);
    case 'cart-recovery':  return cartRecovery(req, res);
    case 'return-deflect': return returnDeflect(req, res);
    default:
      return res.status(400).json({ error: 'Unknown or missing action' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ticket-resolve (verbatim from api/ai/ticket-resolve.js)
// ─────────────────────────────────────────────────────────────────────────────
async function ticketResolve(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();
  const storeId = store?.id;

  const { data: allowed } = await supabase.rpc('check_and_increment_rate_limit', {
    p_key: `ticket_resolve:${user.id}`,
    p_max_requests: 30,
    p_window_seconds: 300,
  });
  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
  }

  const { ticket, storeName, brandTone, systemPrompt: clientSystemPrompt } = req.body;

  if (!ticket) {
    return res.status(400).json({ error: 'Ticket content is required' });
  }

  let aiConfig = {
    brand_description: '',
    customer_description: '',
    global_instructions: '',
    response_detail: 'balanced',
    faqs: [],
    language_mode: 'fixed',
    ai_tone: brandTone || 'friendly',
    ai_signature: '',
  };

  if (storeId) {
    try {
      const { data: settings } = await supabase
        .from('store_settings')
        .select('brand_description, customer_description, global_instructions, response_detail, faqs, language_mode, ai_tone, ai_signature, ai_language')
        .eq('store_id', storeId)
        .maybeSingle();

      if (settings) {
        aiConfig = {
          ...aiConfig,
          ...settings,
          faqs: (() => { try { return JSON.parse(settings.faqs || '[]'); } catch(e) { return []; } })(),
          ai_tone: settings.ai_tone || brandTone || 'friendly',
        };
      }
    } catch(err) {
      console.error('Failed to fetch AI config:', err);
    }
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

  const systemPrompt = clientSystemPrompt || `You are an AI customer support assistant for ${storeName || 'this Shopify store'}.

TONE: ${toneInstruction}
LENGTH: ${lengthInstruction}${brandSection}${customerSection}${instructionsSection}${faqSection}

IMPORTANT: If the customer's question matches or is similar to one of the store FAQs above, use that exact answer. Do not add unnecessary markdown formatting like ## headers or ** bold text in your responses. Write in plain conversational text only.`;

  try {

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: ticket,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(500).json({ error: 'AI service error', details: data });
    }

    const aiResponse = data.content[0].text;

    return res.status(200).json({ response: aiResponse });

  } catch (error) {

    console.error('ticket-resolve error:', error);
    return res.status(500).json({ error: 'Internal server error' });

  }

}

// ─────────────────────────────────────────────────────────────────────────────
// cart-recovery (verbatim from api/ai/cart-recovery.js)
// ─────────────────────────────────────────────────────────────────────────────
async function cartRecovery(req, res) {
  let derivedUserId = null;
  let derivedStoreId = null;

  const internalSecret = req.headers['x-internal-secret'];
  if (internalSecret && internalSecret === process.env.INTERNAL_AI_SECRET) {
    // Trusted internal call (Shopify webhook) — still requires the caller to
    // explicitly state which user/store this is for, since there's no session
    // to derive it from. This is fine because only our own webhook code can
    // reach this branch, gated by the secret.
    derivedUserId = req.body.userId;
    derivedStoreId = req.body.storeId;
    if (!derivedUserId || !derivedStoreId) {
      return res.status(400).json({ error: 'userId and storeId are required for internal calls' });
    }
  } else {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    derivedUserId = user.id;
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();
    derivedStoreId = store?.id;
  }

  const { data: allowed } = await supabase.rpc('check_and_increment_rate_limit', {
    p_key: `cart_recovery:${derivedUserId}`,
    p_max_requests: 50,
    p_window_seconds: 300,
  });
  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
  }

  const { cartItems, customerName, storeName, touchNumber = 1 } = req.body;

  if (!cartItems) {
    return res.status(400).json({ error: 'Cart items are required' });
  }

  // Enforce plan entitlements server-side. Never fail open: a missing userId
  // or an unentitled plan is treated the same way and never reaches Anthropic.
  let entitled = false;
  if (derivedUserId) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, plan_status, trial_ends_at')
        .eq('id', derivedUserId)
        .maybeSingle();

      entitled = getEntitlements(profile).cartRecovery === true;
    } catch (err) {
      console.error('Failed to fetch profile for entitlements:', err);
      entitled = false;
    }
  }

  if (!entitled) {
    return res.status(403).json({
      error: 'Cart recovery is not available on your current plan.',
    });
  }

  // Load the store's real AI settings so tone and discount come from saved
  // configuration rather than caller-supplied values.
  let aiConfig = {
    ai_tone: 'friendly',
    brand_description: '',
    global_instructions: '',
    ai_signature: '',
    cart_discount_code: '',
  };

  if (derivedStoreId) {
    try {
      const { data: settings } = await supabase
        .from('store_settings')
        .select('ai_tone, brand_description, global_instructions, ai_signature, cart_discount_code')
        .eq('store_id', derivedStoreId)
        .maybeSingle();

      if (settings) {
        aiConfig = {
          ...aiConfig,
          ...settings,
          ai_tone: settings.ai_tone || 'friendly',
        };
      }
    } catch (err) {
      console.error('Failed to fetch AI config:', err);
    }
  }

  const toneInstructions = {
    professional: 'Use formal, persuasive language. Be concise and value-focused.',
    friendly: 'Use warm, encouraging language. Be genuine and helpful.',
    casual: 'Use relaxed, conversational language. Be natural and low-pressure.',
  };

  const tone = toneInstructions[aiConfig.ai_tone] || toneInstructions.friendly;
  const discountCode = aiConfig.cart_discount_code || '';

  const touchInstructions = {
    1: 'This is the FIRST reminder, sent shortly after the cart was abandoned. Tone: friendly, low-pressure nudge. Do NOT mention any discount code in this email.',
    2: 'This is the SECOND reminder, sent after the first went unanswered. If a discount code is provided, mention it clearly as an incentive to complete the purchase. Acknowledge gently that they may have hit a snag.',
    3: 'This is the THIRD AND FINAL reminder in this sequence. Create genuine urgency (e.g. limited stock, cart expiring soon) without being pushy or dishonest. If a discount code is provided, restate it as a last chance.',
  };

  const touchSection = `\n${touchInstructions[touchNumber] || touchInstructions[1]}`;

  const brandSection = aiConfig.brand_description
    ? `\nABOUT THIS STORE: ${aiConfig.brand_description}`
    : '';

  const policySection = aiConfig.global_instructions
    ? `\nMANDATORY RULES — always follow these:\n${aiConfig.global_instructions}`
    : '';

  const signatureSection = aiConfig.ai_signature
    ? `\nSign off the email with: ${aiConfig.ai_signature}`
    : '';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: `You are a cart recovery specialist for ${storeName || 'an online store'}.
${tone}
Write a short, persuasive email to recover an abandoned cart.
Keep it under 120 words. Be genuine — never pushy or spammy.
If a discount code is provided, mention it naturally.
Do not use placeholder text like [Customer Name] — use the actual name provided.${touchSection}${brandSection}${policySection}${signatureSection}
Format: Subject line first, then the email body. Separate them with a blank line.`,
        messages: [
          {
            role: 'user',
            content: `Customer name: ${customerName || 'there'}
Cart items: ${cartItems}${
              (touchNumber === 2 || touchNumber === 3) && discountCode
                ? `\nDiscount code: ${discountCode}`
                : ''
            }

Write a cart recovery email.`,
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(500).json({ error: 'AI service error', details: data });
    }

    const aiResponse = data.content[0].text;
    return res.status(200).json({ response: aiResponse });

  } catch (error) {
    console.error('cart-recovery error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// return-deflect (verbatim from api/ai/return-deflect.js)
// ─────────────────────────────────────────────────────────────────────────────
async function returnDeflect(req, res) {
  let derivedUserId = null;
  let derivedStoreId = null;

  const internalSecret = req.headers['x-internal-secret'];
  if (internalSecret && internalSecret === process.env.INTERNAL_AI_SECRET) {
    // Trusted internal call (Shopify webhook) — still requires the caller to
    // explicitly state which user/store this is for, since there's no session
    // to derive it from. This is fine because only our own webhook code can
    // reach this branch, gated by the secret.
    derivedUserId = req.body.userId;
    derivedStoreId = req.body.storeId;
    if (!derivedUserId || !derivedStoreId) {
      return res.status(400).json({ error: 'userId and storeId are required for internal calls' });
    }
  } else {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    derivedUserId = user.id;
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();
    derivedStoreId = store?.id;
  }

  const { data: allowed } = await supabase.rpc('check_and_increment_rate_limit', {
    p_key: `return_deflect:${derivedUserId}`,
    p_max_requests: 50,
    p_window_seconds: 300,
  });
  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
  }

  const { returnReason, productName, customerName, storeName } = req.body;

  if (!returnReason) {
    return res.status(400).json({ error: 'Return reason is required' });
  }

  // Enforce plan entitlements server-side. Never fail open: a missing userId
  // or an unentitled plan is treated the same way and never reaches Anthropic.
  let entitled = false;
  if (derivedUserId) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, plan_status, trial_ends_at')
        .eq('id', derivedUserId)
        .maybeSingle();

      entitled = getEntitlements(profile).returnDeflection === true;
    } catch (err) {
      console.error('Failed to fetch profile for entitlements:', err);
      entitled = false;
    }
  }

  if (!entitled) {
    return res.status(403).json({
      error: 'Return deflection is not available on your current plan.',
    });
  }

  // Load the store's real AI settings so tone and store context come from
  // saved configuration rather than caller-supplied values.
  let aiConfig = {
    ai_tone: 'friendly',
    brand_description: '',
    global_instructions: '',
    ai_signature: '',
  };

  if (derivedStoreId) {
    try {
      const { data: settings } = await supabase
        .from('store_settings')
        .select('ai_tone, brand_description, global_instructions, ai_signature')
        .eq('store_id', derivedStoreId)
        .maybeSingle();

      if (settings) {
        aiConfig = {
          ...aiConfig,
          ...settings,
          ai_tone: settings.ai_tone || 'friendly',
        };
      }
    } catch (err) {
      console.error('Failed to fetch AI config:', err);
    }
  }

  const toneInstructions = {
    professional: 'Use formal, solution-focused language. Be empathetic but efficient.',
    friendly: 'Use warm, understanding language. Show genuine care for the customer.',
    casual: 'Use relaxed, human language. Be real and easy-going.',
  };

  const tone = toneInstructions[aiConfig.ai_tone] || toneInstructions.friendly;

  const brandSection = aiConfig.brand_description
    ? `\nABOUT THIS STORE: ${aiConfig.brand_description}`
    : '';

  const policySection = aiConfig.global_instructions
    ? `\nMANDATORY RULES — always follow these:\n${aiConfig.global_instructions}`
    : '';

  const signatureSection = aiConfig.ai_signature
    ? `\nSign off the email with: ${aiConfig.ai_signature}`
    : '';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: `You are a return deflection specialist for ${storeName || 'an online store'}.
${tone}
Your goal is to offer a compelling alternative to a return — such as a discount, exchange, or store credit.
Keep the response under 130 words. Be empathetic first, then offer the alternative naturally.
Offer a reasonable incentive, but do not commit to anything the store cannot honor.
Do not process the return — offer an alternative instead.
If the issue is a defective or wrong item, acknowledge it seriously and offer an exchange first.${brandSection}${policySection}${signatureSection}
Format: Subject line first, then the email body. Separate them with a blank line.`,
        messages: [
          {
            role: 'user',
            content: `Customer name: ${customerName || 'there'}
Product: ${productName || 'their recent purchase'}
Return reason: ${returnReason}

Write a return deflection response.`,
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(500).json({ error: 'AI service error', details: data });
    }

    const aiResponse = data.content[0].text;
    return res.status(200).json({ response: aiResponse });

  } catch (error) {
    console.error('return-deflect error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
