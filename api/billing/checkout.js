export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { variantId, email, userId } = req.body;

  if (!variantId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const attributes = {
      product_options: {
        redirect_url: 'https://solva-sigma.vercel.app/dashboard',
        receipt_link_url: 'https://solva-sigma.vercel.app/dashboard',
      },
    };

    if (email || userId) {
      attributes.checkout_data = {};
      if (email) attributes.checkout_data.email = email;
      if (userId) attributes.checkout_data.custom = { user_id: userId };
    }

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes,
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: String(process.env.LEMONSQUEEZY_STORE_ID),
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: String(variantId),
              },
            },
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Lemonsqueezy checkout error:', data);
      return res.status(500).json({ error: 'Failed to create checkout', details: data });
    }

    const checkoutUrl = data.data?.attributes?.url;
    return res.status(200).json({ checkoutUrl });

  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
