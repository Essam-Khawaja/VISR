"""Reset app data and reseed the showcase dataset.

Runs ``db/seed.sql`` only - assumes ``db/schema.sql`` has already been
applied (use ``scripts/db_setup.py`` first if the database is fresh).
Wipes ``events``, ``items``, ``saved_locations``, ``routines``,
``manual_checklist_items``, ``custom_categories``, ``personal_time_blocks``
and reinserts the demo data. ``user_settings`` is preserved.

Usage
-----
    python scripts/db_reseed.py
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
SEED_PATH = ROOT / "db" / "seed.sql"


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


def main() -> int:
    if not SEED_PATH.is_file():
        sys.stderr.write(f"ERROR: missing SQL file: {SEED_PATH}\n")
        sys.exit(1)

    url = db_url()
    print(f"Connecting to {url.split('@')[-1] if '@' in url else url} ...")
    conn = psycopg2.connect(url)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            print(f"-> Reseeding from {SEED_PATH.relative_to(ROOT)}")
            cur.execute(SEED_PATH.read_text(encoding="utf-8"))
        print("OK - reseed complete.")
    finally:
        conn.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
