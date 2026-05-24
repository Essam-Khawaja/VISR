# DECISIONS: Integration

## D1: One Canonical Task Model

**Decision:** Add `strategy_tasks` as the canonical task model for Strategy Map, Today, Week, and Kanban.

**Reason:** Keeping tasks nested only inside strategy JSON makes graph and daily views drift apart. A table-level task model gives us dates, status, sync, filtering, and mutation from any view.

## D2: Strategy Tasks Are Not Calendar Events Yet

**Decision:** Strategy tasks have `due_date`, not `start_time` / `end_time`.

**Reason:** Most strategy tasks are day-level execution items. They should appear in Today/Week without pretending to be scheduled calendar blocks. Time-blocking can be added later.

## D3: Existing Calendar Tables Stay

**Decision:** Keep `/flowgram` calendar/daily tables and render strategy tasks alongside them.

**Reason:** The daily app already has useful event, routine, weather, and checklist behavior. Integration should connect it to strategy, not rewrite it.

## D4: Parent Completion Is Derived

**Decision:** Goal, pillar, and parent task completion is derived from child completion rather than manually stored.

**Reason:** This prevents contradictory states like a pillar marked done while one child task is still open.

## D5: Circular Node Ring Replaces Linear Progress

**Decision:** Node progress appears as a circular ring around the node.

**Reason:** Progress belongs spatially to the node. It is faster to read and makes graph completion feel integrated instead of dashboard-like.

## D6: Text Must Live Inside Nodes

**Decision:** Node label text must be rendered inside dynamically sized nodes in every graph mode.

**Reason:** Floating labels make the graph feel separate and brittle. Text-inside-node makes each node feel like a real interactive object and avoids label/node mismatch.

## D7: HTML Overlay Nodes Are The Recommended MVP Path

**Decision:** Prefer HTML/SVG node overlays anchored to Three.js positions for text and ring rendering.

**Reason:** Three.js mesh text and canvas textures are more fragile under hackathon time. HTML nodes make wrapping, accessibility, buttons, and circular progress easier.

## D8: LocalStorage Remains The Offline Fallback

**Decision:** Keep local task cache when Supabase is missing or fails.

**Reason:** The demo must continue to work without database setup.

## D9: Route Compatibility During Transition

**Decision:** Keep `/flowgram` and `/strategyweb` routes temporarily as compatibility redirects or wrappers.

**Reason:** Existing code and demo links should not break while the product shell becomes unified.

## D10: Schema Setup Is Canonical Through `db/schema.sql`

**Decision:** Supabase setup for this feature should run the full `db/schema.sql` file after pulling the branch.

**Reason:** The canonical `strategy_tasks` table, indexes, and MVP policies now live beside the rest of the database schema. Keeping one SQL entry point reduces setup drift during the hackathon.

## D11: MVP Sync Uses The Active Strategy Plan

**Decision:** Today and Week read strategy tasks from `getActivePlanId()` with demo fallback.

**Reason:** After integration, daily views should follow the user's onboarding plan when one exists, not always the hardcoded demo plan ID.

**Supersedes:** D11 (2026-05-23) which pinned Today/Week to demo plan only.

## D13: StrategyTask Is Canonical For All Task UI

**Decision:** All task lists (dashboard Next 7 days, Today, Week, intelligence dock) read from `StrategyTask[]` in the task store. `plan.nextSevenDays` is insight-only / legacy demo seed.

**Reason:** AI-generated weekly lists duplicated and contradicted real tasks created on the strategy map, wasting tokens and breaking sync.

## D14: Semester Progress Replaces Alignment Score

**Decision:** Dashboard top-band dial shows semester-scoped task completion % (`done / total` for current semester subtree) instead of `plan.alignmentScore`.

**Reason:** Progress should reflect actual work completed on the map, not an opaque AI score.

## D12: Week Task Chips Link Through The Day Cell

**Decision:** Week view shows strategy task chips inside each day card, and the day card opens the selected date.

**Reason:** This avoids nested interactive controls inside the existing day link while still exposing future-dated strategy work in the correct calendar position. A dedicated task detail modal can replace this once the unified shell has more time.
