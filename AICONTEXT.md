# AICONTEXT.md - StraighterNoodles snapshot (temporary brain-dump for the next LLM)

> Throwaway doc. Delete after the next agent catches up. The authoritative docs live under `docs/architecture/` and `docs/features/`.

## 1. What this project is
**StraighterNoodles** is a single-user student life dashboard for the demo. It bundles:

- A vertical "flowchart" timeline for the selected day.
- A weather-aware, day-aware **Before You Leave** packing checklist.
- A **Free Time Finder** that respects events, transit, sleep/wake, and personal time blocks.
- **Routines** with daily / weekly / monthly / every-N-days frequencies, completion history, and forward-only deletion.
- **Voice morning briefing** (female, Siri-like, future-events-only when on today).
- **ICS import** (file or URL, SSRF-guarded).
- A **Week tab** with full event listings per day (no "+x more") + personal time blocks.
- A **Notes hub** with colored status chips and clickable URLs.
- A **Week chart tile** plotting tasks / routines / packing load over 7 days.
- **Custom categories** (user-extensible) with generic fallback styling.
- **Personal time blocks** that visually appear on timeline & week and exclude themselves from scheduling.

Stack: Next.js 16 (App Router, Turbopack) + React + TypeScript + Tailwind v4 + Supabase (Postgres) + OpenWeather + Nominatim. No auth. Light "sunrise" theme only. No em dashes anywhere.

Today's anchor date (for the demo): **Saturday May 23, 2026**, Mountain Time.

## 2. Repo layout
```
src/
  app/
    page.tsx                  dashboard (Suspense-wrapped DashboardInner)
    week/page.tsx
    notes/page.tsx
    settings/page.tsx
    api/<resource>/route.ts   one Route Handler per resource
  components/
    layout/Header.tsx, DayNavigator.tsx
    timeline/Timeline.tsx, TimelineEvent.tsx, TimelineConnector.tsx, CurrentTimeMarker.tsx
    events/EventForm.tsx, NoteEditor.tsx, EventItemsManager.tsx
    checklist/BeforeYouLeave.tsx, ChecklistItem.tsx
    weather/WeatherBanner.tsx
    free-time/FreeTimeFinder.tsx
    day-overview/DayOverview.tsx
    reschedule/EndOfDayReschedule.tsx
    routines/RoutinesPanel.tsx
    voice/VoiceBriefingButton.tsx
    import/ICSImportButton.tsx
    week-chart/WeekChart.tsx
    settings/SettingsForm.tsx, SavedLocationsManager.tsx, DefaultsManager.tsx,
             PersonalTimeManager.tsx, CityAutocomplete.tsx
    ui/DateTimePicker.tsx, DatePicker.tsx, TimePicker.tsx
  lib/
    supabase.ts              getSupabase() lazy singleton
    timeline-utils.ts        date math, formatting, isoDateFromDate, todayISODate
    weather.ts               weather code -> advice
    category-colors.ts       CATEGORY_CONFIG + getCategoryStyles/Icon/Label
    constants.ts             CATEGORY_CONFIG values, MORNING messages
    item-icons.ts            item-name -> icon
    countries.ts, timezones.ts
    ics.ts                   tiny ICS parser (no node-ical)
    routine-schedule.ts      isRoutineScheduledOnDate, routineStatusForDate
    use-selected-date.ts     hook: <-> ?date= query param
    personal-time.ts         blocksForDate + blocksToPhantomEvents
    linkify.tsx              renderTextWithLinks
  types/index.ts             all DB-mirrored types + EVENT_CATEGORIES union
docs/
  architecture/{PRD,TECH_SPEC,ARCHITECTURE,API_SPEC,DATA_MODEL,TASKS,DECISIONS}.md
  features/{01-personal-time, 02-custom-categories, 03-week-chart,
            04-manual-checklist, 05-clickable-links}/ each with PRD/TECH_SPEC/TASKS/DECISIONS.md
db/
  schema.sql                      consolidated, idempotent (single source of truth)
  seed.sql                        idempotent showcase reseed (May 16 - Jun 12)
  README.md                       how to apply / what's where
scripts/
  db_setup.py                     first-time: schema + seed
  db_reseed.py                    just seed (assumes schema already applied)
  requirements.txt                psycopg2-binary + python-dotenv
```

> The legacy `supabase-schema.sql` / `supabase-migration-v2.sql` /
> `supabase-migration-v3.sql` / `supabase-reseed.sql` files at the repo root
> have been **deleted**. Everything lives under `db/` now and is driven by
> the Python scripts above.

