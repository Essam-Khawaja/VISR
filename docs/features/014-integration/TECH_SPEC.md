# TECH SPEC: Integration

## Status
Planned

## Current Repo Findings

The repo currently has two visible app areas:

- `/1`: daily-flow views and APIs, including Today, Week, routines, calendar events, manual checklist items, and supporting Supabase tables.
- `/2`: Pathwise strategy views and APIs, including onboarding, dashboard, Strategy Map, Opportunity Checker, graph task dialog, recursive action nodes, and local/Supabase plan state.

The strategy side already has early recursive task support:

- `ActionNode.children?: ActionNode[]`
- `ActionNode.dueDate?: string`
- `ActionNode.priority?: Priority`
- `ActionState = "open" | "doing" | "done" | "skipped"`
- `addTasksToNode(planId, parentNodeId, tasks)`
- `NodeTaskDialog`
- `KanbanDashboard`

The integration gap is that graph tasks are still primarily nested in strategy plan JSON/state, while daily/week views read daily-flow tables. The fix is to make tasks first-class and shared.

## Architectural Decision

Use a canonical `strategy_tasks` table as the shared execution model.

Do not make daily/week strategy tasks into calendar `events` by default. Strategy tasks are usually date-based work items, not time-blocked calendar events. They may later be scheduled into events, but for this integration pass they remain tasks with a `due_date`.

Daily/week views should render a combined agenda:

- `events`: timed calendar items.
- `manual_checklist_items`: non-strategy daily checklist items, if kept.
- `strategy_tasks`: date-based strategy work items.

The Strategy Map, Today view, Week view, and Kanban view must all mutate `strategy_tasks`.

## Unified Supabase Schema

`db/schema.sql` should become the canonical schema. `docs/supabase-schema.sql` should either mirror it or clearly point to `db/schema.sql`.

### Existing Tables To Keep

Keep these daily-flow tables:

- `events`
- `items`
- `event_items`
- `category_default_items`
- `saved_locations`
- `user_settings`
- `routines`
- `custom_categories`
- `personal_time_blocks`
- `manual_checklist_items`

Keep these strategy tables:

- `student_profiles`
- `strategy_plans`
- `opportunity_checks`

### Add Canonical Task Table

```sql
create table if not exists strategy_tasks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references strategy_plans(id) on delete cascade,
  student_id uuid references student_profiles(id) on delete set null,

  -- Graph attachment
  parent_node_id text not null,
  parent_node_kind text not null default 'pillar'
    check (parent_node_kind in ('goal', 'pillar', 'task')),
  parent_task_id uuid references strategy_tasks(id) on delete cascade,

  -- User-facing task fields
  title text not null,
  recommendation text not null default '',
  notes text not null default '',
  priority text not null default 'Medium'
    check (priority in ('High', 'Medium', 'Low')),
  status text not null default 'open'
    check (status in ('open', 'doing', 'done', 'skipped')),

  -- Date sync
  due_date date not null,
  completed_at timestamptz,

  -- Source + ordering
  source text not null default 'strategy_map'
    check (source in ('strategy_map', 'daily', 'week', 'ai', 'opportunity', 'generated_plan')),
  source_action_id text,
  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_strategy_tasks_plan on strategy_tasks(plan_id);
create index if not exists idx_strategy_tasks_due_date on strategy_tasks(due_date);
create index if not exists idx_strategy_tasks_parent_node on strategy_tasks(plan_id, parent_node_id);
create index if not exists idx_strategy_tasks_parent_task on strategy_tasks(parent_task_id);
create index if not exists idx_strategy_tasks_status on strategy_tasks(status);
```

### Optional Helpful View

```sql
create or replace view strategy_task_rollups as
select
  parent.plan_id,
  parent.id as parent_task_id,
  count(child.id) as child_count,
  count(child.id) filter (where child.status = 'done') as done_count,
  case
    when count(child.id) = 0 then null
    else count(child.id) filter (where child.status = 'done')::numeric / count(child.id)
  end as completion_ratio
from strategy_tasks parent
left join strategy_tasks child on child.parent_task_id = parent.id
group by parent.plan_id, parent.id;
```

The app should still compute rollups client-side for graph nodes because pillars and the goal live in plan JSON, not in `strategy_tasks`.

