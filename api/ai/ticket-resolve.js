export default async function handler(req, res) {

  if (req.method !== 'POST') {

    return res.status(405).json({ error: 'Method not allowed' });

  }

  const { ticket, storeName, brandTone } = req.body;

  if (!ticket) {

    return res.status(400).json({ error: 'Ticket content is required' });

  }

  const toneInstructions = {

    professional: 'Use formal, precise language. Be concise and solution-focused.',

    friendly: 'Use warm, helpful language. Be empathetic and conversational.',

    casual: 'Use relaxed, natural language. Be approachable and easy-going.',

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

        system: `You are an AI customer support agent for ${storeName || 'an online store'}.

${tone}

Your job is to resolve customer support tickets professionally and helpfully.

Always be solution-focused. If you cannot resolve something (like processing a refund),

acknowledge the issue and let the customer know a human agent will follow up.

Keep responses concise — under 150 words unless the issue requires more detail.

Never make up order details, tracking numbers, or policies you don't know.`,

        messages: [

          {

            role: 'user',

            content: `Customer support ticket:\n\n${ticket}`,

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
