-- =====================================================================
-- SOLVA — Baseline Schema Migration
-- Captured: 2026-07-18
-- Purpose: Reproduces the live production schema (project ref
-- mscwabuwuqoyiccxtsps) as of this date. Everything here was originally
-- run ad-hoc via the Supabase SQL Editor across multiple sessions; this
-- migration brings it under version control for the first time.
-- Written to be idempotent — safe to run against a fresh database OR
-- against the current live database (no-ops on anything that already
-- exists).
--
-- NOTE: table-level grants below cover the meaningful CRUD verbs
-- (SELECT/INSERT/UPDATE/DELETE) actually exercised by the app. Default
-- schema-level privileges (REFERENCES/TRIGGER/TRUNCATE), which Supabase
-- applies automatically to every table for every role regardless of use,
-- are intentionally not reproduced here — they carry no app-level meaning.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------
create extension if not exists pgcrypto;
create extension if not exists pg_net;
create extension if not exists pg_cron;

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  shop_domain text not null,
  shop_name text,
  access_token text,
  is_active boolean default true,
  plan text default 'starter',
  trial_ends_at timestamptz,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);
do $$ begin
  alter table public.stores add constraint stores_shop_domain_key unique (shop_domain);
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text default 'merchant',
  avatar_url text,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  plan text default 'free',
  plan_status text default 'inactive',
  subscription_id text default '',
  trial_ends_at timestamptz
);

create table if not exists public.store_settings (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id) on delete cascade,
  ai_tone text default 'friendly',
  widget_enabled boolean default true,
  widget_color text default '#E55266',
  widget_position text default 'bottom_right',
  greeting_message text default 'Hi there! How can we help you today?',
  winback_enabled boolean default false,
  winback_days integer default 60,
  winback_discount_type text default 'percentage',
  winback_discount_value numeric default 10,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  ai_language text default 'English',
  ai_auto_reply_limit text default '5',
  ai_escalation_email text default '',
  ai_signature text default '',
  automation_support boolean default true,
  automation_returns boolean default true,
  automation_cart boolean default true,
  cart_discount_code text default 'COMEBACK10',
  notif_weekly_report boolean default true,
  notif_daily_summary boolean default true,
  notif_escalation boolean default true,
  notif_cart_recovered boolean default false,
  notif_return_deflected boolean default false,
  notif_new_ticket boolean default false,
  brand_description text,
  customer_description text,
  global_instructions text,
  response_detail text default 'balanced',
  faqs text default '[]',
  language_mode text default 'fixed',
  knowledge_urls text default '[]',
  cart_delay1_minutes integer default 60,
  cart_delay2_minutes integer default 360,
  cart_delay3_minutes integer default 1440,
  return_response_window_minutes integer default 1440,
  ai_response_delay_seconds integer default 0,
  widget_name text default 'SOLVA Support',
  widget_subtitle text default 'Typically replies instantly',
  ai_auto_send_enabled boolean default false
);
do $$ begin
  alter table public.store_settings add constraint store_settings_store_id_key unique (store_id);
exception when duplicate_object then null; end $$;
-- Note: the live database currently has a second, functionally-identical
-- unique constraint (store_settings_store_id_unique) from an earlier
-- ad-hoc run. Harmless duplication; not recreated here.

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id) on delete cascade,
  customer_email text,
  customer_name text,
  subject text,
  status text default 'pending',
  ai_resolved boolean default false,
  escalated boolean default false,
  messages jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  escalation_reason text,
  ai_confidence text default 'high',
  ai_draft_reply text,
  source text default 'manual',
  inbound_email_id text,
  approved_at timestamptz,
  sent_at timestamptz,
  bookmarked boolean default false,
  csat_rating smallint,
  ticket_number integer,
  ai_category text,
  is_archived boolean default false,
  archived_at timestamptz,
  merchant_last_viewed_at timestamptz
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id) on delete cascade,
  customer_email text,
  customer_name text,
  cart_value numeric,
  status text default 'abandoned',
  recovery_sequence_step integer default 0,
  recovered_at timestamptz,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  shopify_cart_id text,
  cart_items text
);
do $$ begin
  alter table public.carts add constraint carts_shopify_cart_id_key unique (shopify_cart_id);
exception when duplicate_object then null; end $$;

