-- =============================================================
-- Pathwise (merged): StraighterNoodles + Strategy
-- Consolidated Supabase schema (May 2026)
-- -------------------------------------------------------------
-- Idempotent: safe to run on a fresh DB or an existing one.
-- This file is the single source of truth - no legacy migration
-- files are kept. If you need to evolve the schema, edit here
-- and re-run db_setup.py.
--
-- Section A: StraighterNoodles (perspective 1, daily flow)
-- Section B: Pathwise Strategy (perspective 2, big picture)
-- =============================================================

-- =============================================================
-- Section A - StraighterNoodles
-- =============================================================

-- -------------------------------------------------------------
-- events
-- -------------------------------------------------------------
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  location text,
  location_id uuid,
  auto_transit boolean not null default false,
  is_recurring boolean not null default false,
  recurrence_rule text,
  notes text,
  note_status text,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Drop legacy hard-coded category CHECK constraints (custom
-- categories rely on free-form text).
alter table events drop constraint if exists events_category_check;

-- -------------------------------------------------------------
-- items
-- -------------------------------------------------------------
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- event_items (M2M: items linked to a specific event)
-- -------------------------------------------------------------
create table if not exists event_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  is_one_time boolean not null default false
);

-- -------------------------------------------------------------
-- category_default_items (auto-pack rules per category)
-- -------------------------------------------------------------
create table if not exists category_default_items (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  item_id uuid not null references items(id) on delete cascade
);

alter table category_default_items
  drop constraint if exists category_default_items_category_check;

-- -------------------------------------------------------------
-- saved_locations
-- -------------------------------------------------------------
create table if not exists saved_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  location_type text,
  transit_minutes integer not null default 0,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'events_location_id_fkey'
  ) then
    alter table events add constraint events_location_id_fkey
      foreign key (location_id) references saved_locations(id) on delete set null;
  end if;
end$$;

-- -------------------------------------------------------------
-- user_settings (single-row config in MVP)
-- -------------------------------------------------------------
create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  city text not null default '',
  country text not null default '',
  country_code text not null default '',
  timezone text not null default 'UTC',
  wake_time time not null default '07:00',
  sleep_time time not null default '23:00',
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- routines (with forward-only delete via ends_on)
-- -------------------------------------------------------------
create table if not exists routines (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'personal',
  frequency text not null default 'daily',
  interval_days integer not null default 1,
  preferred_time time,
  last_completed timestamptz,
  next_due timestamptz default now(),
  active boolean not null default true,
  ends_on date,
  created_at timestamptz not null default now()
);

alter table routines add column if not exists ends_on date;

-- -------------------------------------------------------------
-- custom_categories (user-defined category slugs)
-- -------------------------------------------------------------
create table if not exists custom_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  label text not null,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- personal_time_blocks (scheduler avoids these windows)
-- -------------------------------------------------------------
create table if not exists personal_time_blocks (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  weekday smallint,
  specific_date date,
  start_time time not null,
  end_time time not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (weekday is null or (weekday >= 0 and weekday <= 6)),
  check (weekday is not null or specific_date is not null)
);

-- -------------------------------------------------------------
-- manual_checklist_items (user-added one-offs per day)
-- -------------------------------------------------------------
create table if not exists manual_checklist_items (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  for_date date not null,
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- Indexes
-- -------------------------------------------------------------
create index if not exists idx_events_start_time on events(start_time);
create index if not exists idx_events_category on events(category);
create index if not exists idx_events_location_id on events(location_id);
create index if not exists idx_event_items_event_id on event_items(event_id);
create index if not exists idx_category_defaults_category on category_default_items(category);
create index if not exists idx_saved_locations_type on saved_locations(location_type);
create index if not exists idx_routines_next_due on routines(next_due);
create index if not exists idx_routines_active on routines(active);
create index if not exists idx_personal_time_weekday on personal_time_blocks(weekday);
create index if not exists idx_personal_time_specific_date on personal_time_blocks(specific_date);
create index if not exists idx_manual_checklist_for_date on manual_checklist_items(for_date);

-- -------------------------------------------------------------
-- Row Level Security
-- (Permissive: MVP / single-tenant demo. Tighten for prod.)
-- -------------------------------------------------------------
alter table events enable row level security;
alter table items enable row level security;
alter table event_items enable row level security;
alter table category_default_items enable row level security;
alter table saved_locations enable row level security;
alter table user_settings enable row level security;
alter table routines enable row level security;
alter table custom_categories enable row level security;
alter table personal_time_blocks enable row level security;
alter table manual_checklist_items enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'events', 'items', 'event_items', 'category_default_items',
    'saved_locations', 'user_settings', 'routines', 'custom_categories',
    'personal_time_blocks', 'manual_checklist_items'
  ]) loop
    if not exists (
      select 1 from pg_policies
      where tablename = t and policyname = 'Allow all on ' || t
    ) then
      execute format(
        'create policy %I on %I for all using (true) with check (true)',
        'Allow all on ' || t, t
      );
    end if;
  end loop;
end$$;

-- =============================================================
-- Section B - Pathwise Strategy
-- -------------------------------------------------------------
-- Stores the onboarding profile, generated strategy plan, and
-- opportunity checks. The plan and per-plan UI state both live
-- inside JSONB for fast iteration during the hackathon.
-- =============================================================

create table if not exists student_profiles (
  id uuid primary key,
  degree text not null default '',
  year text not null default '',
  university text not null default '',
  target_goal text not null default '',
  courses jsonb not null default '[]'::jsonb,
  commitments jsonb not null default '[]'::jsonb,
  work_hours_per_week integer not null default 0,
  constraints jsonb not null default '[]'::jsonb,
  brain_dump text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists strategy_plans (
  id uuid primary key,
  student_id uuid references student_profiles(id) on delete set null,
  plan jsonb not null,
  state jsonb not null default '{}'::jsonb,
  last_reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists opportunity_checks (
  id uuid primary key,
  plan_id uuid references strategy_plans(id) on delete cascade,
  opportunity_text text,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_strategy_plans_student on strategy_plans(student_id);
create index if not exists idx_opportunity_checks_plan on opportunity_checks(plan_id);

alter table student_profiles enable row level security;
alter table strategy_plans enable row level security;
alter table opportunity_checks enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'student_profiles', 'strategy_plans', 'opportunity_checks'
  ]) loop
    if not exists (
      select 1 from pg_policies
      where tablename = t and policyname = 'Allow all on ' || t
    ) then
      execute format(
        'create policy %I on %I for all using (true) with check (true)',
        'Allow all on ' || t, t
      );
    end if;
  end loop;
end$$;
