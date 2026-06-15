import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { shop, code } = req.query;

  if (!shop || !code) {
    return res.status(400).json({ error: 'Missing shop or code' });
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

    const { access_token } = await tokenResponse.json();

    if (!access_token) {
      return res.status(400).json({ error: 'Failed to get access token' });
    }

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await supabase
      .from('stores')
      .upsert({ shop_domain: shop, access_token }, { onConflict: 'shop_domain' });

    if (error) throw error;

    res.redirect('https://solva-sigma.vercel.app/dashboard');

  } catch (err) {
    console.error('Shopify OAuth error:', err);
    res.status(500).json({ error: 'OAuth failed' });
  }
}