### Update Existing Strategy Tables

`strategy_plans.state` can remain for UI-only state, but task completion should move out of `state.actionStates`.

Recommended `state` after integration:

```ts
type StrategyPlanState = {
  appliedCuts: string[];
  commitments: Commitment[];
  journal: JournalEntry[];
  opportunityHistory: OpportunityCheck[];
};
```

Temporary compatibility:

- Continue reading `state.actionStates` if present.
- On first load after integration, migrate known `actionStates` into `strategy_tasks.status`.
- After migration, writes go only to `strategy_tasks`.

## Type Model

Add a first-class task type.

```ts
export type StrategyTaskStatus = "open" | "doing" | "done" | "skipped";
export type StrategyTaskSource =
  | "strategy_map"
  | "daily"
  | "week"
  | "ai"
  | "opportunity"
  | "generated_plan";

export type StrategyTask = {
  id: string;
  planId: string;
  studentId?: string | null;
  parentNodeId: string;
  parentNodeKind: "goal" | "pillar" | "task";
  parentTaskId?: string | null;
  title: string;
  recommendation: string;
  notes: string;
  priority: Priority;
  status: StrategyTaskStatus;
  dueDate: string; // YYYY-MM-DD
  completedAt?: string | null;
  source: StrategyTaskSource;
  sourceActionId?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
```

Keep `ActionNode` as the strategic AI output shape, but do not use it as the canonical runtime task shape.

```ts
export type ActionNode = {
  id: string;
  name: string;
  status: NodeStatus;
  recommendation: string;
  children?: ActionNode[]; // legacy/read compatibility only
  dueDate?: string;        // legacy/read compatibility only
  priority?: Priority;     // legacy/read compatibility only
  notes?: string;          // legacy/read compatibility only
};
```

## Data Flow

### Initial Strategy Generation

When `/api/2/generate` creates a plan:

1. Save `student_profiles`.
2. Save `strategy_plans.plan`.
3. Materialize initial tasks into `strategy_tasks`:
   - Every `plan.nextSevenDays` item becomes a `strategy_tasks` row.
   - If a next-seven-days item matches a pillar action by title, set `source_action_id` to that action id and `parent_node_id` to the pillar id.
   - If no match exists, attach it to the goal node with `parent_node_kind = 'goal'`.
   - Assign `due_date` across the next seven days. MVP default:
     - High priority: today or tomorrow.
     - Medium priority: days 2-5.
     - Low priority: days 5-7.
4. Keep deterministic fallback doing the same materialization locally when Supabase is absent.

### Graph Task Creation

When the user adds a task from a graph node:

1. User enters title.
2. User selects due date.
3. User optionally selects priority.
4. Client calls `createStrategyTask`.
5. The task is inserted in Supabase and local cache.
6. Graph task list, daily view, and week view all update from the same task collection.

For node attachment:

| Selected node | parent_node_kind | parent_node_id | parent_task_id |
|---|---|---|---|
| Goal node | `goal` | `goal` | `null` |
| Pillar node | `pillar` | `pillar.id` | `null` |
| Task node | `task` | `task.id` | `task.id` |

If the selected task was originally an `ActionNode` from plan JSON and not yet in `strategy_tasks`, create a backing `strategy_tasks` row first with `source = 'generated_plan'`.

### Daily View Read

Daily view fetches:

```text
GET /api/1/events?date=YYYY-MM-DD
GET /api/2/tasks?planId=...&date=YYYY-MM-DD
```

or, after route consolidation:

```text
GET /api/tasks?planId=...&date=YYYY-MM-DD
```

It renders strategy tasks in a dedicated "Strategy Tasks" section or inline agenda band. Do not mix them visually with timed events unless they have an explicit scheduled time later.

### Week View Read

Week view fetches:

```text
GET /api/tasks?planId=...&dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
```

Group by `dueDate`.

### Completion Update

Any view marks task complete through one shared action:

```ts
updateStrategyTaskStatus(taskId, "done")
```

This updates:

- Supabase `strategy_tasks.status`
- `completed_at`
- local cache
- graph rollup state
- daily/week task rows

## API Contract

### `GET /api/2/tasks`

Query:

```ts
{
  planId: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  parentNodeId?: string;
  parentTaskId?: string;
}
```

