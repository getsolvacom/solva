-- Track whether a store has received its one-time welcome email, so
-- reconnects/resyncs never trigger a duplicate send.
alter table public.stores add column if not exists welcome_email_sent_at timestamptz;
