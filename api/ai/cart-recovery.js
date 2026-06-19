export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cartItems, customerName, storeName, brandTone, discountCode } = req.body;

  if (!cartItems) {
    return res.status(400).json({ error: 'Cart items are required' });
  }

  const toneInstructions = {
    professional: 'Use formal, persuasive language. Be concise and value-focused.',
    friendly: 'Use warm, encouraging language. Be genuine and helpful.',
    casual: 'Use relaxed, conversational language. Be natural and low-pressure.',
  };

  const tone = toneInstructions[brandTone] || toneInstructions.friendly;

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
Do not use placeholder text like [Customer Name] — use the actual name provided.
Format: Subject line first, then the email body. Separate them with a blank line.`,
        messages: [
          {
            role: 'user',
            content: `Customer name: ${customerName || 'there'}
Cart items: ${cartItems}
Discount code: ${discountCode || 'none'}

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
