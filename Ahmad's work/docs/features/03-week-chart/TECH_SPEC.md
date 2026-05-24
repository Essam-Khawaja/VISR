# Week Ahead Chart - Tech Spec

## Component
`src/components/week-chart/WeekChart.tsx`.

## Inputs
`startDate: string` (YYYY-MM-DD). Computes 7 consecutive days starting from `startDate`.

## Data
- `GET /api/events?date=start&date_end=end` (one call).
- `GET /api/routines` (one call).
- `GET /api/category-defaults` (one call).
- `GET /api/event-items?event_ids=...` (one bulk call instead of N+1).
- `GET /api/manual-checklist?date=...` (one per day, since the API doesn't yet support ranges).

## Compute per day
- Tasks: real (non-transit) events.
- Routines: `routines.filter(r => isRoutineScheduledOnDate(r, day))`.
- Packing: union of (a) category defaults for any "leaves home" category present that day, (b) one-time event-specific items on those events, (c) manual checklist count for that day.

## Render
SVG (`viewBox="0 0 700 220"`) with 5 horizontal grid lines, dashed strokes, three coloured paths (blue/emerald/rose), and circles per data point. The chart `min-w-[420px]` so it horizontally scrolls on narrow phones.
