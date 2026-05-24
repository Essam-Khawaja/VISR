# Feature Tech Spec: Graph And Onboarding Rebuild

## Status
Draft

## Related Docs

- Integration source of truth: [014-integration](../014-integration/)
- Existing onboarding source: [008-progressive-onboarding-strategy-map](../008-progressive-onboarding-strategy-map/)
- Existing graph visual source: [010-graph-visual-redesign](../010-graph-visual-redesign/)
- Existing task dialog source: [011-node-task-dialog](../011-node-task-dialog/)
- Existing dashboard source: [013-kanban-dashboard](../013-kanban-dashboard/)

## Technical Summary

This feature has three implementation streams:

1. **Graph visual correctness**
   - Replace duplicate visible node bodies with one unified node disk.
   - Size the node disk from measured label content.
   - Keep circular progress on the same visible disk.

2. **Graph growth from tasks**
   - Render canonical `StrategyTask` records as graph nodes.
   - When a task is created from a graph node, append it to the graph layout immediately.
   - Continue syncing tasks to Today/Week through feature 014's canonical task store.

3. **Premium university onboarding**
   - Replace the current profile-form-first onboarding with a multi-level graph builder.
   - Build graph scopes: university outcome -> academic years -> semesters -> current semester -> courses/commitments/tasks.
   - Store enough structured graph data to reconstruct and navigate these levels after onboarding.

## Files Expected To Change

### Graph

| File | Change |
|---|---|
| `components/2/graph/graphTypes.ts` | Add node kind(s), visual metrics, graph scope fields, task-node metadata. |
| `components/2/graph/graphLayout.ts` | Include task nodes in standard graph layouts. |
| `components/2/graph/buildOnboardingLayout.ts` | Replace ring-only course/commitment layout with multi-scope university/year/semester layouts. |
| `components/2/graph/graphNodes.ts` | Stop rendering a duplicate visible core when HTML/SVG node is the visible source, or resize mesh to match overlay exactly. |
| `components/2/graph/useGraphScene.ts` | Render one unified node overlay; pass click events from overlay or resize raycast hit targets. |
| `components/2/graph/GoalTree.tsx` | Pass `tasks`, `rollups`, graph scope, and task node click handlers into scene/layout builders. |
| `components/2/graph/NodeTaskDialog.tsx` | Keep canonical task creation, ensure added task node appears immediately in layout. |

### Onboarding

| File | Change |
|---|---|
| `app/page.tsx` | Redirect first-run users to onboarding if no active plan exists. |
| `app/2/onboarding/page.tsx` | Full-screen premium onboarding shell. |
| `components/2/onboarding/OnboardingShell.tsx` | Orchestrate new multi-scope flow and graph state. |
| `components/2/onboarding/OnboardingForm.tsx` | Replace current linear student profile steps with university strategy steps. |
| `components/2/onboarding/OnboardingMapPanel.tsx` | Make map the primary canvas and question card a top-left overlay. |
| `components/2/onboarding/onboardingTypes.ts` | Add university/program/year/semester fields. |
| `components/2/onboarding/onboardingMapTypes.ts` | Replace flat goal/course/commitment state with scoped graph state. |
| `components/2/onboarding/useOnboardingMap.ts` | Derive layouts by onboarding scope and active zoom level. |
| `components/2/onboarding/StepDestination.tsx` | Ask end-of-university identity. |
| `components/2/onboarding/StepAcademic.tsx` | Capture university/program/course requirements/current year. |
| `components/2/onboarding/StepCommitments.tsx` | Capture clubs/work/recurring commitments with semester assignment. |
| `components/2/onboarding/StepBrainDump.tsx` | Become bottleneck/current-semester risk capture. |
| `components/2/onboarding/GenerationLoading.tsx` | Optional: become a graph handoff overlay, not a hard route-feeling loading screen. |

### Data / Persistence