## 3. Supabase
Two Supabase projects exist; **use `bnerobembkornyfldqns` (cursorhackathon)**, it's ACTIVE_HEALTHY. The other one (`qchmoryxtrajnyybdhoo`) is INACTIVE.

Latest counts after most recent seed (May 23 evening):
- saved_locations 5, items 22, category_default_items 23, custom_categories 1, personal_time_blocks 6, routines 9, events 81, event_items 10, manual_checklist_items 6.

RLS is open `using (true) with check (true)` (P0 to fix before any real users; flagged in the audit).

## 4. Architectural decisions worth knowing immediately
(see `docs/architecture/DECISIONS.md` for the full log)

- **URL is the source of truth for selected date.** `useSelectedDate()` in `lib/use-selected-date.ts` reads + writes `?date=`. The dashboard wraps `DashboardInner` in `<Suspense>`. When the date equals today the param is removed.
- **Custom category renders.** `events.category` is `text`; the legacy CHECK is dropped. Unknown values fall back to stone styling + `Tag` icon. The reserved `personal_time` category is in `EVENT_CATEGORIES` for typing/styling but **filtered out of the EventForm picker** since users shouldn't create those events directly.
- **Personal time blocks are phantom events** at render time. `blocksForDate(...)` + `blocksToPhantomEvents(...)` in `lib/personal-time.ts`. Merged into the timeline and week view, NOT into events used for BYL/voice. Phantom IDs start with `personal-` so onEdit/onDelete/onToggleComplete short-circuit.
- **Before You Leave on today** filters to events whose `start_time > now`. So once you've left, items don't keep nagging. Other dates show everything.
- **Bulk `/api/event-items?event_ids=a,b,c`** to avoid N+1; consumed by both the dashboard and `WeekChart`.
- **Race-safe `loadEvents`.** A `useRef` counter in `page.tsx` ignores stale responses if the user pages through dates quickly.
- **Timezone-aware `/api/events` GET.** Reads `user_settings.timezone` and computes the day window via `Intl.DateTimeFormat`. Client also uses `isoDateFromDate(local)` everywhere instead of `toISOString().split("T")[0]`.
- **Linkified notes/descriptions.** `lib/linkify.tsx` wraps URLs in `<a target="_blank">`. Used in `TimelineEvent` (note preview + description) and `notes/page.tsx`. The note preview is a `<div>` not a `<button>` so anchors are valid HTML; link clicks `stopPropagation` to avoid opening the editor.
- **Routines.**
  - `mark_complete` advances `next_due` by calendar month for `monthly` (no more "30-day month").
  - `mark_incomplete` resets `last_completed = null`, `next_due = today`.
  - `DELETE ?from_date=` sets `ends_on = from_date - 1` (computed in *local* time) instead of hard-deleting.
  - `isRoutineScheduledOnDate` respects `ends_on` and the new monthly logic.
  - `routineStatusForDate` only returns "missed" if the routine was actually scheduled that day.
  - All `PATCH` updates go through a whitelist.
- **`PATCH /api/events`** and **`PATCH /api/manual-checklist`** are similarly whitelisted (security P1).
- **ICS import SSRF guard.** http(s) or webcal only; loopback/private/internal hosts blocked; redirects followed; 10s timeout; 5 MB cap.
- **Shared portal pickers.** `DateTimePicker` (full), `DatePicker` (calendar only), `TimePicker` (time only). All open via React Portal so they're never clipped by modal borders. Native `<input type="date">` / `<input type="time">` are gone from the codebase.

## 5. Conventions / style
- No em dashes (`—`) or en dashes (`–`) anywhere. Use `-`, `:`, `,`, `.`.
- Don't add comments that just narrate code.
- Tailwind utility classes preferred over component CSS.
- Keep file/folder names short and kebab/snake by convention.
- Never use `any` unless absolutely necessary. The existing code uses `string` for category, `Record<string, unknown>` for whitelist filters.

## 6. Open audit items (not yet fixed)
**Performance**
- `WeekChart` reloads on every dashboard date change. Adding a `Map<weekStart, result>` cache would fix it (P2).
- `buildChecklist` already uses cached defaults/items and bulk event-items; it still re-runs on every events change, which is fine but could be memoized on `(events.length, completedHash)` for max polish.

**Security**
- RLS open (`using(true)`). P0 for real users; intentional for the demo (no auth).
- No rate limit on `/api/weather`, `/api/cities`. P2.

**Accessibility**
- Some icon-only nav buttons lack `aria-label` (e.g. mobile Header links). P2.

