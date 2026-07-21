import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { isTicketUnread } from '../lib/ticketUnread';

const EMPTY = { ticketCount: null, cartCount: null, returnCount: null };

/**
 * Per-store counts for the sidebar badges. Each count is the "needs attention"
 * subset of its section, so a badge means the same thing in all three places:
 *
 *   tickets — unread: a customer message newer than merchant_last_viewed_at,
 *             archived excluded          (matches TicketsView's "Unread" tab)
 *   carts   — abandoned and not yet recovered
 *   returns — awaiting a decision        (ReturnsView "Pending")
 *
 * Takes storeId rather than resolving the store itself: DashboardShell already
 * holds it via useStore, and re-querying `stores` here would be a third lookup
 * on every dashboard page. Pass a falsy storeId (store not loaded yet, or demo
 * mode) to skip querying entirely.
 */
export function useSidebarCounts(storeId) {
  // Counts are tagged with the store they were fetched for. Reporting EMPTY for
  // any other store is then a derivation at the return, rather than a setState
  // inside the effect purely to clear stale numbers.
  const [result, setResult] = useState({ storeId: null, counts: EMPTY });

  useEffect(() => {
    if (!storeId) return;

    let cancelled = false;

    const fetchCounts = async () => {
      try {
        const [ticketsRes, cartsRes, returnsRes] = await Promise.all([
          // Unread depends on the last customer message's timestamp relative to
          // merchant_last_viewed_at, which no SQL count can express against a
          // jsonb array — so this one pulls rows and counts in JS. Only the
          // three fields the check needs, never '*': the messages array is the
          // expensive part and the rest of a ticket row is dead weight here.
          supabase.from('tickets')
            .select('messages, merchant_last_viewed_at, is_archived')
            .eq('store_id', storeId)
            .not('is_archived', 'is', true),

          // Carts only ever hold 'abandoned' (checkout-abandoned.js on insert)
          // or 'recovered' (orders-create.js when the order lands). 'in_sequence'
          // and 'failed' appear in demo fixtures and read-side code but are
          // never written, so 'abandoned' IS the outstanding-work set.
          supabase.from('carts').select('id', { count: 'exact', head: true })
            .eq('store_id', storeId)
            .eq('status', 'abandoned'),

          // ReturnsView derives `r.deflected ? 'deflected' : r.status || 'pending'`
          // and hides archived rows, so Pending is all three conditions together.
          supabase.from('returns').select('id', { count: 'exact', head: true })
            .eq('store_id', storeId)
            .not('is_archived', 'is', true)
            .not('deflected', 'is', true)
            .or('status.eq.pending,status.is.null'),
        ]);

        if (cancelled) return;

        // Archived rows are already excluded by the query above, so every row
        // here is a candidate; only the unread check remains.
        const unread = ticketsRes.error || !ticketsRes.data
          ? null
          : ticketsRes.data.filter(t => isTicketUnread(t.messages, t.merchant_last_viewed_at)).length;

        // A failed query stays null rather than falling back to 0 — a badge that
        // silently reads zero is worse than no badge.
        setResult({
          storeId,
          counts: {
            ticketCount: unread,
            cartCount:   cartsRes.error   ? null : cartsRes.count,
            returnCount: returnsRes.error ? null : returnsRes.count,
          },
        });
      } catch (err) {
        if (cancelled) return;
        console.error('useSidebarCounts error:', err);
        setResult({ storeId, counts: EMPTY });
      }
    };

    fetchCounts();
    return () => { cancelled = true; };
  }, [storeId]);

  return result.storeId === storeId ? result.counts : EMPTY;
}
