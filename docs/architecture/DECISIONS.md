# Global Decision Log

## 2026-05-23 - Bulk `/api/event-items` fetch + request-id guard on `loadEvents`

**Decision:**
`/api/event-items` accepts `event_ids=a,b,c` (in addition to `event_id`). The dashboard sends one bulk request after fetching events instead of one request per event. A `useRef` counter in `loadEvents` ignores stale responses if the user rapidly changes dates.

**Reason:**
The previous N+1 caused noticeable lag and the race made fast-paging-through-dates flash the wrong day's checklist.

**Notes:**
- `WeekChart` uses the same bulk endpoint.
- `loadEventsCounter.current` is incremented at the top of each call; we abort applying a result whose id no longer matches.

## 2026-05-23 - Before-You-Leave shows only future events for today

**Decision:**
When the selected date equals today, the checklist drops events that have already started (their `start_time <= now`). Past dates and future dates are unaffected.

**Reason:**
You've already left for the event - reminding you to pack for it is noise. This matches user intuition ("I added a one-time item to my current event and it didn't show up - that's correct").

## 2026-05-23 - Personal time renders as phantom timeline events

**Decision:**
The dashboard timeline and week page merge `PersonalTimeBlock` entries (filtered to the day) into the rendered event list as synthetic events with a reserved `personal_time` category. They cannot be edited / deleted from the timeline; the source of truth is `personal_time_blocks` via Settings.

**Reason:**
Visualising sacred time alongside real events makes scheduling decisions easier and matches what users see in the free-time finder.

**Notes:**
- `category: "personal_time"` is added to `EVENT_CATEGORIES` for styling but filtered out of the EventForm picker.
- Phantom IDs are prefixed with `personal-` so the timeline can short-circuit edit/delete callbacks.

## 2026-05-23 - Notes and event descriptions are linkified

**Decision:**
A small `renderTextWithLinks(text)` util wraps `https?://`, `www.`, and `webcal://` matches in `<a target="_blank">`. The timeline event card and notes hub use it; the textarea editor stays plain.

**Reason:**
Meeting events frequently carry Zoom/Teams/Meet links. Making them clickable removes a friction step without adding a separate "link" field.

**Notes:**
- Link clicks `stopPropagation` so they don't open the edit modal.
- Note text is now rendered inside a `div` with `whitespace-pre-wrap` (not a `<button>`) so anchor tags are valid.

## 2026-05-23 - Timezone-aware `/api/events` GET + local `isoDateFromDate` everywhere

**Decision:**
The events GET handler reads `user_settings.timezone` and computes the day window in that timezone (via `Intl.DateTimeFormat` short offset). Date-string conversions in the client (`EndOfDayReschedule`, week page, dashboard transit-block dedup) use `isoDateFromDate(localDate)` instead of `toISOString().split("T")[0]`.

**Reason:**
On a Vercel host west of UTC, midnight-local could land on the wrong day; events near midnight could show up in the wrong week cell and "tomorrow" could resolve to today.

## 2026-05-23 - Standalone `DatePicker` and `TimePicker`

**Decision:**
Two new portal-based components mirror the look of `DateTimePicker` but expose only the calendar (`DatePicker`) or the time selects (`TimePicker`). Free-Time Finder, End-of-Day Reschedule, Personal Time Manager, Settings (wake/sleep), and Routines (preferred time) all use them.

**Reason:**
Native `<input type="date">` and `<input type="time">` are inconsistent across OSes, especially on mobile. Sharing the popover system gives one consistent UX and avoids OS keyboard takeover bugs.

## 2026-05-23 - PATCH whitelists on `events`, `routines`, `manual_checklist_items`

**Decision:**
Every PATCH handler accepts a `body` but only forwards fields from a `Set` of allowed columns to Supabase.

**Reason:**
With open RLS, spreading arbitrary updates from the request body would let any client overwrite `id`, `created_at`, or future system columns. Whitelisting closes the obvious P1.

## 2026-05-23 - ICS-import SSRF guardrails

**Decision:**
`/api/ics-import` URL fetches must be `http(s)`, can't target loopback/private/internal hosts, follow redirects, time out after 10 s, and cap at 5 MB.

