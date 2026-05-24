# Manual Checklist Items - Tech Spec

## Data
Table `manual_checklist_items` (`item_name`, `for_date`, `checked`, `created_at`).

## API
`/api/manual-checklist`
- GET `?date=YYYY-MM-DD` returns items for that date (or all).
- POST validates `item_name` (1-200 chars) and `for_date` (YYYY-MM-DD).
- PATCH whitelists `checked`, `item_name`.
- DELETE `?id=`.

## UI
- Dashboard `BeforeYouLeave` includes a small "Add item" inline form that calls `onAddManual`.
- Manual items render alongside category-default / one-time / weather items.
- Toggle uses optimistic update + roll-back on failure.
