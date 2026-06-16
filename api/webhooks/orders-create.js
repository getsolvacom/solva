export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const order = req.body;
    console.log('New order received:', JSON.stringify(order, null, 2));

    // TODO: Phase 3 — process order for dashboard metrics

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Order webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}
