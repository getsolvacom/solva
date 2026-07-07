import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const event = req.body;
    const eventName = event?.meta?.event_name;
    const data = event?.data?.attributes;
    const customData = event?.meta?.custom_data;

    console.log('Lemonsqueezy webhook received:', eventName);

    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const userEmail = data?.user_email;
      const status = data?.status;
      const variantId = String(data?.variant_id);
      const userId = customData?.user_id;

      const planMap = {
        [String(process.env.LEMONSQUEEZY_STARTER_VARIANT_ID)]: 'starter',
        [String(process.env.LEMONSQUEEZY_GROWTH_VARIANT_ID)]:  'growth',
        [String(process.env.LEMONSQUEEZY_SCALE_VARIANT_ID)]:   'scale',
      };

      const plan = planMap[variantId] || 'starter';

      if (userId) {
        await supabase.from('profiles').upsert({
          id: userId,
          plan: plan,
          plan_status: status,
          subscription_id: String(data?.id || ''),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

        console.log(`Updated plan for user ${userId} to ${plan} (${status})`);
      } else if (userEmail) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', userEmail)
          .maybeSingle();

        if (profile) {
          await supabase.from('profiles').update({
            plan: plan,
            plan_status: status,
            subscription_id: String(data?.id || ''),
            updated_at: new Date().toISOString(),
          }).eq('id', profile.id);

          console.log(`Updated plan for email ${userEmail} to ${plan} (${status})`);
        }
      }
    }

    if (eventName === 'subscription_cancelled') {
      const userId = customData?.user_id;
      const userEmail = data?.user_email;

      if (userId) {
        await supabase.from('profiles').update({
          plan_status: 'cancelled',
          updated_at: new Date().toISOString(),
        }).eq('id', userId);
      } else if (userEmail) {
        await supabase.from('profiles').update({
          plan_status: 'cancelled',
          updated_at: new Date().toISOString(),
        }).eq('email', userEmail);
      }

      console.log('Subscription cancelled for:', userId || userEmail);
    }

    if (eventName === 'subscription_payment_failed') {
      const userId = customData?.user_id;
      const userEmail = data?.user_email;

      if (userId) {
        await supabase.from('profiles').update({
          plan_status: 'past_due',
          updated_at: new Date().toISOString(),
        }).eq('id', userId);
      } else if (userEmail) {
        await supabase.from('profiles').update({
          plan_status: 'past_due',
          updated_at: new Date().toISOString(),
        }).eq('email', userEmail);
      }

      console.log('Subscription payment failed for:', userId || userEmail);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Billing webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}