**Documentation**
- All the architecture docs were updated in this pass. Feature docs cover the five biggest additions (personal time, custom categories, week chart, manual checklist, clickable links). Older features (routines, free-time, voice, etc.) still don't have per-feature folders; if you add a new one, copy from `docs/templates/`.

## 7. How to run / validate
- Dev: `npm run dev` (Turbopack).
- Lint: `npm run lint` (should be clean - last run 0 problems).
- Build: `npm run build` (should pass - last run successful, 21 routes).
- No `typecheck` script; build does it.

## 8. Demo path that exercises everything (May 23, 2026)
1. Land on dashboard at `/` -> the URL stays clean because today is selected.
2. Day overview warns about a 5.5h study stretch and a Calgary late-transit issue.
3. Before You Leave lists items for the *upcoming* events only (we already finished morning yoga). Includes weather suggestion (if rainy), water bottle, custom-category "Volunteer vest" / "Name tag" (Soup kitchen shift), one-time "Printed assignment" + "Calculator" (Marathon study).
4. Personal-time phantom "Personal reading" (17:00-18:00) is purple on the timeline.
5. Click the Coffee with Priya note -> opens NoteEditor with colored status pills.
6. The Zoom link in that note is clickable on the timeline preview itself.
7. Click Routines -> "Yoga & stretch" is `Completed`, others are due; deleting via "Stop from this day forward" sets ends_on instead of wiping history.
8. Free Time Finder for May 24 -> respects "Yoga focus block 08:00-09:00" and "Family dinner 18:00-20:00".
9. End-of-Day Reschedule -> Pick a new slot opens with the *prettier* DatePicker and avoids personal time on the chosen day.
10. Week tab -> all events render (no "+x more"), today highlighted, personal-time blocks visible on Saturday/Sunday/Wednesday.
11. Week-ahead chart shows three lines for the next 7 days, one bulk API call instead of N+1.
12. Notes hub -> filter chips are color-coded; clicking "Important" shows Coffee with Priya; clicking the body row opens the editor; the URL is clickable.

## 9. Recent dev session (May 23 evening) - what just happened
Implemented this batch in one go:
1. Clickable links in notes/descriptions (`linkify`).
2. Bumped `DateTimePicker` popover height (no scrollbar).
3. Removed the `datalist` from `EventItemsManager` (kills the down arrow on the add-item input).
4. Filtered BYL to future-only on today.
5. Personal time category styling + phantom rendering on dashboard + week tab.
6. ICS-import popover is now a centered modal (mobile-safe).
7. End-of-Day Reschedule + Free Time Finder use the new `DatePicker`.
8. `PersonalTimeManager`, `SettingsForm`, `RoutinesPanel` use the new `TimePicker`.
9. `SavedLocationsManager`: edit/delete always visible, no hover-only.
10. `NoteEditor`: colored status pills (mirrors timeline + notes hub).
11. `notes/page.tsx`: colored filter chips and per-row colored status chips.
12. `week/page.tsx`: grouping by local date (was UTC), shows all events.
13. Bulk `/api/event-items?event_ids=...` + dashboard + `WeekChart` consume it.
14. `loadEvents` request-id guard.
15. Optimistic-rollback in `toggleManualItem`.
16. `routineStatusForDate` no longer mislabels untouched off-days as "missed".
17. Monthly routine advancement uses calendar month.
18. `/api/events` honours `user_settings.timezone`. Whitelisted PATCH.
19. `/api/routines` DELETE-from-date computed in local time. Whitelisted PATCH.
20. `/api/manual-checklist` validates `for_date` format and `item_name` length, whitelisted PATCH.
21. `/api/ics-import` SSRF-guarded.
22. Seed reapplied via Supabase MCP; counts above.
23. Architecture docs (`API_SPEC`, `DATA_MODEL`, `TASKS`, `DECISIONS`) updated.
24. Five feature docs added under `docs/features/`.

## 10. Things the next agent should *not* do without checking
- Re-introduce `<input type="date">` or `<input type="time">`. Use the shared pickers.
- Remove the `personal_time` entry from `EVENT_CATEGORIES`; lots of styling/typing depends on it.
- Re-add a CHECK constraint on `events.category` or `category_default_items.category`; custom categories will break.
- Spread `body` directly into a Supabase `.update()` call without a whitelist.
- Use `toISOString().split("T")[0]` for "tomorrow" - it lands on the wrong day west of UTC.
- Touch `user_settings`; the seed deliberately doesn't.

Last thing: this file is temporary. Once you've caught up, you can delete it.

---

## 11. Second dev session (May 23 late evening) - what just happened (NEW)

