# Manual Checklist Items - PRD

## Goal
Let users add free-form reminders to a day's "Before You Leave" list without creating a fake event.

## Success
- Add / check / delete works inline.
- Adding doesn't refresh the page or lose other form state.
- Items are scoped to a single `for_date` and don't leak into other days.

## Out of Scope
- Recurring manual items.
- Linking manual items to specific events.
