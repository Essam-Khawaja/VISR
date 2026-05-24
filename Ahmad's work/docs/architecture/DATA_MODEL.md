# Data Model

All tables live in Supabase Postgres. Single source of truth: `db/schema.sql` (idempotent). Seed: `db/seed.sql`. Both are runnable via `scripts/db_setup.py` (first-time) and `scripts/db_reseed.py` (reset).

## Categories
`EventCategory` is a TypeScript union; the DB stores it as `text` (the legacy `CHECK` constraint has been dropped on both `events.category` and `category_default_items.category` so user-defined custom categories work).

Built-in categories:
`class`, `meeting`, `assignment`, `project`, `club`, `transit`, `grocery`, `gym`, `break`, `personal`, `personal_time`, `social`, `errand`.

Notes:
- `personal_time` is a reserved internal category used to render `PersonalTimeBlock` phantoms on the timeline/week view; it is not user-selectable in the event form.
- Anything else stored in `events.category` is treated as a custom category and styled with a generic tag fallback unless it has a matching entry in `custom_categories`.

## Entities

### TimelineEvent (`events`)
```ts
type TimelineEvent = {
  id: string;
  title: string;
  description: string | null;
  category: EventCategory;       // string in DB; widened above
  start_time: string;             // timestamptz
  end_time: string;
  location: string | null;
  location_id: string | null;    // FK -> saved_locations
  auto_transit: boolean;
  is_recurring: boolean;
  recurrence_rule: string | null;
  notes: string | null;
  note_status: NoteStatus | null; // "unresolved" | "follow_up" | "important" | "completed" | null
  completed: boolean;
  created_at: string;
};
```

### Item (`items`)
```ts
type Item = { id: string; name: string; icon: string | null; created_at: string };
```

### EventItem (`event_items`)
```ts
type EventItem = {
  id: string;
  event_id: string;
  item_id: string;
  is_one_time: boolean;
};
```
Join table linking items to events. `is_one_time = true` means "carry this only for that event"; `false` means "always relevant to this event's category" (still useful for ad-hoc overrides).

### CategoryDefaultItem (`category_default_items`)
```ts
type CategoryDefaultItem = { id: string; category: string; item_id: string };
```
Per-category default packing lists. `category` is now `text` and may reference a custom category by name.

### CustomCategory (`custom_categories`)
```ts
type CustomCategory = { id: string; name: string; label: string; created_at: string };
```
User-defined categories that surface in `DefaultsManager`. `name` is a slug (kebab/snake case) used as the actual `category` value on events; `label` is the human-readable name.

### PersonalTimeBlock (`personal_time_blocks`)
```ts
type PersonalTimeBlock = {
  id: string;
  label: string;
  weekday: number | null;          // 0-6, mutually exclusive with specific_date
  specific_date: string | null;    // YYYY-MM-DD
  start_time: string;              // HH:MM:SS
  end_time: string;
  active: boolean;
  created_at: string;
};
```
Time the user is unavailable. Used to (a) shrink the slots the free-time finder returns, (b) render purple phantom blocks on the timeline and week view, (c) push reschedule suggestions away from sacred time.

### ManualChecklistItem (`manual_checklist_items`)
```ts
type ManualChecklistItem = {
  id: string;
  item_name: string;
  for_date: string;       // YYYY-MM-DD
  checked: boolean;
  created_at: string;
};
```
Free-form items the user adds directly to a single day's "Before You Leave" list.

### SavedLocation (`saved_locations`)
```ts
type SavedLocation = {
  id: string;
  name: string;
  address: string | null;
  location_type: "home" | "university" | "gym" | "grocery" | "office" | "other";
  transit_minutes: number;
  created_at: string;
};
```
`location_type = "home"` is special-cased: events bound to it are excluded from "leaving home" logic.

### Routine (`routines`)
```ts
type Routine = {
  id: string;
  title: string;
  description: string | null;
  category: EventCategory;
  frequency: "daily" | "weekly" | "monthly" | "every_n_days";
  interval_days: number | null;       // used when frequency = every_n_days
  preferred_time: string | null;
  next_due: string;
  last_completed: string | null;
  ends_on: string | null;             // YYYY-MM-DD; "stop scheduling after this date"
  active: boolean;
  created_at: string;
};
```
- `monthly` advances by calendar month (not 30d) when `mark_complete` is called.
- "Delete from this day forward" sets `ends_on = from_date - 1` instead of hard-deleting, preserving past completions.

### UserSettings (`user_settings`)
```ts
type UserSettings = {
  id: string;
  city: string;
  country_code: string;
  timezone: string;            // IANA, e.g. "America/Edmonton"
  wake_time: string;           // HH:MM:SS
  sleep_time: string;          // HH:MM:SS
  voice_briefing_enabled: boolean;
  created_at: string;
};
```
Singleton row (created on first GET).

## Relationships
- `events.location_id -> saved_locations.id`
- `event_items.event_id -> events.id` (`on delete cascade`)
- `event_items.item_id -> items.id` (`on delete cascade`)
- `category_default_items.item_id -> items.id` (`on delete cascade`)

## RLS
Open `using (true) with check (true)` for the hackathon demo. The audit notes a P0 to lock this down per-user before production.
