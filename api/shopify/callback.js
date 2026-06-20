import { createClient } from '@supabase/supabase-js';

const registerWebhooks = async (shop, accessToken) => {
  const webhooks = [
    {
      topic: 'checkouts/create',
      address: 'https://solva-sigma.vercel.app/api/webhooks/checkout-abandoned'
    },
    {
      topic: 'orders/create',
      address: 'https://solva-sigma.vercel.app/api/webhooks/orders-create'
    },
    {
      topic: 'returns/create',
      address: 'https://solva-sigma.vercel.app/api/webhooks/returns-create'
    },
    {
      topic: 'app/uninstalled',
      address: 'https://solva-sigma.vercel.app/api/webhooks/app-uninstalled'
    },
    {
      topic: 'customers/data_request',
      address: 'https://solva-sigma.vercel.app/api/webhooks/gdpr'
    },
    {
      topic: 'customers/redact',
      address: 'https://solva-sigma.vercel.app/api/webhooks/gdpr'
    },
    {
      topic: 'shop/redact',
      address: 'https://solva-sigma.vercel.app/api/webhooks/gdpr'
    }
  ];

  for (const webhook of webhooks) {
    try {
      const response = await fetch(`https://${shop}/admin/api/2026-04/webhooks.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken
        },
        body: JSON.stringify({ webhook: {
          topic: webhook.topic,
          address: webhook.address,
          format: 'json'
        }})
      });
      const result = await response.json();
      console.log(`Webhook registered: ${webhook.topic}`, result);
    } catch (err) {
      console.error(`Failed to register webhook: ${webhook.topic}`, err);
    }
  }
};

export default async function handler(req, res) {
  const { shop, code, state } = req.query;

  if (!shop || !code) {
    return res.status(400).json({ error: 'Missing shop or code' });
  }

  let userId = null;
  try {
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
    userId = stateData.userId || null;
  } catch (e) {
    console.log('Could not parse state:', e.message);
  }

  try {
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: process.env.SHOPIFY_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log('Token response:', tokenData);

    const { access_token } = tokenData;

    if (!access_token) {
      return res.status(400).json({ error: 'Failed to get access token', details: tokenData });
    }

    const shopResponse = await fetch(
      `https://${shop}/admin/api/2026-04/shop.json`,
      { headers: { 'X-Shopify-Access-Token': access_token } }
    );
    const shopData = await shopResponse.json();
    const shopName = shopData?.shop?.name || shop;

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data, error } = await supabase
      .from('stores')
      .upsert(
        { shop_domain: shop, access_token, is_active: true, user_id: userId || null, shop_name: shopName },
        { onConflict: 'shop_domain' }
      );

    console.log('Supabase result:', { data, error });

    if (error) {
      return res.status(500).json({
        error: 'Database save failed',
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    }

    await registerWebhooks(shop, access_token);

    res.redirect('https://solva-sigma.vercel.app/dashboard');

  } catch (err) {
    console.error('Shopify OAuth error:', err);
    res.status(500).json({ error: 'OAuth failed', details: err.message });
  }
}