create table if not exists public.returns (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id) on delete cascade,
  customer_email text,
  customer_name text,
  order_id text,
  reason text,
  status text default 'pending',
  deflected boolean default false,
  deflection_offer text,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  shopify_return_id text,
  product_name text,
  order_value numeric,
  messages jsonb default '[]'::jsonb,
  manual_override boolean default false,
  is_archived boolean default false,
  archived_at timestamptz
);
do $$ begin
  alter table public.returns add constraint returns_shopify_return_id_key unique (shopify_return_id);
exception when duplicate_object then null; end $$;

create table if not exists public.scheduled_messages (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id),
  type text not null,
  ref_id uuid not null,
  touch_number integer default 1,
  to_email text not null,
  from_name text,
  reply_to text,
  subject text not null,
  body text not null,
  send_at timestamptz not null,
  status text not null default 'queued',
  attempts integer default 0,
  resend_email_id text,
  error text,
  sent_at timestamptz,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  constraint scheduled_messages_type_check check (type in ('cart_recovery','return_deflection','ticket_reply','return_reply')),
  constraint scheduled_messages_status_check check (status in ('queued','sending','sent','canceled','failed'))
);
create index if not exists scheduled_messages_due_idx on public.scheduled_messages (status, send_at);
create index if not exists scheduled_messages_ref_idx on public.scheduled_messages (type, ref_id);

create table if not exists public.shop_trials (
  shop_domain text primary key,
  trial_started_at timestamptz not null default now(),
  trial_ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  store_id uuid references public.stores(id) on delete cascade,
  action text not null,
  section text not null,
  field text,
  old_value text,
  new_value text,
  created_at timestamptz default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz default now()
);

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  store_id uuid references public.stores(id) on delete set null,
  subject text not null,
  message text not null,
  context jsonb default '{}'::jsonb,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_ticket_counters (
  store_id uuid primary key references public.stores(id) on delete cascade,
  last_number integer not null default 1000
);

create table if not exists public.ai_rate_limits (
  key text primary key,
  window_start timestamptz not null default timezone('utc', now()),
  request_count integer not null default 0
);

-- ---------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $function$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$function$;

create or replace function public.assign_ticket_number()
returns trigger
language plpgsql
as $function$
declare
  next_num integer;
begin
  insert into store_ticket_counters (store_id, last_number)
  values (new.store_id, 1001)
  on conflict (store_id) do update set last_number = store_ticket_counters.last_number + 1
  returning last_number into next_num;

  new.ticket_number := next_num;
  return new;
end;
$function$;

create or replace function public.claim_due_scheduled_messages(batch_size int default 20)
returns setof public.scheduled_messages
language plpgsql
as $function$
begin
  return query
  update scheduled_messages
  set status = 'sending', updated_at = timezone('utc', now())
  where id in (
    select id from scheduled_messages
    where status = 'queued' and send_at <= timezone('utc', now())
    order by send_at asc
    limit batch_size
    for update skip locked
  )
  returning *;
end;
$function$;

create or replace function public.check_and_increment_rate_limit(p_key text, p_max_requests integer, p_window_seconds integer)
returns boolean
language plpgsql
as $function$
declare
  current_count integer;
begin
  insert into ai_rate_limits (key, window_start, request_count)
  values (p_key, timezone('utc', now()), 1)
  on conflict (key) do update set
    request_count = case
      when ai_rate_limits.window_start < timezone('utc', now()) - (p_window_seconds || ' seconds')::interval
        then 1
      else ai_rate_limits.request_count + 1
    end,
    window_start = case
      when ai_rate_limits.window_start < timezone('utc', now()) - (p_window_seconds || ' seconds')::interval
        then timezone('utc', now())
      else ai_rate_limits.window_start
    end
  returning request_count into current_count;

  return current_count <= p_max_requests;
end;
$function$;

-- NOTE: rls_auto_enable() exists on the live database as a security/DDL
-- event-trigger helper (auto-enables RLS on newly created tables). It
-- appears to be Supabase-platform-provided rather than something we
-- authored, and its CREATE EVENT TRIGGER registration was not captured
-- during recon. Recreating the function for completeness; confirm
-- separately whether the event trigger itself needs re-registration if
-- ever rebuilding from scratch.
create or replace function public.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path to 'pg_catalog'
as $function$
declare
  cmd record;
