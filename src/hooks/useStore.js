import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useStore() {
  const [store,   setStore]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId,  setUserId]  = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (userId === undefined) return;
    if (!userId) { setLoading(false); return; }

    supabase
      .from('stores')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setStore(data);
        setLoading(false);
      });
  }, [userId]);

  return { store, loading };
}
