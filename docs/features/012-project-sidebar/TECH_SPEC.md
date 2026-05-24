# TECH_SPEC: Project Sidebar

**Status:** Complete

## Architecture

### Layout Change

```
Before: [ DashboardSidebar (72/240px) ] [ Workspace (flex-1) ]
After:  [ NavRail (72px) ] [ ProjectSidebar (280px collapsible) ] [ Workspace (flex-1) ]
```

`DashboardSidebar` is shrunk to a 72px icon-only nav rail. `ProjectSidebar` sits between it and the workspace.

### New File

**`components/dashboard/ProjectSidebar.tsx`**

- `ProjectSidebar` accepts `collapsed` and `onToggleCollapse` props
- When collapsed: 48px-wide strip with expand chevron
- When expanded: 280px panel with "Projects" header and pillar list

### Internal Components

- `PillarSection`: collapsible section per pillar with color dot, name, progress badge, expand arrow, and inline add
- `TaskRow`: recursive row for each `ActionNode` with checkbox, name, due date, priority indicator, and child expansion

### Data Flow

```
PlanProvider
  └─ plan.strategicPillars → ProjectSidebar
       └─ stored.actionStates → checkbox state
       └─ markAction() → toggle done/open
       └─ addTasks() → inline add
```

### Modified Files

- `components/dashboard/DashboardLayout.tsx` -- add `ProjectSidebar`, manage collapse state
- `components/layout/DashboardSidebar.tsx` -- shrink to 72px icon-only rail

### Type Enrichment

`ActionNode` in `lib/types.ts` gained optional fields: `dueDate`, `priority`, `notes`. Zod schema updated accordingly.