**Reason:**
Without this, a user-supplied URL could be used to probe internal services from the server.

## 2026-05-23 - Custom Categories (user-defined event types)

**Decision:**
A new `custom_categories` table lets users add their own event categories (e.g. "Volunteering") in Settings. Custom categories appear alongside built-ins in the EventForm picker and the "Pack defaults per category" manager, and get a generic tag icon plus neutral stone styling.

**Reason:**
Twelve hardcoded categories don't fit every student's life. Letting users extend the list without changing code keeps the app general while preserving the curated colour scheme for the most common types.

**Notes:**
- `events.category` and `category_default_items.category` are plain `text` columns; the legacy CHECK constraints are explicitly dropped in `db/schema.sql`.
- `getCategoryStyles(string)` and `getCategoryIcon(string)` fall back to a generic style/`Tag` icon for unknown categories.
- `TimelineEvent` accepts an optional `customCategoryLabel` so custom categories render their human label, not the slug.

## 2026-05-23 - Personal Time Blocks

**Decision:**
A new `personal_time_blocks` table stores recurring (by weekday) or one-off (by date) time ranges that the free-time finder and end-of-day reschedule treat as busy.

**Reason:**
Students protect sacred slots like dinner with family or wind-down time. The scheduler shouldn't suggest those windows for tasks.

**Notes:**
- The free-time API turns each matching block into a phantom event before computing gaps, so existing slot logic stays untouched.
- A new `PersonalTimeManager` UI in Settings lets users CRUD blocks.

## 2026-05-23 - Forward-Only Routine Deletion via `ends_on`

**Decision:**
Deleting a routine "from a specific day" sets `routines.ends_on = day - 1` rather than wiping rows. The schedule helper skips occurrences after `ends_on`.

**Reason:**
Past completions are real history and shouldn't disappear when the user stops a routine in the future.

**Notes:**
- The "Delete routine?" modal offers two paths: stop from this day forward, or delete completely.
- `routine-schedule.ts.isRoutineScheduledOnDate` checks `ends_on` before any interval math.

## 2026-05-23 - URL-Driven Selected Date (`useSelectedDate`)

**Decision:**
A single `useSelectedDate()` hook is the source of truth for the dashboard's selected date. It seeds initial state from `?date=` and writes back via `router.replace` whenever it changes, so day-arrows, week-tab navigation, and direct URL hits all stay in sync.

**Reason:**
The week page links to `/?date=YYYY-MM-DD` and arrow nav previously updated the URL inconsistently. With `useSearchParams`, the dashboard reacts to URL changes without remounting.

**Notes:**
- The dashboard is wrapped in `<Suspense>` because `useSearchParams` requires it.
- When the date equals today, the `?date=` param is removed for a cleaner URL.

## 2026-05-23 - Per-Date Dashboard (BYL / Voice / Weather / Routines)

**Decision:**
The dashboard renders Before-You-Leave, Voice Briefing, Weather, and Routines for the currently selected date, not only today.

**Reason:**
Users plan ahead and look back. A day-aware dashboard lets you prep tomorrow's pack list, hear a preview of next week, or recap yesterday without leaving the page.

**Notes:**
- Weather uses OpenWeather forecast for today and up to 5 days ahead. Past dates are not supported on the free tier and surface a small caption.
- Voice briefing rewrites its intro for today vs tomorrow vs other days, and skips past events when on today.
- Routines compute occurrence per day from anchor (`next_due`) + interval; complete is only allowed on today.
- Before-You-Leave deduplicates by lowercased name and merges all source events into a single row.

## 2026-05-23 - Manual Checklist Items Per Day

**Decision:**
A new `manual_checklist_items` table stores user-added one-time reminders that aren't tied to any event.

**Reason:**
Some prep items (umbrella swap, prescription refill, return library book) don't map to a calendar entry. Letting users add them ad-hoc per day keeps the checklist genuinely useful.

## 2026-05-23 - Style: No Em Dashes

**Decision:**
The codebase, copy, and seed data avoid em dashes (`—`) and en dashes (`–`). Use `-`, `:`, `,`, or `.` instead.

**Reason:**
Consistent typography across the UI and a clearer signal that strings haven't been touched by an LLM that loves em dashes.