Response:

```ts
{
  tasks: StrategyTask[];
}
```

### `POST /api/2/tasks`

Request:

```ts
{
  planId: string;
  parentNodeId: string;
  parentNodeKind: "goal" | "pillar" | "task";
  parentTaskId?: string | null;
  title: string;
  dueDate: string;
  priority?: "High" | "Medium" | "Low";
  recommendation?: string;
  notes?: string;
  source?: StrategyTaskSource;
}
```

Response:

```ts
{
  task: StrategyTask;
}
```

### `PATCH /api/2/tasks/[taskId]`

Request:

```ts
{
  title?: string;
  dueDate?: string;
  priority?: "High" | "Medium" | "Low";
  status?: "open" | "doing" | "done" | "skipped";
  notes?: string;
}
```

Response:

```ts
{
  task: StrategyTask;
}
```

## Client Store

Create a task store helper alongside `planStore`.

```ts
loadTasks(planId): StrategyTask[]
fetchTasksFromSupabase(filters): Promise<StrategyTask[]>
createStrategyTask(input): Promise<StrategyTask>
updateStrategyTask(taskId, patch): Promise<StrategyTask>
deleteStrategyTask(taskId): Promise<void>
tasksForNode(tasks, nodeId): StrategyTask[]
tasksForDate(tasks, date): StrategyTask[]
computeNodeRollup(nodeId, tasks): NodeRollup
```

Use write-through cache:

1. Update local state immediately.
2. Fire Supabase mutation.
3. If mutation fails, keep local state and show non-blocking sync warning.

## Rollup Rules

```ts
type NodeRollup = {
  childCount: number;
  doneCount: number;
  completionRatio: number; // 0..1
  derivedStatus: "open" | "doing" | "done" | "skipped";
};
```

Rules:

- `childCount = direct child tasks + direct child strategy nodes`.
- A leaf task is done if `status === "done"`.
- A parent is done if `childCount > 0 && doneCount === childCount`.
- A parent is doing if any child is `doing` or any child is done but not all are done.
- A parent is open if no child is done/doing.
- A parent is skipped only if all children are skipped.

Graph display should use `derivedStatus` for ring color/progress, while preserving original strategic status text where useful.

## Strategy Map Changes

### Add Date + Done To Node Task Dialog

`NodeTaskDialog` Tasks tab must support:

- Add task title.
- Required due date input.
- Priority selector.
- Mark done/reopen.
- Show due date for every task.
- Show overdue state if `dueDate < today && status !== "done"`.

AI Generate tab must preview tasks with editable due dates before adding.

### Render Canonical Tasks

Graph layout should combine:

- Static strategy nodes from `plan.strategicPillars`.
- Canonical `strategy_tasks` attached to the selected/visible graph node.

Do not write newly added graph tasks into `ActionNode.children` as the source of truth. If needed during migration, mirror tasks into `children` only as a temporary compatibility layer.

### Circular Progress Ring

Replace node progress rendering with circular rings:

- Use `RingGeometry` around each node.
- Ring background: darker shade of node fill at low opacity.
- Ring foreground: darker shade of node fill at full opacity.
- Progress segment angle = `completionRatio * 2π`.
- For CSS/HTML graph nodes, use `conic-gradient`.
- For Three.js nodes, use one of:
  - MVP: circular SVG/HTML overlay anchored to projected node position.
  - Better: custom `BufferGeometry` arc mesh around each node.

Recommended MVP: HTML/SVG overlay because it is easier to control text sizing and progress rings.

### Text Inside Nodes

Use measured text sizing for all graph nodes.

Implementation option A, recommended:

- Move graph node rendering to HTML overlays anchored by Three.js projected positions.
- Keep Three.js for edges, camera, drift, and spatial feel.
- Node overlay is a real `button` with text wrapping and `conic-gradient` ring.
- Node dimensions are measured from text length and node kind.

Implementation option B:

- Generate canvas textures per node label.
- Attach as `THREE.Sprite`.
- Compute node radius from wrapped text lines.

MVP recommendation: option A.

Sizing algorithm:

