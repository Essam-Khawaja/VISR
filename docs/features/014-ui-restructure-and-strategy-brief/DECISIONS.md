# Feature Decisions: UI Restructure and Strategy Brief

## Decision Log

### 2026-05-24 — Strategy Brief lives as a drawer, not a separate route

**Decision:**
The Strategy Brief is rendered as a right-side drawer overlay on the Strategy Web page, never as a separate `/2/strategy-brief` route.

**Reason:**
The product positioning says the Strategy Web is the visual hero. The brief should *explain* the web, not replace it. Keeping it as an overlay keeps the web visible behind it and avoids the scroll-heavy dashboard pattern we are intentionally avoiding.

**Alternatives Considered:**
- Separate `/strategy-brief` page (rejected; breaks the "analysis attached to web" model)
- Inline expandable section under the web (rejected; would force the page into scroll territory)

**Consequence:**
We mount the drawer in `DashboardLayout` next to `TodayOverlay`. No router changes.

### 2026-05-24 — Brief derives everything from `StrategyPlan`

**Decision:**
Strategy Brief reads directly from `usePlan()` and computes priorities/bottleneck on the client. No new API, no new schema.

**Reason:**
The plan already encodes everything we need (destination, alignment score, bottleneck, pillars, cut list, risks). Adding a server layer would inflate scope and slow the demo loop. The brief is a derived view, not new data.

**Alternatives Considered:**
- New `/api/2/strategy-brief` endpoint that calls Groq again (rejected; redundant with plan generation)
- Storing pre-rendered brief copy on the plan (rejected; couples copy to data we already render)

**Consequence:**
Bottleneck pillar selection uses simple heuristics (`Missing` > `Weak`). If the heuristic ever needs to be smarter, we lift this into the planner.

### 2026-05-24 — Home page label renames keep their accent colors

**Decision:**
"Perspective 1" / "Perspective 2" become "Daily Flow" / "Big Picture" but reuse the existing amaranth / sage colors on the eyebrow text.

**Reason:**
The user wants new copy without losing the visual association the two perspectives already have throughout the product (sidebar, brand chips, route line).

**Consequence:**
No CSS variable changes; only label string changes in `app/page.tsx`.

### 2026-05-24 — Reschedule modal uses a fixed `inset-0` blurred backdrop

**Decision:**
The Reschedule modal in `EndOfDayReschedule` already uses `fixed inset-0 z-50 backdrop-blur-sm`, but other elements above appear unblurred because the modal mounts inside the main column. Move backdrop styles to ensure the modal element root covers the viewport including the top toolbar area.

**Consequence:**
The header isn't part of the blur target because the modal sits in the same scroll container. We promote the modal to a portal-like overlay via consistent `fixed inset-0` and `z-[60]` so it sits above any header content.