begin
  for cmd in
    select *
    from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table','partitioned table')
  loop
     if cmd.schema_name is not null and cmd.schema_name in ('public') and cmd.schema_name not in ('pg_catalog','information_schema') and cmd.schema_name not like 'pg_toast%' and cmd.schema_name not like 'pg_temp%' then
      begin
        execute format('alter table if exists %s enable row level security', cmd.object_identity);
        raise log 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      exception
        when others then
          raise log 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      end;
     else
        raise log 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     end if;
  end loop;
end;
$function$;

-- ---------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------

drop trigger if exists set_ticket_number on public.tickets;
create trigger set_ticket_number
  before insert on public.tickets
  for each row
  when (new.ticket_number is null)
  execute function public.assign_ticket_number();

-- NOTE: a trigger on auth.users calling handle_new_user() almost certainly
-- exists live (it's the only way new signups get a profiles row), but it
-- lives on the auth schema and wasn't captured by this file's public-
-- schema-scoped trigger query. If rebuilding from scratch, confirm/add:
-- create trigger on_auth_user_created after insert on auth.users
--   for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table public.stores enable row level security;
alter table public.profiles enable row level security;
alter table public.store_settings enable row level security;
alter table public.tickets enable row level security;
alter table public.carts enable row level security;
alter table public.returns enable row level security;
alter table public.scheduled_messages enable row level security;
alter table public.shop_trials enable row level security;
alter table public.audit_log enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.support_requests enable row level security;
alter table public.store_ticket_counters enable row level security;
alter table public.ai_rate_limits enable row level security;
-- shop_trials, store_ticket_counters, and ai_rate_limits have RLS enabled
-- but intentionally no policies — only service_role (which bypasses RLS)
-- ever touches them.

drop policy if exists "Users can insert own stores" on public.stores;
create policy "Users can insert own stores" on public.stores for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own stores" on public.stores;
create policy "Users can update own stores" on public.stores for update using (auth.uid() = user_id);
drop policy if exists "Users can view own stores" on public.stores;
create policy "Users can view own stores" on public.stores for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (id = auth.uid());
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can manage their own store settings" on public.store_settings;
create policy "Users can manage their own store settings" on public.store_settings for all
  using (store_id in (select id from public.stores where user_id = auth.uid()))
  with check (store_id in (select id from public.stores where user_id = auth.uid()));
drop policy if exists "Users can update own store settings" on public.store_settings;
create policy "Users can update own store settings" on public.store_settings for update
  using (store_id in (select id from public.stores where user_id = auth.uid()));
drop policy if exists "Users can view own store settings" on public.store_settings;
create policy "Users can view own store settings" on public.store_settings for select
  using (store_id in (select id from public.stores where user_id = auth.uid()));
-- Note: the "manage" (ALL) policy already covers update/view; the two
-- narrower policies are redundant leftovers, preserved to match live
-- reality exactly.

drop policy if exists "Merchants can update own tickets" on public.tickets;
create policy "Merchants can update own tickets" on public.tickets for update
  using (exists (select 1 from public.stores where stores.id = tickets.store_id and stores.user_id = auth.uid()));
drop policy if exists "Users can insert own tickets" on public.tickets;
create policy "Users can insert own tickets" on public.tickets for insert
  with check (store_id in (select id from public.stores where user_id = auth.uid()));
drop policy if exists "Users can update own tickets" on public.tickets;
create policy "Users can update own tickets" on public.tickets for update
  using (store_id in (select id from public.stores where user_id = auth.uid()));
drop policy if exists "Users can view own tickets" on public.tickets;
create policy "Users can view own tickets" on public.tickets for select
  using (store_id in (select id from public.stores where user_id = auth.uid()));

drop policy if exists "Users can insert own carts" on public.carts;
create policy "Users can insert own carts" on public.carts for insert
  with check (store_id in (select id from public.stores where user_id = auth.uid()));
drop policy if exists "Users can update own carts" on public.carts;
create policy "Users can update own carts" on public.carts for update
  using (store_id in (select id from public.stores where user_id = auth.uid()));
drop policy if exists "Users can view own carts" on public.carts;
create policy "Users can view own carts" on public.carts for select
  using (store_id in (select id from public.stores where user_id = auth.uid()));

drop policy if exists "Users can insert own returns" on public.returns;
create policy "Users can insert own returns" on public.returns for insert
  with check (store_id in (select id from public.stores where user_id = auth.uid()));
drop policy if exists "Users can update own returns" on public.returns;
create policy "Users can update own returns" on public.returns for update
  using (store_id in (select id from public.stores where user_id = auth.uid()));
drop policy if exists "Users can view own returns" on public.returns;
create policy "Users can view own returns" on public.returns for select
  using (store_id in (select id from public.stores where user_id = auth.uid()));

drop policy if exists scheduled_messages_insert_own on public.scheduled_messages;
create policy scheduled_messages_insert_own on public.scheduled_messages for insert to authenticated
  with check (store_id in (select id from public.stores where user_id = auth.uid()));
drop policy if exists scheduled_messages_select_own on public.scheduled_messages;
create policy scheduled_messages_select_own on public.scheduled_messages for select to authenticated
  using (store_id in (select id from public.stores where user_id = auth.uid()));
drop policy if exists scheduled_messages_update_own on public.scheduled_messages;
create policy scheduled_messages_update_own on public.scheduled_messages for update to authenticated
  using (store_id in (select id from public.stores where user_id = auth.uid()))
  with check (store_id in (select id from public.stores where user_id = auth.uid()));

drop policy if exists "Users can insert own audit log" on public.audit_log;
create policy "Users can insert own audit log" on public.audit_log for insert with check (auth.uid() = user_id);
drop policy if exists "Users can view own audit log" on public.audit_log;
create policy "Users can view own audit log" on public.audit_log for select using (auth.uid() = user_id);

drop policy if exists "Allow public insert" on public.newsletter_subscribers;
create policy "Allow public insert" on public.newsletter_subscribers for insert to anon with check (true);

drop policy if exists "Admins can update all requests" on public.support_requests;
create policy "Admins can update all requests" on public.support_requests for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "Admins can view all requests" on public.support_requests;
create policy "Admins can view all requests" on public.support_requests for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "Merchants can insert own requests" on public.support_requests;
create policy "Merchants can insert own requests" on public.support_requests for insert with check (auth.uid() = user_id);
drop policy if exists "Merchants can view own requests" on public.support_requests;
create policy "Merchants can view own requests" on public.support_requests for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Grants (meaningful CRUD verbs only — see header note)
-- ---------------------------------------------------------------------

grant select, insert, update on public.stores to authenticated;
grant select, insert, update, delete on public.stores to service_role;

grant select, insert, update on public.profiles to authenticated;
grant select on public.profiles to service_role;
-- FLAG: service_role currently lacks UPDATE on profiles. The Lemon
-- Squeezy billing webhook needs to update plan_status — worth confirming
-- this isn't silently broken.

grant select, insert, update on public.store_settings to authenticated;
grant select, insert, update on public.store_settings to service_role;

grant select, insert, update on public.tickets to authenticated;
grant select, insert, update on public.tickets to service_role;

grant select on public.carts to authenticated;
grant select, insert, update on public.carts to service_role;

grant select, insert, update on public.returns to authenticated;
grant select, insert, update on public.returns to service_role;

grant select, insert, update, delete on public.scheduled_messages to authenticated;
grant select, insert, update, delete on public.scheduled_messages to service_role;

grant select, insert on public.shop_trials to service_role;

-- FLAG: audit_log has no working CRUD grants for authenticated or
-- service_role today — RLS policies exist but the base table grants that
-- would make them usable do not. Appears to be an unused/incomplete
-- feature rather than an active bug.

grant insert on public.newsletter_subscribers to authenticated;
-- FLAG: anon role grants were never queried during this recon. The
-- landing-page signup form likely runs unauthenticated — worth confirming
-- anon actually has INSERT here too.

grant select, insert, update on public.support_requests to authenticated;

grant select, insert, update, delete on public.store_ticket_counters to authenticated;
grant select, insert, update, delete on public.store_ticket_counters to service_role;

grant select, insert, update, delete on public.ai_rate_limits to service_role;

grant execute on function public.claim_due_scheduled_messages(int) to service_role;
grant execute on function public.check_and_increment_rate_limit(text, integer, integer) to service_role;

-- ---------------------------------------------------------------------
-- NOT included in this file (deliberately):
-- The pg_cron job registration for scheduler-tick contains CRON_SECRET
-- in plaintext and must never be committed to version control. Re-run
-- manually via the SQL Editor if ever rebuilding from scratch — see
-- project history for the exact statement.
-- ---------------------------------------------------------------------
