-- =============================================================================
-- PRESENTATION PLATFORM — shared, multi-event schema
-- Run ONCE per Supabase project. Every deck/session shares these tables and is
-- kept apart by an `event` slug (set as `event` in each deck's config.js).
-- Because every row carries `event`, exported leads always know which
-- presentation/session they came from.
--   Dashboard → SQL Editor → paste → Run. Then copy the project URL + publishable
--   key into app/config.js (once — all decks reuse them).
--
-- Tables:
--   pres_leads     registrations (insert-only from the room; never anon-readable)
--   pres_answers   one row per event+device+checkpoint (upsert on edit)
--   pres_questions live Q&A feed
--   pres_state     the gate — one row per event (highest checkpoint you've opened)
-- =============================================================================

create table if not exists public.pres_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null,
  device_id text not null,
  name text not null, company text not null, email text not null, role text,
  unique (event, device_id)
);

create table if not exists public.pres_answers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null,
  device_id text not null,
  checkpoint text not null,
  answer jsonb not null,
  unique (event, device_id, checkpoint)
);

create table if not exists public.pres_questions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null,
  device_id text not null,
  name text, company text, text text not null,
  answered boolean not null default false
);

create table if not exists public.pres_state (
  event text primary key,
  open_checkpoint integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists pres_answers_event_idx on public.pres_answers (event);
create index if not exists pres_questions_event_idx on public.pres_questions (event, created_at desc);

-- =============================================================================
-- Row Level Security (permissive anon model for a live-room tool)
-- =============================================================================
alter table public.pres_leads     enable row level security;
alter table public.pres_answers   enable row level security;
alter table public.pres_questions enable row level security;
alter table public.pres_state     enable row level security;

-- leads: room can register; not anon-readable (export from Dashboard, filter by event)
drop policy if exists pres_leads_insert on public.pres_leads;
create policy pres_leads_insert on public.pres_leads for insert to anon with check (true);

drop policy if exists pres_answers_insert on public.pres_answers;
create policy pres_answers_insert on public.pres_answers for insert to anon with check (true);
drop policy if exists pres_answers_update on public.pres_answers;
create policy pres_answers_update on public.pres_answers for update to anon using (true) with check (true);
drop policy if exists pres_answers_select on public.pres_answers;
create policy pres_answers_select on public.pres_answers for select to anon using (true);

drop policy if exists pres_questions_insert on public.pres_questions;
create policy pres_questions_insert on public.pres_questions for insert to anon with check (true);
drop policy if exists pres_questions_update on public.pres_questions;
create policy pres_questions_update on public.pres_questions for update to anon using (true) with check (true);
drop policy if exists pres_questions_select on public.pres_questions;
create policy pres_questions_select on public.pres_questions for select to anon using (true);

drop policy if exists pres_state_insert on public.pres_state;
create policy pres_state_insert on public.pres_state for insert to anon with check (true);
drop policy if exists pres_state_update on public.pres_state;
create policy pres_state_update on public.pres_state for update to anon using (true) with check (true);
drop policy if exists pres_state_select on public.pres_state;
create policy pres_state_select on public.pres_state for select to anon using (true);

-- =============================================================================
-- Per-event helpers
--   Export one event's leads:
--     select * from public.pres_leads where event = 'your-event-slug-2026';
--   Reset one event's room (keeps other events untouched):
--     delete from public.pres_leads     where event = 'your-event-slug-2026';
--     delete from public.pres_answers   where event = 'your-event-slug-2026';
--     delete from public.pres_questions where event = 'your-event-slug-2026';
--     update public.pres_state set open_checkpoint = 0 where event = 'your-event-slug-2026';
-- =============================================================================