```ts
function measureNode(label: string, kind: NodeKind): NodeBox {
  const maxCharsPerLine = kind === "goal" ? 18 : kind === "pillar" ? 16 : 14;
  const lines = wrapWords(label, maxCharsPerLine);
  const width = clamp(maxLineLength(lines) * charWidth + paddingX * 2, minWidth, maxWidth);
  const height = lines.length * lineHeight + paddingY * 2;
  const radius = Math.max(width, height) / 2;
  return { width, height, radius, lines };
}
```

Rules:

- No ellipsis for primary node labels.
- Wrap up to the number of lines needed.
- Increase node width/height instead of clipping text.
- Layout uses measured node boxes for collision spacing.

## Daily / Week UI Integration

### Today View

Add a Strategy Tasks section:

- Date = selected date.
- Group by priority or parent pillar.
- Show title, parent node, priority, status, and due date.
- Done/reopen button updates canonical task.
- Clicking a task opens graph node/task detail if in strategy context.

### Week View

Add strategy tasks to each day cell:

- Show compact task chips under events.
- Done tasks are visually muted.
- Overdue tasks use warning/danger treatment.
- Clicking a task opens task detail.

### Remove Dual App Layout

Replace the root two-card perspective page with one Pathwise dashboard entry.

Recommended routes after integration:

```text
/                      -> unified Pathwise home or redirect to /2/dashboard/demo-cs-student-001 for demo
/today                 -> daily view
/week                  -> week view
/strategy              -> strategy dashboard/map
/strategy/[planId]     -> specific strategy plan
/opportunities         -> opportunity checker/history
/settings              -> app settings
```

MVP route compatibility:

- Keep `/1` and `/2` routes temporarily as redirects.
- Do not break demo links.

## Migration Plan

### Local State Migration

On first load after integration:

1. Load stored plan from localStorage.
2. Read `plan.nextSevenDays`.
3. Read recursive `ActionNode.children`.
4. Read `state.actionStates`.
5. Create missing local `StrategyTask` cache records.
6. If Supabase configured, upsert those records into `strategy_tasks`.
7. Mark migration flag `pathwise.tasks.migrated.v1`.

### Supabase Migration

Add `strategy_tasks` without dropping existing data.

Backfill:

```sql
-- Pseudocode only; easier to do in app code because plan json shapes vary.
-- For each strategy_plans row:
--   parse plan.nextSevenDays
--   insert strategy_tasks rows with source='generated_plan'
```

MVP can skip database backfill and let client migration materialize tasks on first open.

## Supabase Setup Guide After Integration

1. Create a Supabase project.
2. Copy these env vars into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
```

3. Open Supabase SQL Editor.
4. Run `db/schema.sql` after it includes the `strategy_tasks` table.
5. Optionally run `db/seed.sql` for showcase calendar/daily data.
6. Start the app:

```bash
npm run dev
```

7. Verify:
   - Open the demo strategy.
   - Add a task to a Strategy Map node with today's date.
   - Open Today view and confirm the task appears.
   - Mark it done in Today.
   - Return to Strategy Map and confirm the node ring updates.
   - Add a task with a future date.
   - Open Week view and confirm it appears on the correct day.

## Failure Handling

- Missing Supabase env: use localStorage task cache.
- Supabase write fails: keep local task and show subtle "Not synced" state.
- Missing due date on task creation: block submit and focus date field.
- Invalid due date: block submit.
- Task deleted from another view: graph removes it on next task refresh.
- Parent node no longer exists: show task under "Unattached strategy tasks" until reassigned.

## Testing

### Unit

- `tasksForDate` filters by `dueDate`.
- `tasksForNode` filters by parent node/task.
- `computeNodeRollup` handles empty, partial, all done, and all skipped children.
- Date conversion preserves local date without timezone off-by-one.
- Migration creates no duplicate tasks on repeated load.

### Integration

- Add task from goal node -> appears in Today.
- Add task from pillar node -> appears in Today and under pillar dialog.
- Add task from task node -> appears as child task and in Week.
- Mark done in graph -> daily task done.
- Mark done in daily -> graph ring updates.
- All child tasks done -> parent node visually complete.
- Reopen one child -> parent node no longer complete.

### Visual

- Long node label wraps inside node.
- Circular ring visible around goal, pillar, and task nodes.
- Ring color is darker than node fill.
- Nodes do not overlap at standard demo viewport.
- Expanded map and onboarding graph both keep labels inside nodes.

