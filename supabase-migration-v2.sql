-- StraighterNoodles Migration v2
-- Run this in Supabase SQL Editor to update your schema.
-- Safe to re-run; uses IF NOT EXISTS where possible.

-- 1. Add sleep_time and country (full name) to user_settings
alter table user_settings add column if not exists sleep_time time not null default '23:00';
alter table user_settings add column if not exists country text not null default '';

-- 2. Saved locations (university, work, home, gym, etc.)
create table if not exists saved_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  location_type text,
  transit_minutes integer not null default 0,
  created_at timestamptz not null default now()
);

-- 3. Add location_id to events (still keep location text for free-form)
alter table events add column if not exists location_id uuid references saved_locations(id) on delete set null;
alter table events add column if not exists auto_transit boolean not null default false;

-- 4. Note status on events (for unresolved/follow-up/important tracking)
alter table events add column if not exists note_status text;

-- 5. RLS for saved_locations
alter table saved_locations enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'saved_locations' and policyname = 'Allow all on saved_locations'
  ) then
    create policy "Allow all on saved_locations" on saved_locations for all using (true) with check (true);
  end if;
end$$;

-- 6. Index for queries
create index if not exists idx_saved_locations_type on saved_locations(location_type);
create index if not exists idx_events_location_id on events(location_id);