## 2026-05-23 - Tech Stack Selection

**Decision:**  
Next.js 16 (App Router, Turbopack) + Tailwind CSS v4 + Supabase + OpenWeather API

**Reason:**  
Next.js provides full-stack capability with API routes. Tailwind enables rapid UI development. Supabase provides managed PostgreSQL with easy client SDK. OpenWeather is free-tier friendly.

**Alternatives Considered:**  
- Vite + Express (more setup, two separate servers)
- localStorage only (no persistence across devices)
- MongoDB Atlas (more complex for relational data)

**Consequence:**  
All data flows through Supabase. No auth for MVP. Weather requires API key.

## 2026-05-23 - No Authentication for MVP

**Decision:**  
Skip user authentication entirely for hackathon MVP.

**Reason:**  
Reduces complexity significantly. Single-user assumption is fine for demo.

**Alternatives Considered:**  
- Google OAuth (adds setup time)
- Supabase Auth (adds complexity)

**Consequence:**  
All data is globally accessible. RLS policies allow all operations.

## 2026-05-23 - User-Configured City (Not Hardcoded)

**Decision:**  
Weather city is stored in user_settings table and configurable via settings page.

**Reason:**  
App must work for any student globally, not just one city.

**Alternatives Considered:**  
- Hardcoded city (faster but not general)
- Browser geolocation (privacy concerns, less reliable)

**Consequence:**  
First-time users must set their city in settings before weather works.

## 2026-05-23 - Switched City Autocomplete from OpenWeather to Nominatim

**Decision:**  
City search uses Nominatim (OpenStreetMap) instead of OpenWeather geocoding.

**Reason:**  
OpenWeather requires the full city name (no prefix match), and country filtering broke partial matches like "Calga" + Canada. Nominatim does prefix matching naturally and requires no API key.

**Consequence:**  
Search is responsive while typing. We send a custom `User-Agent` to comply with Nominatim's usage policy. Free, no key needed.

## 2026-05-23 - Custom DateTimePicker (not native datetime-local)

**Decision:**  
Built `src/components/ui/DateTimePicker.tsx` instead of using `<input type="datetime-local">`.

**Reason:**  
Native datetime-local is OS-dependent, hard to discover (especially on Windows), and forces typing for time. A popover with a visible calendar grid + hour/minute selects is faster, more obvious, and consistent across browsers. Includes `minDate` for free-time / future-only flows.

**Consequence:**  
EventForm and Free-Time Finder use the same component - no third-party date library needed.

## 2026-05-23 - Auto-Transit Block Generation

**Decision:**  
When an event is saved with a `saved_location` and `auto_transit=true`, the app auto-creates "Transit to X" and "Transit from X" events sized to the location's `transit_minutes`.

**Reason:**  
Students consistently underestimate commute time - making transit visible on the timeline reduces missed events and overplanning.

**Consequence:**  
Logic runs on both create and edit. We tag generated blocks via a `description` marker (`auto-transit for {title}`) so we can dedup and avoid creating duplicates when editing.

## 2026-05-23 - Light "Sunrise" Theme Only

**Decision:**  
Dropped dark mode. Default and only theme is a warm cream/peach gradient with glass cards.

**Reason:**  
User explicitly requested a modern, sleek, white theme with gradients. Calm morning palette reinforces the app's "comforting daily briefing" personality. Single theme = fewer surface bugs for the hackathon.

**Consequence:**  
`globals.css` ships a fixed background gradient and `.glass-card` / `.btn-primary` utility classes. Component styling is consistent and doesn't have to branch on theme.

## 2026-05-23 - Custom ICS parser instead of node-ical

**Decision:**  
Wrote a ~80-line ICS parser in `src/lib/ics.ts` rather than depending on `node-ical`.

**Reason:**  
`node-ical` pulled in `rrule`, which calls `BigInt()` at module load and crashed Turbopack's page-data collection. Our needs are simple (SUMMARY / DTSTART / DTEND / LOCATION / DESCRIPTION), so a small inline parser is safer and removes the dep entirely.

**Consequence:**  
Recurring events (`RRULE`) aren't expanded yet. Single-occurrence VEVENTs work fully. If we later need recurrence, swap in `ical.js`.
