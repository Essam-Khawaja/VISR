# TECH SPEC: Supabase Persistence and API

## Files

```text
lib/supabase.ts
app/api/generate/route.ts
app/api/opportunity/route.ts
app/api/plan/[planId]/route.ts
docs/architecture/DATA_MODEL.md
```

## Schema

The canonical schema is defined in `docs/features/000-project-foundation-and-data-contract/TECH_SPEC.md`. It is repeated here only as an implementation reference.

```sql
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
```

## Client Architecture

`lib/supabase.ts` may expose:

- `createBrowserSupabaseClient` using public anon variables if client reads are needed.
- `createServerSupabaseClient` using anon or service role depending on API route needs.

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.

## Mapping Architecture

Use helper functions when mapping grows:

```ts
profileToRow(profile)
rowToProfile(row)
rowToStrategyPlan(row)
rowToOpportunityCheck(row)
```

For MVP, direct route-local mapping is acceptable if it stays small.

## RLS

Hackathon MVP can use permissive policies or disabled RLS. Before production, add Supabase Auth and row-level security.
