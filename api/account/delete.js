import { createClient } from '@supabase/supabase-js';

// Client used ONLY to verify the caller's Bearer token — never to mutate data.
const authClient = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Service-role client used for the actual deletion (bypasses RLS + admin API).
const admin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Verify identity — exact pattern from api/ai/ticket-resolve.js:14-19.
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 2. Look up the user's store from the VERIFIED user id — never from the body.
    const { data: storeData, error: storeLookupError } = await admin
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (storeLookupError) {
      console.error('Delete account: store lookup failed:', storeLookupError);
      return res.status(500).json({ error: storeLookupError.message });
    }

    // If the user has a store, tear down store-scoped data before the auth user.
    if (storeData) {
      // 2a. scheduled_messages has NO on-delete-cascade on store_id, so it must
      // be deleted explicitly first — otherwise the stores delete below fails
      // with a foreign-key violation. (This was the missing step in the old
      // client-side flow that broke deletion for any store with a queued
      // recovery/deflection sequence.)
      const { error: schedError } = await admin
        .from('scheduled_messages')
        .delete()
        .eq('store_id', storeData.id);
      if (schedError) {
        console.error('Delete account: scheduled_messages delete failed:', schedError);
        return res.status(500).json({ error: schedError.message });
      }

      // 2b. Delete the store. ON DELETE CASCADE removes store_settings, tickets,
      // carts, returns, audit_log(store_id) and store_ticket_counters.
      const { error: storeError } = await admin
        .from('stores')
        .delete()
        .eq('id', storeData.id);
      if (storeError) {
        console.error('Delete account: store delete failed:', storeError);
        return res.status(500).json({ error: storeError.message });
      }
    }

    // 3. Delete the auth user. ON DELETE CASCADE removes profiles,
    // audit_log(user_id) and support_requests(user_id).
    const { error: authDeleteError } = await admin.auth.admin.deleteUser(user.id);
    if (authDeleteError) {
      console.error('Delete account: auth user delete failed:', authDeleteError);
      return res.status(500).json({ error: authDeleteError.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ error: err.message });
  }
}
