# Dashboard Component: Degree Roadmap Engine

## Parent feature
[007-main-dashboard](PRD.md)

## Backend module
[002-degree-roadmap-engine](../002-degree-roadmap-engine/) — owns generation logic, schema, API.

## Role on dashboard
Provides the **data layer** for the hero graph and header context. The dashboard does not duplicate generation; it consumes `Roadmap` and displays:

- **Destination** — from `roadmap.primaryGoal` or profile
- **Current stage** — derived from `profile.yearOfStudy` + active year `focus` (e.g. "Year 2 · Exploration")
- **Year context** — optional subtitle or filter for graph (show current year emphasis)

## Dashboard-specific behavior
1. On first visit: if `GET /api/roadmap` returns 404 → call `POST /api/roadmap/generate` → show skeleton on graph area.
2. Pass `Roadmap` + `edges` to graph component (003).
3. On profile goal change: show banner "Regenerate plan?" → triggers 002.

## UI elements (not a separate page for MVP)
- No standalone `/roadmap` list view required for hackathon.
- Roadmap summary may appear in graph node detail panel only.

## Acceptance criteria
- [ ] Dashboard never renders graph without valid `Roadmap`
- [ ] Regenerate flow updates graph without full page reload (revalidate)
- [ ] Header stage text matches active academic year from profile
