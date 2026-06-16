import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { domain } = req.body;
    console.log('App uninstalled from:', domain);

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    await supabase
      .from('stores')
      .update({ is_active: false })
      .eq('shop_domain', domain);

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Uninstall webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}