| File | Change |
|---|---|
| `lib/2/types.ts` | Add university onboarding types and graph node types. |
| `lib/2/validate.ts` | Add Zod schemas for onboarding graph and graph nodes. |
| `lib/2/taskStore.ts` | Add helper to load tasks as graph nodes for a parent. |
| `lib/2/planStore.ts` | Track active plan ID and onboarding graph metadata. |
| `db/schema.sql` | Add `strategy_nodes` if we decide graph structure needs table-level persistence. |
| `docs/supabase-schema.sql` | Continue pointing to canonical `db/schema.sql`. |

## Core Data Model

### Why Add Graph Nodes

Feature 014 made `strategy_tasks` the canonical execution model. That is still correct for dated tasks.

The new onboarding needs graph entities that are not tasks:

- University outcome.
- Academic years.
- Semesters.
- Courses.
- Clubs.
- Work.
- Projects.
- Strategic pillars.

These should not all be forced into `strategy_tasks`, because most are context nodes rather than due-date tasks.

Recommended MVP model:

- `strategy_nodes` stores the graph structure.
- `strategy_tasks` stores dated execution items.
- Task nodes are rendered from `strategy_tasks` and linked to `strategy_nodes`.

This preserves the 014 sync model while giving the graph a durable structure.

### New Runtime Types

```ts
export type StrategyGraphScope =
  | "university"
  | "year"
  | "semester"
  | "focus";

export type StrategyNodeKind =
  | "university_outcome"
  | "academic_year"
  | "semester"
  | "course"
  | "club"
  | "work"
  | "project"
  | "research"
  | "strategic_pillar"
  | "commitment"
  | "task";

export type AcademicTerm = "Fall" | "Winter" | "Spring" | "Summer";

export type StrategyNode = {
  id: string;
  planId: string;
  parentNodeId: string | null;
  kind: StrategyNodeKind;
  title: string;
  subtitle?: string;
  status: "open" | "doing" | "done" | "skipped" | "at_risk";
  scope: StrategyGraphScope;
  yearIndex?: number;
  term?: AcademicTerm;
  startDate?: string;
  endDate?: string;
  sortOrder: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};
```

### Extended Onboarding Profile

```ts
export type UniversityOnboardingProfile = {
  endOfUniversityGoal: string;
  university: string;
  degree: string;
  expectedProgramLengthYears: number;
  expectedGraduationYear?: number;
  totalCoursesRequired: number;
  coursesCompleted?: number;
  currentYearIndex: number; // 1-based
  currentSemester: AcademicTerm;
  typicalFallCourses?: number;
  typicalWinterCourses?: number;
  plansSpringSummerCourses: boolean;
  currentCourses: string[];
  recurringCommitments: SemesterCommitment[];
  workHoursPerWeek: number;
  constraints: string;
  bottleneckConcern: string;
};

export type SemesterCommitment = {
  id: string;
  title: string;
  kind: "club" | "work" | "research" | "project" | "family" | "other";
  semesters: AcademicTerm[];
  hoursPerWeek?: number;
};
```

### Onboarding Graph State

```ts
export type OnboardingGraphLevel =
  | "destination"
  | "university_timeline"
  | "current_year"
  | "current_semester"
  | "task_seed"
  | "handoff";

export type UniversityGraphDraft = {
  profile: Partial<UniversityOnboardingProfile>;
  activeLevel: OnboardingGraphLevel;
  activeNodeId: string | null;
  nodes: StrategyNode[];
  tasks: StrategyTask[];
  insights: Partial<Record<OnboardingGraphLevel, string>>;
};
```

Session key:

```ts
pathwise-onboarding-draft-v3
```

Active plan key:

```ts
visr.activePlanId
```

## Supabase Schema

### Add `strategy_nodes`

Add this after `strategy_plans` and before `strategy_tasks` in `db/schema.sql`.

```sql
create table if not exists strategy_nodes (
  id uuid primary key,
  plan_id uuid references strategy_plans(id) on delete cascade,
  parent_node_id uuid references strategy_nodes(id) on delete cascade,
  kind text not null,
  title text not null,
  subtitle text,
  status text not null default 'open',
  scope text not null,
  year_index integer,
  term text,
  start_date date,
  end_date date,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index if not exists strategy_nodes_plan_id_idx on strategy_nodes(plan_id);
create index if not exists strategy_nodes_parent_node_id_idx on strategy_nodes(parent_node_id);
create index if not exists strategy_nodes_scope_idx on strategy_nodes(scope);
create index if not exists strategy_nodes_kind_idx on strategy_nodes(kind);
create index if not exists strategy_nodes_plan_parent_sort_idx
  on strategy_nodes(plan_id, parent_node_id, sort_order);
```

