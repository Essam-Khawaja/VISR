# TECH_SPEC: Kanban Dashboard

**Status:** Complete

## Architecture

### Dashboard Workspace Tabs

`DashboardWorkspace` now manages a `tab` state: `"map" | "insights"`.

- **Map tab**: Renders `GoalTreeSlot` full-height with `onNodeClick` that navigates to the pillar board
- **Insights tab**: Renders existing analytics (TopBand, NextSevenDays, CutList, Priorities, Risks, OpportunityChecker)

### Kanban Board

**`components/dashboard/KanbanBoard.tsx`**

Three-column layout:
- To-Do: `actionState` is `undefined` or `"open"`
- Doing: `actionState` is `"doing"`
- Done: `actionState` is `"done"`

Each card shows: name, recommendation excerpt, priority badge, due date, subtask count, and move buttons.

Breadcrumb navigation: `Plan > Pillar Name > Task > Subtask > ...` managed via component state (`breadcrumb[]`). The URL stays at the pillar level; depth is client-side only.

### Routing

```
/dashboard/[planId]                         -> DashboardLayout (tabbed)
/dashboard/[planId]/pillar/[pillarId]       -> PillarPage (KanbanBoard)
```

Pillar page wraps in its own `PlanProvider` to load plan context.

### Navbar Dropdown

`DashboardSidebar` uses `usePlanOptional()` to access plan context. A grid icon button opens a flyout listing all pillars with links to `/dashboard/[planId]/pillar/[pillarId]`.

### ActionState Update

`ActionState` in `lib/planStore.ts` changed from `"open" | "done" | "skipped"` to `"open" | "doing" | "done" | "skipped"`. The `useGraphScene.ts` duplicate type was replaced with a re-export.

### Deleted Files

- `components/dashboard/ProjectSidebar.tsx` (replaced by Kanban boards)
- `components/dashboard/DashboardGraphCard.tsx` (replaced by full-tab map)
