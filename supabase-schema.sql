-- StraighterNoodles Supabase Schema (full clean install)
-- For a fresh database, run this in the Supabase SQL Editor.
-- If you already ran the v1 schema, run supabase-migration-v2.sql instead.

-- Events table
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null check (category in (
    'class', 'meeting', 'assignment', 'project', 'club',
    'transit', 'grocery', 'gym', 'break', 'personal', 'social', 'errand'
  )),
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

-- Items table
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text,
  created_at timestamptz not null default now()
);

-- Event-Item mapping
create table if not exists event_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  is_one_time boolean not null default false
);

-- Category default items
create table if not exists category_default_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in (
    'class', 'meeting', 'assignment', 'project', 'club',
    'transit', 'grocery', 'gym', 'break', 'personal', 'social', 'errand'
  )),
  item_id uuid not null references items(id) on delete cascade
);

-- Saved locations (university, work, home, gym, etc.)
create table if not exists saved_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  location_type text,
  transit_minutes integer not null default 0,
  created_at timestamptz not null default now()
);

-- Add FK from events.location_id -> saved_locations (deferred so order doesn't matter)
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

-- User settings (single row for MVP)
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

-- Indexes
create index if not exists idx_events_start_time on events(start_time);
create index if not exists idx_events_category on events(category);
create index if not exists idx_events_location_id on events(location_id);
create index if not exists idx_event_items_event_id on event_items(event_id);
create index if not exists idx_category_defaults_category on category_default_items(category);
create index if not exists idx_saved_locations_type on saved_locations(location_type);

-- RLS
alter table events enable row level security;
alter table items enable row level security;
alter table event_items enable row level security;
alter table category_default_items enable row level security;
alter table saved_locations enable row level security;
alter table user_settings enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'events' and policyname = 'Allow all on events') then
    create policy "Allow all on events" on events for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'items' and policyname = 'Allow all on items') then
    create policy "Allow all on items" on items for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'event_items' and policyname = 'Allow all on event_items') then
    create policy "Allow all on event_items" on event_items for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'category_default_items' and policyname = 'Allow all on category_default_items') then
    create policy "Allow all on category_default_items" on category_default_items for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'saved_locations' and policyname = 'Allow all on saved_locations') then
    create policy "Allow all on saved_locations" on saved_locations for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'user_settings' and policyname = 'Allow all on user_settings') then
    create policy "Allow all on user_settings" on user_settings for all using (true) with check (true);
  end if;
end$$;

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
  created_at timestamptz not null default now()
);

alter table routines enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'routines' and policyname = 'Allow all on routines') then
    create policy "Allow all on routines" on routines for all using (true) with check (true);
  end if;
end$$;

create index if not exists idx_routines_next_due on routines(next_due);
create index if not exists idx_routines_active on routines(active);
