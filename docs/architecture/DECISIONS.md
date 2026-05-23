# Global Decision Log

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
Next.js 15 (App Router) + Tailwind CSS v4 + Supabase + OpenWeather API

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
