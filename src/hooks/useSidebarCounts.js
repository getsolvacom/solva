import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { isTicketUnread } from '../lib/ticketUnread';

const EMPTY = { ticketCount: null, cartCount: null, returnCount: null };

// Tables whose INSERT/UPDATE events can change a badge count. DELETE is
// deliberately not subscribed: the only deletes in the app are the
// account-deletion flow in Settings, where these counts no longer matter —
// and realtime cannot RLS-filter DELETE payloads anyway.
const BADGE_TABLES = ['tickets', 'carts', 'returns'];
const BADGE_EVENTS = ['INSERT', 'UPDATE'];

// Trailing debounce for event-driven recounts: a burst of events (webhook
// flurry, bulk archive) triggers one refetch, not one per event.
const REFETCH_DEBOUNCE_MS = 750;

/**
 * Per-store counts for the sidebar badges. Each count is the "needs attention"
 * subset of its section, so a badge means the same thing in all three places:
 *
 *   tickets — unread: a customer message newer than merchant_last_viewed_at,
 *             archived excluded          (matches TicketsView's "Unread" tab)
 *   carts   — abandoned and not yet recovered
 *   returns — awaiting a decision        (ReturnsView "Pending")
 *
 * Counts stay live: after the initial fetch the hook subscribes to
 * postgres_changes on all three tables and re-runs the same count queries
 * (debounced) whenever a relevant row changes. DashboardShell stays mounted
 * across every dashboard page, so the subscription is dashboard-lifetime.
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
    let channel = null;
    let debounceTimer = null;

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

    // Every realtime event funnels into one debounced recount. Handlers never
    // inspect payloads — the three queries above stay the single source of
    // truth for what each badge means, and a recount is self-healing where
    // incremental bookkeeping against row payloads would not be (UPDATE
    // events carry no pre-image beyond the PK, so bucket transitions can't
    // be derived from the event alone).
    const scheduleRecount = () => {
      if (cancelled) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (!cancelled) fetchCounts();
      }, REFETCH_DEBOUNCE_MS);
    };

    const subscribeToChanges = () => {
      // RLS already scopes delivered events to this merchant's own store; the
      // store_id filter is defense-in-depth and noise reduction on top, same
      // as TicketsView's subscription.
      channel = supabase.channel(`sidebar-counts-${storeId}`);
      for (const table of BADGE_TABLES) {
        for (const event of BADGE_EVENTS) {
          channel.on('postgres_changes',
            { event, schema: 'public', table, filter: `store_id=eq.${storeId}` },
            scheduleRecount);
        }
      }
      channel.subscribe((status) => {
        // One extra recount once the socket is live closes the window where a
        // row changed between the initial fetch and SUBSCRIBED — cheap here,
        // unlike refetching the full ticket list in TicketsView.
        if (status === 'SUBSCRIBED' && !cancelled) fetchCounts();
      });
    };

    fetchCounts().then(() => { if (!cancelled) subscribeToChanges(); });

    return () => {
      cancelled = true;
      // Both halves matter: clearing the timer stops a queued recount from
      // firing at all, and `cancelled` guards the case where a recount is
      // already mid-flight when cleanup runs.
      clearTimeout(debounceTimer);
      if (channel) supabase.removeChannel(channel);
    };
  }, [storeId]);

  return result.storeId === storeId ? result.counts : EMPTY;
}
