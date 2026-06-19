export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { returnReason, productName, customerName, storeName, brandTone, maxDiscount } = req.body;

  if (!returnReason) {
    return res.status(400).json({ error: 'Return reason is required' });
  }

  const toneInstructions = {
    professional: 'Use formal, solution-focused language. Be empathetic but efficient.',
    friendly: 'Use warm, understanding language. Show genuine care for the customer.',
    casual: 'Use relaxed, human language. Be real and easy-going.',
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
        system: `You are a return deflection specialist for ${storeName || 'an online store'}.
${tone}
Your goal is to offer a compelling alternative to a return — such as a discount, exchange, or store credit.
Keep the response under 130 words. Be empathetic first, then offer the alternative naturally.
Maximum discount you can offer: ${maxDiscount || '10%'}.
Do not process the return — offer an alternative instead.
If the issue is a defective or wrong item, acknowledge it seriously and offer an exchange first.
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
