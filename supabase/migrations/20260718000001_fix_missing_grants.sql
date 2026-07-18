-- =====================================================================
-- Fix two missing grants found during the baseline migration audit
-- (20260718000000_baseline_schema.sql).
-- =====================================================================

-- service_role could SELECT profiles but not UPDATE them — the Lemon
-- Squeezy billing webhook needs to update plan_status on subscription
-- changes.
grant update on public.profiles to service_role;

-- anon had no INSERT grant on newsletter_subscribers, even though the
-- RLS policy "Allow public insert" was already scoped `to anon` — the
-- landing-page signup form runs unauthenticated and needs this.
grant insert on public.newsletter_subscribers to anon;
