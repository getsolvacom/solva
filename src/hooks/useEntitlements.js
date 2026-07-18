import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getEntitlements } from '../lib/entitlements';

export function useEntitlements() {
  const [entitlements, setEntitlements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (userId === undefined) return;
    if (!userId) { setLoading(false); return; }

    supabase
      .from('profiles')
      .select('plan, plan_status, trial_ends_at')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        setEntitlements(getEntitlements(data || {}));
        setLoading(false);
      });
  }, [userId]);

  return { entitlements, loading };
}
