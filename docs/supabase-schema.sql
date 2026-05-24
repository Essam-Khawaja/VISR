create table if not exists student_profiles (
  id uuid primary key,
  degree text not null,
  year text not null,
  university text not null,
  target_goal text not null,
  courses jsonb not null default '[]'::jsonb,
  commitments jsonb not null default '[]'::jsonb,
  work_hours_per_week integer not null default 0,
  constraints text not null default '',
  brain_dump text not null,
  created_at timestamp default now()
);

create table if not exists strategy_plans (
  id uuid primary key,
  student_id uuid references student_profiles(id),
  plan jsonb not null,
  created_at timestamp default now()
);

create table if not exists opportunity_checks (
  id uuid primary key,
  plan_id uuid references strategy_plans(id),
  opportunity_text text,
  check jsonb not null,
  created_at timestamp default now()
);
