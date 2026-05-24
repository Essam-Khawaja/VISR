# Personal Time Blocks - PRD

## Goal
Let users protect recurring or one-off time slots (family dinner, deep work, wind-down) so the scheduler, free-time finder, and reschedule flow treat them as busy.

## Users
A student who has predictable "off-limits" pockets each week and doesn't want the app to suggest tasks in those windows.

## Success
- Free Time Finder never returns a window overlapping a personal time block on a matching day.
- "Pick a new slot" (End of Day Reschedule) skips those windows.
- The dashboard timeline and the week view show personal time blocks visually so users can plan around them.

## Out of Scope
- Per-user recurrence beyond weekly + one-off (no every-N weeks, no monthly).
- Linking blocks to specific routines or events.

## Demo Flow
1. Settings -> Personal Time -> add "Family dinner, every Sunday, 18:00 - 20:00".
2. Dashboard for a Sunday -> the block renders in the timeline (purple, Moon icon).
3. Free Time Finder for that Sunday -> the 18:00-20:00 gap is not suggested.
4. Week tab -> the block appears in the Sunday column.
