-- Enable Supabase Realtime for the carts and returns tables.
--
-- Follow-up to 20260723000000_enable_realtime_tickets: the sidebar badge
-- counts (useSidebarCounts) subscribe to postgres_changes on tickets, carts,
-- and returns, and events are only delivered for tables that are members of
-- the supabase_realtime publication. tickets is already a member; this adds
-- the other two.
--
-- Event delivery is scoped per-subscriber by each table's existing RLS
-- SELECT policy ("Users can view own carts" / "Users can view own returns"),
-- both the same store_id-via-stores.user_id pattern as tickets. No policy
-- changes are needed.
--
-- ALTER PUBLICATION ... ADD TABLE is NOT idempotent (re-running raises
-- 42710 duplicate_object), and there is no IF NOT EXISTS form for it, so
-- membership is checked first — per table, so the migration is safe to
-- re-run and safe if either table was already added by hand.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'carts'
  ) then
    alter publication supabase_realtime add table public.carts;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'returns'
  ) then
    alter publication supabase_realtime add table public.returns;
  end if;
end
$$;