### Update `strategy_tasks`

Keep existing 014 fields. Add a nullable `graph_node_id` if we want task rows to have a stable graph-node anchor.

```sql
alter table strategy_tasks
  add column if not exists graph_node_id uuid references strategy_nodes(id) on delete set null;

create index if not exists strategy_tasks_graph_node_id_idx on strategy_tasks(graph_node_id);
```

MVP rule:

- For task nodes created from the graph, create both:
  - a `strategy_tasks` row for Today/Week execution
  - a `strategy_nodes` row with `kind = 'task'` for graph structure
- Store the node ID in `strategy_tasks.graph_node_id`.

Fallback rule without Supabase:

- Store `strategy_nodes` in localStorage key:

```ts
visr.nodes.${planId}
```

## Graph Rendering

### Current Issue

The current implementation visually renders:

- A Three.js node mesh.
- A separate HTML label bubble.

This creates a duplicated-node look. The user sees the node shape and the label shape as two different circles.

### Desired Rendering

Each node should have exactly one visible disk:

- The disk contains the label text.
- The disk owns the circular progress ring.
- The disk is sized to fit the label.
- There is no second label bubble.
- There is no detached floating primary label.

### Recommended Implementation

Use the HTML/SVG overlay as the single visible node body, and keep Three.js objects for scene positioning, edges, animation anchors, and hit targets.

In `useGraphScene.ts`:

1. Keep each `NodeMesh.group` as the 3D anchor.
2. Make the visible mesh core transparent or disable its visual fill.
3. Create a single overlay element per node:

```html
<button class="graph-node">
  <svg class="graph-node-ring">...</svg>
  <span class="graph-node-label">Software Engineering Internship</span>
</button>
```

4. The overlay is the only visible circle/disk.
5. The overlay gets `pointer-events: auto`.
6. Clicking the overlay calls the same `select` logic as raycast clicking.
7. The hidden Three.js mesh hit target is resized to match the overlay's world radius, so canvas clicks still work.

Alternative implementation:

- Resize the Three.js mesh to fit the text and render text only in the overlay.
- This is harder to keep perfectly aligned and does not solve text wrapping as cleanly.

Decision for MVP:

- Use one visible HTML/SVG disk as the node.
- Hide the duplicate Three.js visual core.
- Keep Three.js for edges, drift, camera, and layout.

### Node Metrics

Add measured visual metrics to `LayoutNode`.

```ts
export type LayoutNode = GraphNodeData & {
  position: [number, number, number];
  radius: number;
  parentId: string | null;
  pastelColor?: string;
  progressPercent?: number;
  actionCount?: number;
  visual?: {
    diameterPx: number;
    radiusWorld: number;
    labelLines: string[];
  };
};
```

Text measurement helper:

```ts
measureNodeLabel(label, kind): {
  diameterPx: number;
  lines: string[];
}
```

Rules:

- No ellipsis for primary labels.
- Wrap at word boundaries first.
- Use `overflow-wrap: anywhere` only for very long unbroken strings.
- Diameter is based on the larger of:
  - needed text width
  - needed text height
  - minimum node diameter for kind

Suggested minimums:

```ts
goal: 148px
year: 118px
semester: 118px
pillar: 112px
course: 104px
task: 96px
```

### Circular Progress Ring

Implement ring in SVG so it is part of the same visible node.

```tsx
<svg viewBox="0 0 100 100">
  <circle className="track" cx="50" cy="50" r="47" />
  <circle
    className="progress"
    cx="50"
    cy="50"
    r="47"
    strokeDasharray={`${progress * 295} 295`}
  />
</svg>
```

Color rules:

