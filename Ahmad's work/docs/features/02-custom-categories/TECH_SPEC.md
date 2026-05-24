# Custom Categories - Tech Spec

## Data
New table `custom_categories` (`name` slug, `label` display, `created_at`). `events.category` and `category_default_items.category` widened to `text` with their legacy CHECK constraints dropped.

## API
`/api/custom-categories` GET/POST/DELETE. POST slugifies `name` server-side.

## UI
- `DefaultsManager` lists built-ins + custom categories, supports adding/deleting custom ones and managing defaults per category.
- `getCategoryStyles(string)` / `getCategoryIcon(string)` accept any string; unknown values fall back to a generic stone style + `Tag` icon.
- `EventForm` receives `customCategories` from the dashboard and lists them under the built-in dropdown.
- `Timeline` plumbs a `customLabelByName` lookup down to `TimelineEvent` via `customCategoryLabel` so the slug isn't displayed.
