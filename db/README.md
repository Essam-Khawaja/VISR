# Database

This folder is the source of truth for the Pathwise / StraighterNoodles
Supabase schema and demo dataset.

```
db/
  schema.sql   - all tables, indexes, RLS (idempotent)
  seed.sql     - wipe + repopulate showcase dataset (idempotent)
```

## Python helpers

The `scripts/` folder has two thin Python wrappers around these SQL files:

| Script                   | Use it for                                   |
| ------------------------ | -------------------------------------------- |
| `scripts/db_setup.py`    | First-time setup. Runs schema then seed.     |
| `scripts/db_reseed.py`   | Reset to a clean showcase. Seed only.        |

Both read `DATABASE_URL` (or `SUPABASE_DB_URL`) from `.env.local`. Get the
value from Supabase Dashboard -> Settings -> Database:

```
DATABASE_URL=postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres
```

Install deps once: `pip install -r scripts/requirements.txt`

## Editing the schema

Make changes in `db/schema.sql` only. The file is idempotent
(`create table if not exists`, `alter table ... if not exists`), so re-running
`scripts/db_setup.py` will pick up most changes without dropping data.

For destructive changes you may need to drop the affected table by hand in the
Supabase SQL editor first, then re-run `scripts/db_setup.py`.