- Interior fill: node pastel color.
- Ring progress: darker version of fill.
- Ring track: transparent darker shade at 18-24% opacity.
- Done node: full ring.
- Open leaf task: empty ring.
- Parent node: direct done children / direct total children.

### Graph Layout With Task Nodes

Task nodes should come from canonical tasks.

Input to layout:

```ts
type GraphLayoutInput = {
  plan: StrategyPlan;
  nodes: StrategyNode[];
  tasks: StrategyTask[];
  activeNodeId: string;
  scope: StrategyGraphScope;
};
```

Rules:

- If graph is in focus/nucleus mode, the active center node's children are:
  - child `StrategyNode` rows
  - `StrategyTask` rows where `parentNodeId === activeNodeId`
  - `StrategyTask` rows where `parentTaskId === activeNodeId`
- Added task appears immediately as an orbit node around the active center.
- Clicking an orbit task node can:
  - open task detail if it has no children
  - zoom into it if it has child tasks

### Adding A Task From The Center Node

When the selected node is the center/nucleus:

```ts
await createTask({
  parentNodeId: activeCenterNodeId,
  parentNodeKind: inferParentKind(activeCenterNode),
  parentTaskId: activeCenterTaskIdOrNull,
  title,
  dueDate,
  priority,
  source: "strategy_map",
});
```

Then:

1. Update canonical task store.
2. Update graph node store if `strategy_nodes` is enabled.
3. Refresh layout input.
4. Animate task node in from center to orbit position.
5. Today/Week pick it up by due date.

## Onboarding Architecture

### Routing

`app/page.tsx` should become a first-run router:

```ts
if no active plan:
  redirect("/strategyweb/onboarding")
else:
  redirect(`/strategyweb/dashboard/${activePlanId}`)
```

Keep a marketing/demo link only if needed via:

```text
/2/demo
/2/dashboard/demo-cs-student-001
```

### Layout

`OnboardingShell` becomes full-screen:

```tsx
<main className="relative h-[100dvh] overflow-hidden bg-base">
  <OnboardingMapPanel />
  <QuestionCard />
  <StepProgress />
</main>
```

Question card:

- `position: absolute; left: 24px; top: 24px;`
- Width `min(420px, calc(100vw - 32px))`.
- High contrast.
- Rounded radius 16px or less.
- Premium shadow.
- Inputs inside card only.
- The map is never hidden behind a full-page form.

Mobile:

- Card docks at bottom or top.
- Map remains visible above/below.
- The card can collapse after answer entry.

### Onboarding State Machine

```ts
const ONBOARDING_STEPS = [
  "end_state",
  "university_context",
  "year_zoom",
  "current_semester",
  "task_seed",
  "handoff",
] as const;
```

Each step has:

```ts
type OnboardingStepConfig = {
  id: OnboardingStepId;
  question: string;
  helper?: string;
  validate(profile): StepErrors;
  applyGraphDelta(draft): UniversityGraphDraft;
  nextLevel?: OnboardingGraphLevel;
};
```

### Step 1: End State

Data:

```ts
endOfUniversityGoal: string;
```

Graph delta:

- Create `university_outcome` root node.
- Active level: `destination`.

### Step 2: University Context

Data:

```ts
university: string;
degree: string;
expectedProgramLengthYears: number;
totalCoursesRequired: number;
coursesCompleted?: number;
currentYearIndex: number;
expectedGraduationYear?: number;
```

Graph delta:

- Create `academic_year` nodes:

```text
Year 1 -> Year 2 -> Year 3 -> Year 4
```

- Attach them to the university outcome.
- Active level: `university_timeline`.
- Highlight current year.

Course distribution:

```ts
remainingCourses = totalCoursesRequired - coursesCompleted;
remainingFallWinterTerms =
  (expectedProgramLengthYears - currentYearIndex + 1) * 2;
defaultFallWinterLoad = Math.ceil(remainingCourses / remainingFallWinterTerms);
```

Store estimate in year/semester metadata, not as final truth.

### Step 3: Year Zoom

Data:

```ts
currentSemester: AcademicTerm;
typicalFallCourses?: number;
typicalWinterCourses?: number;
plansSpringSummerCourses: boolean;
recurringCommitments: SemesterCommitment[];
```

