# PRD: Integration

## Status
Planned

## Purpose

Pathwise currently feels like two adjacent products:

1. A daily/week execution app under Perspective 1.
2. A strategy-map planning app under Perspective 2.

The next feature must make them feel like one system. The Strategy Map should be the place where students decide what matters, and the daily/week views should be the place where those same tasks become scheduled, dated, and completed. A task added anywhere must be the same task everywhere.

## User Story

As a student, I want to add a task to any node in my Strategy Map, give it a date, and see it appear automatically in my daily and weekly views so my strategy and execution stay synced.

## Product Problem

The app currently has duplicate mental models:

- Strategy Map nodes and recursive task children live in the Pathwise strategy plan/state.
- Daily and week views live in the separate daily-flow app and read events, routines, and manual checklist items.
- The home page presents two perspectives instead of one unified Pathwise workspace.
- Completing a graph task does not reliably update the daily/week experience.
- Daily/week tasks do not carry strategic context such as parent node, pillar, bottleneck, or route priority.

This makes the product feel shallow and disconnected even when individual screens work.

## Product Goal

Unify Pathwise into one integrated command center:

- Strategy Map remains the strategic source of meaning.
- Daily and week views become execution views over the same task data.
- Supabase stores graph tasks, dates, completion, hierarchy, and plan state in one coherent schema.
- Graph node completion rolls up from child task completion.
- Every graph view keeps text inside nodes and visualizes progress around nodes with a circular ring.

## Core Requirements

### 1. One App Shell

- Remove the product-level split between Perspective 1 and Perspective 2.
- Replace the dual-card home experience with one Pathwise entry point.
- Keep daily, week, strategy map, opportunity checker, and settings as views inside one app shell.
- Navigation should feel like one workspace:
  - Today
  - Week
  - Strategy Map
  - Opportunities
  - Settings

### 2. Unified Task Source

Every user-visible task must have one canonical record.

A task can be created from:

- Strategy Map node dialog.
- AI task generation on a node.
- Daily view manual add.
- Week view manual add.
- Opportunity check application.
- Initial strategy generation / deterministic demo seed.

The same task must appear in:

- The Strategy Map under its parent node.
- Today view if `due_date` is today.
- Week view if `due_date` is within the visible week.
- Any node task dialog for its graph parent.

### 3. Date-Aware Graph Tasks

When adding a task from the Strategy Map:

- Date is required.
- Priority is optional but recommended.
- Status defaults to `open`.
- Parent node is recorded.
- Task appears immediately in daily/week views for that date.

Task row fields:

- title
- due date
- status
- priority
- parent strategy node label
- optional notes/recommendation

### 4. Completion Sync

Completion must be bidirectional:

- Marking a task done on the graph marks it done on daily/week.
- Marking a task done on daily/week marks it done on the graph.
- Reopening a task anywhere reopens it everywhere.

Parent rollup:

- A parent node is considered complete if all direct children are complete.
- A goal/pillar/task with no children uses its own explicit status or strategic status.
- Rollup should be computed consistently in graph layout, node dialog, and daily/week badges.

### 5. Circular Node Progress

Replace the linear progress bar around graph nodes with a circular progress ring:

- The node interior uses its existing fill color.
- The progress ring is a darker shade of the node color.
- Ring percentage represents child completion.
- For a leaf task, ring is 100% if done, 0% otherwise.
- For a parent node, ring is completed child count divided by total child count.
- If a parent has no children, show no ring or a subtle empty ring.

### 6. Text Inside Nodes

Every graph view must keep node text inside the node:

- Strategy dashboard map.
- Expanded map.
- Onboarding map.
- Any pillar/task focused map view.

Nodes must size themselves to fit their label:

- No truncated node text.
- No labels floating separately as the primary node name.
- Multi-line wrapping is allowed.
- The layout must account for dynamic node size to avoid overlap as much as possible.

### 7. Daily / Week Integration

Daily and week views must include strategy tasks alongside existing calendar items.

Today view:

- Shows dated strategy tasks for the selected day.
- Allows mark done/reopen.
- Shows parent strategy context.
- Should not require opening Strategy Map to execute the day.

Week view:

- Shows strategy tasks on their due dates.
- Allows mark done/reopen or opens task detail.
- Provides a clear visual distinction between calendar events and strategy tasks.

### 8. Supabase Setup Guidance

The feature must include clear setup instructions:

- Which schema file to run.
- Which env vars are required.
- Which tables are canonical.
- How existing localStorage/demo data migrates.
- How to verify task sync after setup.

## Out of Scope

- Full calendar drag-and-drop scheduling.
- Multi-user auth and row-level ownership.
- External calendar sync.
- Hard deletes with audit history.
- Complex dependency graph scheduling.
- Notification reminders.

## Acceptance Criteria

- A task added to any Strategy Map node with a due date appears in Today/Week for that date.
- Completing the task from Today/Week updates graph state.
- Completing the task from the graph updates Today/Week.
- Parent graph nodes show circular progress based on child completion.
- Parent graph nodes become visually complete when all children are done.
- Node labels fit inside graph nodes in all graph modes.
- The app no longer presents as two separate products from the home/navigation experience.
- Supabase setup instructions are clear enough to run after implementation.
- Demo plan still works without Supabase, using deterministic in-memory/local fallback.

