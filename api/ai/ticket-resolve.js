import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
