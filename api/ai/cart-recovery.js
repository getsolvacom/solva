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

  const { cartItems, customerName, storeName, storeId, userId, touchNumber = 1 } = req.body;

  if (!cartItems) {
    return res.status(400).json({ error: 'Cart items are required' });
  }

  // Enforce plan entitlements server-side. Never fail open: a missing userId
  // or an unentitled plan is treated the same way and never reaches Anthropic.
  let entitled = false;
  if (userId) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, plan_status, trial_ends_at')
        .eq('id', userId)
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

  if (storeId) {
    try {
      const { data: settings } = await supabase
        .from('store_settings')
        .select('ai_tone, brand_description, global_instructions, ai_signature, cart_discount_code')
        .eq('store_id', storeId)
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
