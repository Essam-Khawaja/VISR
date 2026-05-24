# Architecture

## Overview
StraighterNoodles is a Next.js 16 App Router application (Turbopack) with Route Handlers backed by Supabase Postgres. The frontend renders a vertical "flowchart" timeline dashboard, a weather-aware "Before You Leave" checklist, routines, and a week chart. There is no auth (single-user demo).

## Main App Flow
1. The dashboard reads `?date=` (or defaults to today) via `useSelectedDate`.
2. It fetches events for that date, all event-items in one bulk call, weather, settings, custom categories, personal time blocks, defaults, and items.
3. Personal time blocks for the selected day are expanded into phantom timeline events and merged with real events for display.
4. The checklist is computed from category defaults + one-time event items + manual items + weather suggestions, deduped by item name. On today it is filtered to upcoming events only.
5. The user creates / edits / completes / reschedules events; transit blocks are auto-managed when `auto_transit + location_id` is set.

## Frontend Architecture
- **Dashboard (`/`)** - `app/page.tsx`. Composes Header, DayNavigator, WeatherBanner, DayOverview, BeforeYouLeave, Voice briefing, Timeline, FreeTimeFinder, Routines, EndOfDayReschedule, WeekChart.
- **Week (`/week`)** - 7-day grid with personal time phantoms merged in; columns flex to fit all events.
- **Notes (`/notes`)** - status-filtered list of all event notes with colored chips and clickable URLs.
- **Settings (`/settings`)** - profile, saved locations, defaults manager (incl. custom categories), personal time manager.
- Components grouped by feature: `timeline/`, `checklist/`, `weather/`, `events/`, `free-time/`, `reschedule/`, `routines/`, `voice/`, `import/`, `week-chart/`, `settings/`, `layout/`, `ui/`.
- Shared pickers in `components/ui/` (`DateTimePicker`, `DatePicker`, `TimePicker`) open through React Portals so modals never clip them.

## Backend Architecture
- **API routes** under `src/app/api/`. PATCH endpoints whitelist allowed fields; date params are interpreted in the user's configured timezone where it matters (`/api/events`).
- **Supabase Postgres**. Schema in `db/schema.sql` (idempotent, single source of truth). Tables: `events`, `items`, `event_items`, `category_default_items`, `custom_categories`, `personal_time_blocks`, `manual_checklist_items`, `saved_locations`, `routines`, `user_settings`.
- **External APIs**: OpenWeather (forecast + current), Nominatim (city autocomplete). ICS-import endpoint accepts uploads or http(s)/webcal URLs with SSRF guards.

## Data Flow
1. Dashboard boot fires parallel fetches for settings, locations, custom categories, personal time blocks, category defaults, all items.
2. `loadEvents(date)` uses a request-id counter so stale responses can't overwrite fresh ones; one bulk `/api/event-items?event_ids=...` fetch follows.
3. Personal time blocks for the selected day are computed via `blocksForDate`; rendered events are `events + phantoms` sorted by `start_time`.
4. `buildChecklist` consumes cached defaults/items and the bulk event-item links; future-only filter applies on today.
5. Edits trigger API PATCH calls and a `loadEvents` refresh; transit blocks are reconciled idempotently.

## Error Handling
- API routes return JSON `{ error }` with appropriate status codes.
- The UI uses loading spinners (initial dashboard, BYL, RoutinesPanel, WeatherBanner, WeekChart, notes hub).
- Empty states everywhere (no events, no notes, no routines, no slots, no weather).
- Weather failures (rate limit, beyond forecast, past date, no city set) all surface a unified "Forecast unavailable" message.

## Deployment
- Designed for Vercel. Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENWEATHER_API_KEY`. No build-time DB connection required.
