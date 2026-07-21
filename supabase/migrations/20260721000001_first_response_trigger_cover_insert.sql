-- =====================================================================
-- Extend first-response tracking to cover INSERT.
--
-- 20260721000000 attached stamp_first_response_at() as BEFORE UPDATE
-- only, which left a gap: a ticket INSERTed with sent_at already set in
-- the same statement never gets first_response_at stamped. No current
-- code path does that (email-ticket-webhook inserts without sent_at and
-- sets it in a later UPDATE), but a future "insert an already-answered
-- ticket" path would silently produce a null first_response_at.
--
-- The function MUST be replaced alongside the trigger. The existing body
-- references old.sent_at and old.first_response_at unguarded; under a
-- BEFORE INSERT fire OLD is unassigned, so PL/pgSQL would raise
--   record "old" is not assigned yet  (SQLSTATE 55000)
-- on EVERY ticket insert. Attaching INSERT to the old function would
-- take down inbound ticket creation, not just fail to stamp.
--
-- The UPDATE branch below is character-for-character the previous logic,
-- so this migration adds INSERT coverage without altering any existing
-- update-path behaviour (including the reopen-survival guard).
--
-- Written to be idempotent, matching the other migrations.
-- =====================================================================

create or replace function public.stamp_first_response_at()
returns trigger
language plpgsql
as $function$
begin
  if tg_op = 'INSERT' then
    -- OLD does not exist here. A row born with a reply already sent is
    -- its own first response.
    if new.sent_at is not null and new.first_response_at is null then
      new.first_response_at := now();
    end if;
  else
    -- Unchanged from 20260721000000. The old.first_response_at guard is
    -- what makes the stamp survive reopens: email-ticket-webhook resets
    -- sent_at to null on a customer reply, so sent_at goes null ->
    -- not null more than once over a ticket's life.
    if old.sent_at is null
       and new.sent_at is not null
       and old.first_response_at is null then
      new.first_response_at := now();
    end if;
  end if;
  return new;
end;
$function$;

drop trigger if exists set_first_response_at on public.tickets;
create trigger set_first_response_at
  before insert or update on public.tickets
  for each row
  execute function public.stamp_first_response_at();

-- Grants: still intentionally none, matching set_ticket_number /
-- assign_ticket_number(). See 20260721000000 for the reasoning.