User found a fresh batch of bugs + asked for a repo cleanup. All addressed:

1. **Voice briefing now reads the WHOLE day.** No more `slice(0, 5)` on events
   or `slice(0, 6)` on packing items, and no "plus X more" trailer. It also
   reads every routine scheduled on the day (`isRoutineScheduledOnDate`). To
   stop Chrome cutting off long utterances, the script is chunked by sentence
   and queued, and cancellation uses a `sessionRef` token so the toggle still
   works mid-flight. Personal-time phantoms are excluded.
2. **Linkify now matches bare domains** like `google.com`. The regex covers
   `https://`, `webcal://`, `www.`, and `(...).<TLD>(/...)` for a curated
   list of common TLDs. `normalizeHref` prepends `https://` to bare matches.
   `onMouseDown` also stops propagation now, belt + suspenders.
3. **Personal time blocks have no Add-Note button.** `Timeline.tsx` no longer
   forwards `onEdit/onDelete/onToggleComplete/onEditNote` when
   `event.category === "personal_time"`, so the buttons aren't rendered at all
   (was: forwarded handlers that silently no-op'd, leaving the buttons up).
4. **Notes filter chips: only the selected chip is colored.** Unselected chips
   render as `bg-white/70 text-stone-500 border-stone-200`. Same treatment
   applied to `NoteEditor` status pills.
5. **Mobile modal positions.** `EventForm`, `NoteEditor`, `EndOfDayReschedule`,
   and `RoutinesPanel` delete-confirm all use
   `flex items-center justify-center p-3 sm:p-6` with `rounded-3xl` (no more
   bottom-sheet) and `max-h-[90dvh]` so they centre and never overflow.
   Header bars got `overflow-hidden` so corners stay rounded.
6. **Saved locations Add form** now has explicit labels:
   - "Location type" select with its own label.
   - "Commute time (minutes)" with helper text + `placeholder="e.g. 30"`,
     **blank by default** (`transitMinutes` state is `string`, parsed at
     submit; empty -> 0).
7. **Repo refactor.**
   - Deleted: `supabase-schema.sql`, `supabase-migration-v2.sql`,
     `supabase-migration-v3.sql`, `supabase-reseed.sql`.
   - Added: `db/schema.sql` (consolidated, idempotent, drops legacy
     CHECK constraints), `db/seed.sql` (May 16 - Jun 12), `db/README.md`.
   - Added Python scripts: `scripts/db_setup.py` (schema + seed) and
     `scripts/db_reseed.py` (seed only). Both read `DATABASE_URL` or
     `SUPABASE_DB_URL` from `.env.local`. Deps in
     `scripts/requirements.txt` (`psycopg2-binary`, `python-dotenv`).
   - Doc references updated (`ARCHITECTURE.md`, `DATA_MODEL.md`, `TASKS.md`,
     `DECISIONS.md`, `docs/features/01-personal-time/TASKS.md`).
8. **Extended seed** (May 16 - Jun 12) now includes:
   - Clickable-link notes scattered across past + future events.
   - More personal time blocks (4 weekday-recurring + 5 specific-date).
   - One extra routine ("Vitamins").
   - One-time items for `Long run` (Sunscreen), `Acme final interview`
     (Printed resumes + Notebook), `Assignment 5 due` (USB drive).
   - 13 manual checklist items spread from May 21 - Jun 12, including some
     pre-checked ones in the past.
   - Two future weeks of dummy events (May 30 - Jun 12), Acme interview
     arc as a multi-day showcase.
9. **Live DB reseeded** via Supabase MCP (`bnerobembkornyfldqns`). Latest
   counts (May 23 ~22:30 UTC-6):
   - saved_locations 5, items 25, category_default_items 23,
     custom_categories 1, personal_time_blocks 9, routines 10, events 108,
     event_items 14, manual_checklist_items 13.

## 12. Things the next agent should *also* not do
- Re-introduce the legacy `supabase-*.sql` files. The single source of truth
  is `db/schema.sql` + `db/seed.sql`.
- Speak the briefing as one giant utterance - browsers truncate around
  ~250 chars. Use the existing chunk-and-queue pattern.
- Drop the `sessionRef` token in `VoiceBriefingButton` - it's how cancellation
  works without `onerror` accidentally re-queuing.
- Render Add-Note (or any edit affordance) on `personal_time` phantom events.
  Filter at `Timeline.tsx` by passing `undefined` for the handlers.
- Use `bg-stone-900/30 backdrop-blur-sm flex items-end sm:items-center` for
  new modals. The new mobile UX is centered + padded, not a bottom sheet.

