export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const returnRequest = req.body;
    console.log('Return request received:', JSON.stringify(returnRequest, null, 2));

    // TODO: Phase 3 — trigger AI return deflection

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Return webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}
