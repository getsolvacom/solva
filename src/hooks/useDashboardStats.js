import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data: store } = await supabase
          .from('stores')
          .select('id, shop_name')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (!store) { setLoading(false); return; }

        const storeId = store.id;

        // Fetch all data in parallel
        const [ticketsRes, cartsRes, returnsRes] = await Promise.all([
          supabase.from('tickets').select('*').eq('store_id', storeId),
          supabase.from('carts').select('*').eq('store_id', storeId),
          supabase.from('returns').select('*').eq('store_id', storeId),
        ]);

        const tickets = ticketsRes.data || [];
        const carts   = cartsRes.data  || [];
        const returns = returnsRes.data || [];

        // KPI calculations
        const ticketsResolved  = tickets.filter(t => t.status === 'resolved' || t.ai_resolved).length;
        const revenueRecovered = carts.filter(c => c.status === 'recovered').reduce((sum, c) => sum + (c.cart_value || 0), 0);
        const returnsDeflected = returns.filter(r => r.deflected).length;
        const ticketsPending   = tickets.filter(t => t.status === 'pending').length;
        const ticketsEscalated = tickets.filter(t => t.escalated).length;
        const cartsInSequence  = carts.filter(c => c.status === 'in_sequence').length;
        const cartsRecovered   = carts.filter(c => c.status === 'recovered').length;
        const totalCarts       = carts.length;
        const recoveryRate     = totalCarts > 0 ? ((cartsRecovered / totalCarts) * 100).toFixed(1) : '0';
        const deflectionRate   = returns.length > 0 ? Math.round((returnsDeflected / returns.length) * 100) : 0;
        const totalMarginSaved = returns.filter(r => r.deflected).reduce((sum, r) => sum + (r.cart_value || 0), 0);

        // Build last 7 days chart data
        const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const last7 = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dayLabel = days[d.getDay()];
          const dateStr  = d.toISOString().split('T')[0];

          const dayTickets = tickets.filter(t =>
            t.created_at && t.created_at.startsWith(dateStr)
          ).length;

          const dayRevenue = carts
            .filter(c => c.status === 'recovered' && c.recovered_at && c.recovered_at.startsWith(dateStr))
            .reduce((sum, c) => sum + (c.cart_value || 0), 0);

          return { day: dayLabel, tickets: dayTickets, revenue: dayRevenue };
        });

        // Recent activity feed
        const recentActivity = [];

        tickets.slice(-3).reverse().forEach(t => {
          recentActivity.push({
            icon: '✓',
            label: `${t.subject || 'Support ticket'} — ${t.ai_resolved ? 'Auto-resolved' : t.status}`,
            time: t.created_at ? new Date(t.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
            color: '#3ECFB2',
            tag: 'Ticket',
          });
        });

        carts.filter(c => c.status === 'recovered').slice(-2).reverse().forEach(c => {
          recentActivity.push({
            icon: '$',
            label: `Abandoned cart recovered — $${(c.cart_value || 0).toFixed(2)}`,
            time: c.recovered_at ? new Date(c.recovered_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
            color: '#5BADFF',
            tag: 'Recovery',
          });
        });

        returns.filter(r => r.deflected).slice(-2).reverse().forEach(r => {
          recentActivity.push({
            icon: '⟳',
            label: `Return deflected — ${r.deflected_offer || 'Exchange offered'}`,
            time: r.created_at ? new Date(r.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
            color: '#F0A04B',
            tag: 'Return',
          });
        });

        setStats({
          ticketsResolved,
          ticketsPending,
          ticketsEscalated,
          revenueRecovered,
          returnsDeflected,
          deflectionRate,
          totalMarginSaved,
          cartsInSequence,
          cartsRecovered,
          recoveryRate,
          totalTickets: tickets.length,
          totalCarts: carts.length,
          totalReturns: returns.length,
          weekData: last7,
          recentActivity: recentActivity.slice(0, 5),
          storeName: store.shop_name,
        });
      } catch (err) {
        console.error('useDashboardStats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}
