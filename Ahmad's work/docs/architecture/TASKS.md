# Global Tasks

## Phase 1: Foundation
- [x] Initialize project (Next.js 16 + TypeScript + Tailwind v4 + Turbopack)
- [x] Set up Supabase client (lazy init via `getSupabase()`)
- [x] Create database schema (`db/schema.sql` - consolidated, idempotent; runnable via `scripts/db_setup.py`)
- [x] Set up light "sunrise" theme (globals, glass cards, gradients)
- [x] Create base layout + Inter font
- [x] Add environment variable example
- [x] Define TypeScript types (`src/types/index.ts`)
- [x] Utility libraries (`timeline-utils`, `weather`, `category-colors`, `constants`, `ics`, `countries`, `timezones`, `personal-time`, `linkify`)

## Phase 2: Core MVP
- [x] Build API routes (events, items, event-items, category-defaults, weather, free-time, settings, saved-locations, cities, routines, ics-import, custom-categories, personal-time, manual-checklist)
- [x] Build vertical timeline UI (Timeline, TimelineEvent, TimelineConnector, CurrentTimeMarker)
- [x] Build event create/edit form with custom `DateTimePicker` (React Portal), saved-location picker, auto-transit, end-before-start validation
- [x] Build "Before You Leave" checklist (`BeforeYouLeave`, `ChecklistItem`, manual one-time items, water bottle always-on, weather-driven suggestions, custom badge alignment)
- [x] Build weather integration (`WeatherBanner` + advice logic, unified "Forecast unavailable" message, km/h wind, loading spinner)
- [x] Build free time finder (`FreeTimeFinder`, blocks past dates, respects min-duration, integrates personal time blocks)
- [x] Build settings page (`SettingsForm`, `CityAutocomplete` via Nominatim, `SavedLocationsManager` with edit/delete, `PersonalTimeManager`, `DefaultsManager` w/ custom categories)
- [x] Connect main flow end-to-end (Dashboard page wiring; URL <-> selected date sync via `useSelectedDate`)

## Phase 3: Polish + Extended Features
- [x] Greeting / morning message (Header, mobile nav)
- [x] Sunrise theme + glass cards
- [x] `DayNavigator` (prev/next/today + reflects in URL)
- [x] `DayOverview` (intensity, long-stretch, lunch warnings, late-transit Calgary heuristic)
- [x] `EndOfDayReschedule` (mark done / pick new slot with day-aware free-time fetch, mobile-safe modal)
- [x] Auto-transit blocks (create + edit, deduped, default on)
- [x] Routines (daily/weekly/monthly/every-N-days; mark complete; uncheck; per-day forward delete; calendar-month advancement; "Every N days" preview shows N; due/missed/scheduled status badges)
- [x] Voice briefing via Web Speech API (female Siri-like preference, future events only for today, full-day list otherwise)
- [x] ICS file import (custom parser, no external deps, http(s)/webcal URL support, SSRF-blocked private hosts)
- [x] Week overview page (uses local-date grouping, displays all events without "+x more", renders personal-time phantoms)
- [x] Notes hub page (status filters with color chips, clickable links, delete button, completed items sink)
- [x] Loading and empty states across the app
- [x] Seed test data for the demo (`db/seed.sql`, idempotent; covers past week May 16-22, today May 23, showcase week May 24-29, and two future weeks May 30-Jun 12; reapply with `scripts/db_reseed.py`)
- [x] Custom `DateTimePicker` (Portal-based; no scrollbar; bumped popover height)
- [x] Standalone `DatePicker` + `TimePicker` (used by Free Time Finder, Reschedule, Personal Time, Settings, Routines)
- [x] Custom categories with generic icon fallback
- [x] Personal time blocks (entity in DB, settings UI, free-time integration, timeline + week phantoms with own category style)
- [x] Week chart tile (7-day SVG line chart for tasks/routines/packing load)
- [x] Clickable links in event descriptions and notes (linkify util)
- [x] Mobile UI pass (modals snap to bottom, sub-40px touch targets enlarged, edit/delete buttons always visible, no hover-only affordances)
- [x] Codebase audit (bugs/perf/security/accessibility/docs) and fixes applied

## Out of scope (potential future)
- [ ] Google Calendar / Microsoft Graph OAuth
- [ ] D2L scraping
- [ ] OpenAI morning summary
- [ ] Google Maps transit routing
- [ ] Auth / multi-user (currently RLS open `using(true)`)
- [ ] Per-user rate limiting on `/api/weather`, `/api/cities`
