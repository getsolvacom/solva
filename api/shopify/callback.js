import { createClient } from '@supabase/supabase-js';

const registerWebhooks = async (shop, accessToken) => {
  const BASE_URL = 'https://getsolva.app';
  const webhooks = [
    {
      topic: 'checkouts/create',
      address: `${BASE_URL}/api/webhooks/checkout-abandoned`
    },
    {
      topic: 'orders/create',
      address: `${BASE_URL}/api/webhooks/orders-create`
    },
    {
      topic: 'returns/create',
      address: `${BASE_URL}/api/webhooks/returns-create`
    },
    {
      topic: 'app/uninstalled',
      address: `${BASE_URL}/api/webhooks/app-uninstalled`
    },
    {
      topic: 'customers/data_request',
      address: `${BASE_URL}/api/webhooks/gdpr`
    },
    {
      topic: 'customers/redact',
      address: `${BASE_URL}/api/webhooks/gdpr`
    },
    {
      topic: 'shop/redact',
      address: `${BASE_URL}/api/webhooks/gdpr`
    },
    {
      topic: 'refunds/create',
      address: `${BASE_URL}/api/webhooks/returns-create`
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

    // Determine whether this is the merchant's first-ever connection for this
    // shop, so the welcome email fires exactly once. Checked BEFORE the upsert
    // below (which never touches welcome_email_sent_at): a first-time
    // connection is one where no store row exists yet, or the row exists but
    // welcome_email_sent_at has not been stamped. A reconnect/resync already
    // has welcome_email_sent_at set and must NOT re-trigger the email.
    let isFirstConnection = false;
    try {
      const { data: existingStore } = await supabase
        .from('stores')
        .select('welcome_email_sent_at')
        .eq('shop_domain', shop)
        .maybeSingle();
      isFirstConnection = !existingStore || !existingStore.welcome_email_sent_at;
    } catch (welcomeCheckErr) {
      console.error('Welcome-email first-connection check failed:', welcomeCheckErr);
    }

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

    if (userId) {
      try {
        const { data: existingTrial } = await supabase
          .from('shop_trials')
          .select('shop_domain')
          .eq('shop_domain', shop)
          .maybeSingle();

        if (!existingTrial) {
          const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

          await supabase
            .from('shop_trials')
            .insert({
              shop_domain: shop,
              trial_started_at: new Date().toISOString(),
              trial_ends_at: trialEndsAt
            });

          const { data: profile } = await supabase
            .from('profiles')
            .select('plan_status')
            .eq('id', userId)
            .maybeSingle();

          const planStatus = profile?.plan_status;
          const eligibleForTrial =
            planStatus == null || planStatus === 'free' || planStatus === 'cancelled';

          if (eligibleForTrial) {
            await supabase
              .from('profiles')
              .update({ plan: 'trial', plan_status: 'trialing', trial_ends_at: trialEndsAt })
              .eq('id', userId);
          }
        } else {
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan_status')
            .eq('id', userId)
            .maybeSingle();

          if (profile?.plan_status == null) {
            await supabase
              .from('profiles')
              .update({ plan: 'free', plan_status: 'free' })
              .eq('id', userId);
          }
        }
      } catch (trialErr) {
        console.error('Trial eligibility error:', trialErr);
      }

      // Fire the welcome email exactly once, only on a first-time connection.
      // The store upsert above has already succeeded at this point. A failed
      // welcome email must NEVER fail or roll back the OAuth callback — the
      // store connection succeeding is the priority.
      if (isFirstConnection) {
        try {
          // Shopify's OAuth doesn't reliably give us a usable merchant email,
          // so we use profiles.email (populated by handle_new_user on signup).
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', userId)
            .maybeSingle();

          const merchantEmail = profile?.email;

          if (merchantEmail) {
            const resendApiKey = process.env.RESEND_API_KEY;
            const welcomeText =
              `Hi there,\n\n` +
              `Great news — your store ${shopName} is now connected to SOLVA, and SOLVA is live and working for you.\n\n` +
              `Everything is ready to go right out of the box:\n\n` +
              `- AI Tickets: customer questions get answered automatically.\n` +
              `- Cart Recovery: abandoned carts get a friendly nudge to come back.\n` +
              `- Returns: return requests are handled and gently deflected where it makes sense.\n\n` +
              `You don't need to do anything to get started. If you'd like to fine-tune the tone, automations, or discount codes, head to Settings in your dashboard anytime.\n\n` +
              `Welcome aboard,\nThe SOLVA Team`;

            const sendRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'SOLVA <support@support.getsolva.app>',
                to: [merchantEmail],
                subject: "Welcome to SOLVA — you're all set!",
                text: welcomeText,
              }),
            });

            if (!sendRes.ok) {
              const errBody = await sendRes.text();
              console.error('Welcome email send failed:', errBody);
            } else {
              console.log('Welcome email sent to:', merchantEmail);
            }

            // Stamp welcome_email_sent_at whether the send succeeded or not, so
            // subsequent reconnect attempts never re-send (no retry storms).
            const { error: stampErr } = await supabase
              .from('stores')
              .update({ welcome_email_sent_at: new Date().toISOString() })
              .eq('shop_domain', shop);
            if (stampErr) {
              console.error('Failed to stamp welcome_email_sent_at:', stampErr);
            }
          } else {
            console.error('No merchant email on profile; skipping welcome email for userId:', userId);
          }
        } catch (welcomeErr) {
          // Never block the OAuth callback on a welcome-email failure.
          console.error('Welcome email flow error (store connection unaffected):', welcomeErr);
        }
      }
    }

    await registerWebhooks(shop, access_token);

    res.redirect('https://solva-sigma.vercel.app/dashboard');

  } catch (err) {
    console.error('Shopify OAuth error:', err);
    res.status(500).json({ error: 'OAuth failed', details: err.message });
  }
}
