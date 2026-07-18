import { createClient } from '@supabase/supabase-js';
import { getEntitlements } from '../../src/lib/entitlements.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
