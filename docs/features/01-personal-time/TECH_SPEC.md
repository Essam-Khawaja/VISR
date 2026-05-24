# Personal Time Blocks - Tech Spec

## Data
New table `personal_time_blocks` (`label`, `weekday`, `specific_date`, `start_time`, `end_time`, `active`, `created_at`). Exactly one of `weekday` / `specific_date` is set.

## API
- `/api/personal-time` GET/POST/PATCH/DELETE - thin CRUD.
- `/api/free-time` GET - fetches blocks once per call, expands those matching the requested date into phantom `TimelineEvent`s via `blocksToPhantomEvents`, then feeds them into the existing `findFreeSlots`.

## UI
- `PersonalTimeManager` in Settings (uses `DatePicker` for specific dates, `TimePicker` for start/end).
- Dashboard `page.tsx` fetches blocks at boot, computes `personalPhantoms` via `useMemo`, merges with real events for the timeline only (not BYL / voice).
- `week/page.tsx` does the same per-day.

## Rendering
- New `personal_time` entry in `CATEGORY_CONFIG` (purple gradient, Moon icon).
- Filtered out of the EventForm category picker so it stays internal.
- Phantom IDs start with `personal-` so callbacks (`onEdit`, `onDelete`, `onToggleComplete`) early-return.
