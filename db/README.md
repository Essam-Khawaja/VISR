# Database

This folder is the source of truth for the merged Pathwise Supabase schema
and the StraighterNoodles demo dataset.

```
db/
  schema.sql   - all tables, indexes, RLS (idempotent)
  seed.sql     - wipe + repopulate the StraighterNoodles showcase dataset
```

The schema covers two perspectives that share the same Supabase project:

- **Section A: StraighterNoodles** (perspective 1, `/1/*`): events, items,
  routines, weather/location settings, personal time blocks, etc.
- **Section B: Pathwise Strategy** (perspective 2, `/2/*`): student profiles,
  generated strategy plans (with a `state jsonb` column for per-user UI
  state), and opportunity check history.

## Python helpers

The `scripts/` folder has two thin Python wrappers around these SQL files:

| Script                 | Use it for                                 |
| ---------------------- | ------------------------------------------ |
| `scripts/db_setup.py`  | First-time setup. Runs schema then seed.   |
| `scripts/db_reseed.py` | Reset to a clean showcase. Seed only.      |

Both read `DATABASE_URL` (or `SUPABASE_DB_URL`) from `.env.local`. Get the
value from Supabase Dashboard -> Settings -> Database:

```
DATABASE_URL=postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres
```

Install deps once: `pip install -r scripts/requirements.txt`

## Applying after the merge

After pulling the merged tree, run `python scripts/db_setup.py` once to
create the new strategy tables (`student_profiles`, `strategy_plans`,
`opportunity_checks`). It's idempotent so existing StraighterNoodles data
is preserved.

If you can't run the Python helper, you can also paste the contents of
`db/schema.sql` directly into the Supabase SQL editor and click Run.

## How the Pathwise Strategy state syncs

The Strategy perspective (`/2/*`) uses Supabase as the source of truth with
`localStorage` as a write-through cache:

- **Reads**: the dashboard paints from `localStorage` immediately, then
  background-refreshes from `strategy_plans` once Supabase responds.
- **Writes**: every mutation (action state, opportunity outcome, new task)
  updates `localStorage` synchronously and upserts the same row into
  Supabase in the background.
- **Migration**: on first mount, `migrateLocalToSupabase()` pushes any
  pre-existing local plans up to `strategy_plans`. Idempotent, gated by
  the `pathwise.migrated.v1` flag.

The demo plan (`demo-cs-student-001`) intentionally bypasses Supabase and
loads from the static fixture so the demo path stays fast and offline-safe.

## Editing the schema

Make changes in `db/schema.sql` only. The file is idempotent
(`create table if not exists`, `alter table ... if not exists`), so
re-running `scripts/db_setup.py` will pick up most changes without dropping
data.

For destructive changes you may need to drop the affected table by hand in
the Supabase SQL editor first, then re-run `scripts/db_setup.py`.
