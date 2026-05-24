# PRD: Project Sidebar

**Status:** Complete

## Goal

Transform the dashboard into a productivity tool by surfacing strategic pillars as "projects" in a collapsible sidebar, each expandable to reveal an interactive task list with checkboxes, due dates, priority indicators, and recursive subtask support.

## User Stories

1. As a student, I see my strategic pillars listed as projects so I can track work across all areas.
2. As a student, I can expand a project to see its tasks, check them off, and add new ones.
3. As a student, I can collapse the project sidebar to focus on the strategy map.
4. As a student, I can see progress counts (done/total) for each project at a glance.

## Scope

### In Scope

- Collapsible `ProjectSidebar` component (280px expanded, 48px collapsed)
- Pillar-based project list with pastel color dots
- Expandable task list per project with checkbox completion
- Inline manual task addition
- Due date and priority display
- Recursive subtask expansion
- Three-column layout: NavRail (72px) | ProjectSidebar | Workspace

### Out of Scope

- Gantt chart visualization (future)
- Drag-and-drop task reordering
- Task editing (name, dates) -- future enhancement
- "Add project" button (projects = pillars from AI)

## Acceptance Criteria

- [x] Projects sidebar renders all strategic pillars
- [x] Each pillar expands to show tasks with checkboxes
- [x] Checking a task persists to localStorage (and Supabase if configured)
- [x] Inline add creates a new task under the pillar
- [x] Sidebar collapses/expands with a toggle
- [x] Three-column layout is visually balanced
