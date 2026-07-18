const crypto = require('crypto');
const fs = require('fs');

const payloadPath = process.argv[2];
if (!payloadPath) {
  console.error('Usage: node scripts/generate-shopify-signature.js <path-to-json-file>');
  process.exit(1);
}

const secret = process.env.SHOPIFY_CLIENT_SECRET;
if (!secret) {
  console.error('SHOPIFY_CLIENT_SECRET is not set in the environment. Run this with your .env.local values loaded, or set it inline for this command only.');
  process.exit(1);
}

const rawBody = fs.readFileSync(payloadPath);
const signature = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');

console.log('X-Shopify-Hmac-Sha256:', signature);
