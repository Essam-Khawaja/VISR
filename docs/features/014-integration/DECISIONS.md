# DECISIONS: Integration

## D1: One Canonical Task Model

**Decision:** Add `strategy_tasks` as the canonical task model for Strategy Map, Today, Week, and Kanban.

**Reason:** Keeping tasks nested only inside strategy JSON makes graph and daily views drift apart. A table-level task model gives us dates, status, sync, filtering, and mutation from any view.

## D2: Strategy Tasks Are Not Calendar Events Yet

**Decision:** Strategy tasks have `due_date`, not `start_time` / `end_time`.

**Reason:** Most strategy tasks are day-level execution items. They should appear in Today/Week without pretending to be scheduled calendar blocks. Time-blocking can be added later.

## D3: Existing Calendar Tables Stay

**Decision:** Keep `/1` calendar/daily tables and render strategy tasks alongside them.

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

**Decision:** Keep `/1` and `/2` routes temporarily as compatibility redirects or wrappers.

**Reason:** Existing code and demo links should not break while the product shell becomes unified.

