-- =====================================================================
-- First-response tracking on tickets.
--
-- Adds first_response_at and stamps it exactly once, the first time a
-- ticket transitions to "a reply has gone out" (sent_at null -> not null).
--
-- Why a trigger rather than application code: three separate paths send
-- the first outbound reply on a ticket --
--   1. supabase/functions/email-ticket-webhook  (AI auto-send)
--   2. supabase/functions/send-ticket-reply     (merchant clicks Send)
--   3. supabase/functions/scheduler-tick        (queued reply fires)
-- None of them currently know whether they are the first, and a
-- read-then-write "if null, set it" check in JS is racy: a manual send
-- can overlap a scheduler tick that has already claimed its row (the
-- cancel in TicketsView filters on status='queued', but
-- claim_due_scheduled_messages has by then moved the row to 'sending').
-- Doing it in a BEFORE UPDATE trigger is atomic under the row lock and
-- covers all three paths without editing any of them.
--
-- Written to be idempotent, matching 20260718000000_baseline_schema.sql.
-- =====================================================================

alter table public.tickets add column if not exists first_response_at timestamptz;

-- One-time stamp. The `old.first_response_at is null` guard is what makes
-- this survive reopens: email-ticket-webhook resets sent_at to null when a
-- customer replies to a resolved ticket, so a later reply drives sent_at
-- null -> not null a second time. That must NOT overwrite the original
-- first-response timestamp.
create or replace function public.stamp_first_response_at()
returns trigger
language plpgsql
as $function$
begin
  if old.sent_at is null
     and new.sent_at is not null
     and old.first_response_at is null then
    new.first_response_at := now();
  end if;
  return new;
end;
$function$;

drop trigger if exists set_first_response_at on public.tickets;
create trigger set_first_response_at
  before update on public.tickets
  for each row
  execute function public.stamp_first_response_at();

-- Grants: intentionally none, matching the existing set_ticket_number /
-- assign_ticket_number() pattern in the baseline. Trigger functions are
-- invoked by the trigger mechanism rather than by the calling role, so
-- they carry no `grant execute` (the only two function grants in the
-- baseline -- claim_due_scheduled_messages and
-- check_and_increment_rate_limit -- are RPCs called directly by app
-- code). The existing table grants on public.tickets are column-less and
-- so already cover first_response_at.
