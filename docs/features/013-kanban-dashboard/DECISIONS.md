# DECISIONS: Kanban Dashboard

## D1: Tabbed Workspace Over Sidebar

Replaced the ProjectSidebar with a tabbed Map/Insights view. The map is now the primary dashboard view rather than an embedded card. This gives the 3D visualization full viewport space.

## D2: Separate Routes for Pillar Boards

Each pillar gets its own route (`/dashboard/[planId]/pillar/[pillarId]`) rather than rendering inline. This makes navigation cleaner and allows deep linking.

## D3: Client-Side Breadcrumb Depth

Subtask drill-down uses component state, not URL params. This keeps URLs clean and avoids complex routing for arbitrary task nesting depth.

## D4: "Doing" ActionState

Added `"doing"` as a first-class state rather than overloading `"skipped"`. Cleaner semantics for the three-column Kanban model.

## D5: Flyout Over Full Sidebar

The pillar navigation uses a flyout dropdown from the 72px nav rail instead of a persistent sidebar. This maximizes workspace area for the Kanban boards and map.
