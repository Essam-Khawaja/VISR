# Clickable Links in Notes & Descriptions - PRD

## Goal
Any URL pasted into an event note or description should be clickable on the timeline and the notes hub, so meeting links (Zoom/Teams/Meet) work in one click.

## Success
- Plain text URLs (`https://...`, `www....`, `webcal://...`) render as `<a target="_blank">` in note previews and descriptions.
- Clicking a link opens a new tab; it does not also open the edit modal.
- The note editor textarea remains plain text (no rich-text complication).

## Out of Scope
- A dedicated "meeting link" field on events.
- Inline-editing rich text.
