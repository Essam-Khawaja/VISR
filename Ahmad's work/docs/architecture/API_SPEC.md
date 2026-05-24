## API Spec

All endpoints live under `/api/*` and are Next.js Route Handlers backed by Supabase. Bodies are JSON unless noted.

### Conventions
- Errors: `400` for validation, `404` for missing, `500` for internal failures, body `{ error: string }`.
- PATCH endpoints only accept a whitelisted set of fields per resource.
- All dates are ISO strings unless explicitly `YYYY-MM-DD`.

---

### `GET /api/events`
Returns events for a date or date range, anchored on the configured user timezone.

**Query Params:**
- `date` (YYYY-MM-DD, default today)
- `date_end` (YYYY-MM-DD, default `date`)
- `incomplete_only` ("true" to filter to incomplete events)

**Response:** `TimelineEvent[]`

### `POST /api/events`
Creates a new event. Required: `title`, `category`, `start_time`, `end_time`.

### `PATCH /api/events`
Whitelisted fields: `title`, `description`, `category`, `start_time`, `end_time`, `location`, `location_id`, `auto_transit`, `is_recurring`, `recurrence_rule`, `notes`, `note_status`, `completed`.

### `DELETE /api/events?id=...`

---

### `GET /api/items`
Returns all items.

### `POST /api/items`
Body: `{ name: string; icon?: string }`. Inserts or returns the existing match (case-insensitive on `name`).

---

### `GET /api/event-items`
**Query Params:** one of:
- `event_id` (uuid) - links for a single event
- `event_ids` (comma-separated uuids) - bulk links for many events (used by the dashboard to avoid N+1)

### `POST /api/event-items`
Body: `{ event_id, item_id, is_one_time? }`. Idempotent on `(event_id, item_id)`.

### `DELETE /api/event-items?id=...`

---

### `GET /api/category-defaults`
Returns `CategoryDefaultItem[]`.

### `POST /api/category-defaults`
Body: `{ category: string; item_id: string }`. Idempotent.

### `DELETE /api/category-defaults?category=...&item_id=...`

---

### `GET /api/custom-categories`
Returns `CustomCategory[]`.

### `POST /api/custom-categories`
Body: `{ name: string; label: string }`. `name` is slugified server-side.

### `DELETE /api/custom-categories?id=...`

---

### `GET /api/personal-time`
Returns `PersonalTimeBlock[]` (blocks that the scheduler and free-time finder will skip).

### `POST /api/personal-time`
Body: `{ label, weekday?: 0-6, specific_date?: YYYY-MM-DD, start_time: HH:MM, end_time: HH:MM, active?: boolean }`. Exactly one of `weekday` or `specific_date` should be set.

### `PATCH /api/personal-time`
Body: `{ id, ...fields }`.

### `DELETE /api/personal-time?id=...`

---

### `GET /api/manual-checklist`
**Query Params:** `date` (YYYY-MM-DD, optional). Returns `ManualChecklistItem[]`.

### `POST /api/manual-checklist`
Body: `{ item_name: string (1-200 chars), for_date: YYYY-MM-DD }`.

### `PATCH /api/manual-checklist`
Body: `{ id, checked?, item_name? }` (whitelisted).

### `DELETE /api/manual-checklist?id=...`

---

### `GET /api/saved-locations`
Returns `SavedLocation[]`.

### `POST /api/saved-locations`
Body: `{ name, address?, location_type, transit_minutes }`.

### `PATCH /api/saved-locations`
Body: `{ id, ...fields }`.

### `DELETE /api/saved-locations?id=...`

---

### `GET /api/routines`
Returns `Routine[]` ordered by `next_due`.

### `POST /api/routines`
Body: `{ title, description?, category?, frequency, interval_days?, preferred_time? }`.

### `PATCH /api/routines`
- `{ id, mark_complete: true }` - records a completion and advances `next_due` (calendar-aware for `monthly`).
- `{ id, mark_incomplete: true }` - clears `last_completed` and rolls back `next_due` to today.
- `{ id, ...fields }` - whitelisted fields: `title`, `description`, `category`, `frequency`, `interval_days`, `preferred_time`, `active`, `ends_on`.

### `DELETE /api/routines?id=...`
- With no other params: hard delete.
- With `&from_date=YYYY-MM-DD`: soft delete from a given day forward (sets `ends_on = from_date - 1`, computed in local time).

---

### `GET /api/settings`
Returns `UserSettings` (singleton; lazily created on first read).

### `PATCH /api/settings`
Body: `Partial<UserSettings>`.

---

### `GET /api/weather`
**Query Params:** `city`, `country?`, `date?` (YYYY-MM-DD).

**Behavior:** Returns current weather for today and the closest forecast (within 5 days). For dates beyond forecast or any error, returns `204 No Content` so the UI shows a unified "Forecast unavailable" message. Wind is in km/h.

---

### `GET /api/free-time`
**Query Params:** `date`, `min_minutes`, `wake_time?`, `sleep_time?`.

**Response:** `FreeSlot[]` (intervals between scheduled events and personal time blocks that are at least `min_minutes` long).

---

### `GET /api/cities`
Proxied geocoding via Nominatim with rate-limit-friendly debouncing on the client.

---

### `POST /api/ics-import`
Imports events from an ICS file or remote URL.
- Body `text/calendar`: raw ICS body.
- Body `application/json`: `{ url: string }` (http/https/webcal only, private/loopback hosts blocked, 10s timeout, 5MB cap).
