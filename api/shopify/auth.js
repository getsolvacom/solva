import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const shop = req.query.shop;
  const userId = req.query.userId || '';

  if (!shop) {
    return res.status(400).json({ error: 'Missing shop parameter' });
  }
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const redirectUri = 'https://solva-sigma.vercel.app/auth/shopify/callback';
  const scopes = 'read_orders,read_customers,read_checkouts,write_checkouts';
  const state = Buffer.from(JSON.stringify({ nonce: Math.random().toString(36).substring(2, 15), userId })).toString('base64');
  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;
  res.redirect(authUrl);
}
