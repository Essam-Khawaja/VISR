# PRD: Kanban Dashboard

**Status:** Complete

## Goal

Transform the dashboard into a productivity-focused workspace with a tabbed Map/Insights view, per-pillar Kanban boards accessible via navbar dropdown and map clicks, and breadcrumb-based infinite task drill-down.

## User Stories

1. As a student, I see the strategy map as the default dashboard view and can switch to insights.
2. As a student, I can click a pillar on the map or in the navbar to open its Kanban board.
3. As a student, I can move tasks between To-Do, Doing, and Done columns.
4. As a student, I can drill into subtasks via breadcrumbs for infinite task depth.
5. As a student, I can add tasks inline from the Kanban board.

## Scope

### In Scope

- Tabbed workspace: Map tab (full-height strategy map) and Insights tab (analytics cards)
- Per-pillar Kanban board at /dashboard/[planId]/pillar/[pillarId]
- Three columns: To-Do, Doing, Done
- Breadcrumb navigation for infinite subtask depth
- Navbar Pillars flyout dropdown with pastel color dots
- onNodeClick from map navigates to pillar board
- "doing" ActionState for in-progress work

### Out of Scope

- Drag-and-drop card reordering
- Gantt chart visualization
- Card editing (name, dates, priority) inline
- Multi-select / bulk actions

## Acceptance Criteria

- [x] Dashboard defaults to Map tab with full strategy map
- [x] Insights tab shows all previous dashboard cards
- [x] Clicking a pillar on the map navigates to its Kanban board
- [x] Navbar shows Pillars dropdown with all strategic pillars
- [x] Kanban board has three columns with task cards
- [x] Tasks can be moved between columns
- [x] Breadcrumbs allow drilling into subtasks
- [x] Inline task creation works from the Kanban board
