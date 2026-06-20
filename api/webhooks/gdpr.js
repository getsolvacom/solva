export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const topic = req.headers['x-shopify-topic'];
    const shop = req.headers['x-shopify-shop-domain'];
    console.log(`GDPR webhook received: ${topic} from ${shop}`);
    console.log('Payload:', JSON.stringify(req.body, null, 2));
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('GDPR webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}
