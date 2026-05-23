# Global Tasks

## Phase 1: Foundation
- [x] Initialize project (Next.js + TypeScript + Tailwind)
- [x] Set up Supabase client (lazy init)
- [x] Create database schema (supabase-schema.sql)
- [x] Set up light "sunrise" theme (globals, glass cards, gradients)
- [x] Create base layout + Inter font
- [x] Add environment variable example
- [x] Define TypeScript types
- [x] Create utility libraries (timeline-utils, weather, category-colors, constants, ics, countries, timezones)

## Phase 2: Core MVP
- [x] Build API routes (events, items, event-items, category-defaults, weather, free-time, settings, saved-locations, cities, routines, ics-import)
- [x] Build vertical timeline UI (Timeline, TimelineEvent, TimelineConnector, CurrentTimeMarker)
- [x] Build event create/edit form with custom DateTimePicker + saved-location picker + auto-transit
- [x] Build "Before You Leave" checklist (BeforeYouLeave, ChecklistItem)
- [x] Build weather integration (WeatherBanner + weather advice logic)
- [x] Build free time finder (FreeTimeFinder, blocks past dates)
- [x] Build settings page (SettingsForm, CityAutocomplete via Nominatim, SavedLocationsManager)
- [x] Connect main flow end-to-end (Dashboard page wiring)

## Phase 3: Polish + Extended Features
- [x] Greeting / morning message (Header)
- [x] CategoryBadge with color-coded categories
- [x] DayNavigator (prev/next/today)
- [x] DayOverview (intensity, long-stretch, late-transit warnings)
- [x] EndOfDayReschedule (mark done / push to tomorrow / next week)
- [x] Auto-transit blocks (create + edit, dedup'd)
- [x] Routines (daily/weekly/monthly/every-N-days; mark complete resets timer)
- [x] Voice briefing via Web Speech API
- [x] ICS file import (custom parser, no external deps)
- [x] Week overview page
- [x] Notes hub page with status filters
- [x] Loading and empty states across the app
- [x] Seed a week of test data for the demo
- [x] Custom DateTimePicker (no native datetime-local)

## Out of scope (potential future)
- [ ] Google Calendar / Microsoft Graph OAuth
- [ ] D2L scraping
- [ ] OpenAI morning summary
- [ ] Google Maps transit routing
- [ ] Auth / multi-user
