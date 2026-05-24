"""First-time database setup for VISR.

Runs ``db/schema.sql`` then ``db/seed.sql`` against the Supabase Postgres
instance configured in ``.env.local``. Idempotent: re-running is safe -
schema uses ``create table if not exists`` and seed uses
``truncate ... cascade``.

Requirements
------------
- Python 3.10+
- ``pip install psycopg2-binary python-dotenv``
- A ``DATABASE_URL`` (or ``SUPABASE_DB_URL``) entry in ``.env.local`` of the
  form::

      DATABASE_URL=postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres

  Get the password from Supabase Dashboard -> Settings -> Database.

Usage
-----
    python scripts/db_setup.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

try:
    import psycopg2  # type: ignore
except ImportError:  # pragma: no cover
    sys.stderr.write(
        "ERROR: psycopg2 is not installed.\n"
        "Run: pip install psycopg2-binary python-dotenv\n"
    )
    raise

try:
    from dotenv import load_dotenv  # type: ignore
except ImportError:  # pragma: no cover
    sys.stderr.write(
        "ERROR: python-dotenv is not installed.\n"
        "Run: pip install psycopg2-binary python-dotenv\n"
    )
    raise


ROOT = Path(__file__).resolve().parents[1]
DB_DIR = ROOT / "db"
SCHEMA_PATH = DB_DIR / "schema.sql"
SEED_PATH = DB_DIR / "seed.sql"


def db_url() -> str:
    load_dotenv(ROOT / ".env.local")
    url = os.environ.get("DATABASE_URL") or os.environ.get("SUPABASE_DB_URL")
    if not url:
        sys.stderr.write(
            "ERROR: DATABASE_URL (or SUPABASE_DB_URL) is not set in .env.local\n"
            "Add a line like:\n"
            "  DATABASE_URL=postgresql://postgres:<PASSWORD>"
            "@db.<PROJECT_REF>.supabase.co:5432/postgres\n"
        )
        sys.exit(1)
    return url


def run_sql_file(cur, path: Path) -> None:
    if not path.is_file():
        sys.stderr.write(f"ERROR: missing SQL file: {path}\n")
        sys.exit(1)
    print(f"-> Running {path.relative_to(ROOT)}")
    cur.execute(path.read_text(encoding="utf-8"))


def main() -> int:
    url = db_url()
    print(f"Connecting to {url.split('@')[-1] if '@' in url else url} ...")
    conn = psycopg2.connect(url)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            run_sql_file(cur, SCHEMA_PATH)
            run_sql_file(cur, SEED_PATH)
        print("OK - database created and seeded.")
    finally:
        conn.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
