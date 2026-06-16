export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const cart = req.body;
    console.log('Abandoned checkout received:', JSON.stringify(cart, null, 2));

    // TODO: Phase 3 — trigger AI cart recovery sequence

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Checkout webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}
