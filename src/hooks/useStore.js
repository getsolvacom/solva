import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useStore() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (data) setStore(data);
      setLoading(false);
    };
    fetchStore();
  }, []);

  return { store, loading };
}