Graph delta:

- Active node becomes current year.
- Create semester nodes:
  - Fall
  - Winter
  - Spring
  - Summer
- Fall/Winter course estimates assigned automatically.
- Spring/Summer course estimates are 0 unless user says yes.
- Commitment nodes attach to selected semesters.

### Step 4: Current Semester

Data:

```ts
currentCourses: string[];
workHoursPerWeek: number;
constraints: string;
activeClubs: SemesterCommitment[];
activeProjects: SemesterCommitment[];
```

Graph delta:

- Active node becomes current semester.
- Create course nodes.
- Create work/club/project nodes.
- Create strategic pillar nodes based on end goal, but do not create AI tasks.

Pillar creation can be deterministic:

For software/internship-like goals:

- Academics.
- Portfolio / Skill Signal.
- Recruiting / Network.
- Interview Readiness.
- Commitment Load.

For other goals:

- Academic Foundation.
- Proof / Portfolio / Experience.
- Network / Mentors.
- Applications / Opportunities.
- Capacity.

### Step 5: User Task Seed

Data:

```ts
taskDrafts: Array<{
  parentNodeId: string;
  title: string;
  dueDate: string;
  priority: Priority;
}>;
```

Graph behavior:

- Task preview node appears as soon as the user adds it.
- Task persists to `strategy_tasks`.
- If graph nodes table exists, also create task `strategy_nodes`.

No AI generation in this step.

### Step 6: Handoff

Data:

```ts
bottleneckConcern: string;
brainDump?: string;
```

Graph behavior:

- Highlight likely bottleneck node.
- Show a final "Build dashboard" action.
- Save profile, nodes, and tasks.
- Redirect to dashboard.

## API / Persistence

### `POST /api/strategyweb/onboarding/complete`

New route recommended for this feature.

Request:

```ts
{
  profile: UniversityOnboardingProfile;
  graph: UniversityGraphDraft;
}
```

Response:

```ts
{
  planId: string;
  studentId: string;
}
```

Server behavior:

1. Validate profile and graph.
2. Create or update `student_profiles`.
3. Create `strategy_plans` JSON summary.
4. Insert `strategy_nodes`.
5. Insert `strategy_tasks`.
6. Set active plan on client after response.
7. If Supabase is unavailable, store locally through `planStore`, `nodeStore`, and `taskStore`.

### Active Plan

Add helpers:

```ts
getActivePlanId(): string | null
setActivePlanId(planId: string): void
clearActivePlanId(): void
```

Local key:

```ts
visr.activePlanId
```

Today and Week should eventually use this active plan instead of hardcoded demo ID. However, keep seeded demo tasks visible for demo routes.

## AI Usage

Do not use AI to generate tasks in onboarding.

Allowed AI:

- Opportunity checker after dashboard.
- Strategy evaluation after onboarding handoff.
- Optional concise insight copy during onboarding.

Not allowed in this feature:

- "Generate my tasks" during onboarding.
- Automatically creating task nodes from AI output.

## Implementation Order

1. Fix one-node rendering.
2. Render canonical tasks as graph nodes.
3. Add graph node store/types if needed.
4. Add active plan helpers.
5. Rework onboarding data model.
6. Build premium onboarding shell.
7. Implement university timeline graph.
8. Implement current year semester graph.
9. Implement current semester detail graph.
10. Implement manual task seeding.
11. Save and redirect to dashboard.
12. Switch first-open root behavior to onboarding/active plan routing.
13. Preserve demo paths and seeded Today tasks.

## Risks

- Graph scope expansion can get large. Keep each view focused on one level.
- Text measurement can be brittle. Use conservative circle sizes and wrap text.
- Adding `strategy_nodes` adds persistence complexity. Use localStorage fallback first, then Supabase.
- First-run redirect can block demo access. Keep `/strategyweb/demo` and `/strategyweb/dashboard/demo-cs-student-001` unchanged.
- AI generation route names may imply task generation. UI copy must not offer AI task creation during onboarding.

