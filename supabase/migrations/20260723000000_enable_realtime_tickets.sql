-- Enable Supabase Realtime for the tickets table.
--
-- Realtime postgres_changes subscriptions only deliver events for tables that
-- are members of the supabase_realtime publication. As of this migration the
-- publication exists but contains no tables, so TicketsView's subscription
-- would silently receive nothing without this.
--
-- Event delivery is still scoped per-subscriber by the existing RLS SELECT
-- policy ("Users can view own tickets"), so a merchant only receives events
-- for rows of their own store. No policy changes are needed.
--
-- ALTER PUBLICATION ... ADD TABLE is NOT idempotent (re-running raises
-- 42710 duplicate_object), and there is no IF NOT EXISTS form for it, so
-- membership is checked first to keep this migration safe to re-run.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tickets'
  ) then
    alter publication supabase_realtime add table public.tickets;
  end if;
end
$$;
