# Feature Tech Spec: Node Task Dialog and AI Generator

## Status
Complete

## Related Docs
- Global Architecture: `docs/architecture/ARCHITECTURE.md`
- Feature PRD: [PRD.md](./PRD.md)
- Feature 009 (Pastel Theme): `docs/features/009-pastel-theme-overhaul/`
- Feature 010 (Graph Visual Redesign): `docs/features/010-graph-visual-redesign/`

## Technical Summary

This feature replaces the current `SelectionCard` component with a new `NodeTaskDialog` tabbed component. It introduces recursive task expansion via data model changes to `ActionNode`, a new API route for AI task generation, and modifications to the graph layout to render dynamically added child nodes.

## Files Expected to Change

| File | Change Type | Description |
|---|---|---|
| `lib/types.ts` | Modify | Add `children?: ActionNode[]` to `ActionNode` |
| `components/graph/SelectionCard.tsx` | Replace | Becomes `NodeTaskDialog.tsx` |
| `components/graph/NodeTaskDialog.tsx` | New | Tabbed dialog: Tasks tab + AI Generate tab |
| `components/graph/GoalTree.tsx` | Modify | Render `NodeTaskDialog` instead of `SelectionCard`, pass new props |
| `components/graph/graphLayout.ts` | Modify | Handle rendering child nodes from recursive `ActionNode.children` |
| `components/graph/graphTypes.ts` | Modify | No structural changes needed (ActionNode children are layout-time) |
| `app/api/node/tasks/route.ts` | New | Groq-powered task generation endpoint |
| `lib/prompts.ts` | Modify | Add task generation system/user prompts |
| `lib/validate.ts` | Modify | Add request/response schemas for task generation |
| `lib/planStore.ts` | Modify | Add functions for adding tasks, persisting recursive structure |
| `components/graph/useGraphScene.ts` | Modify | Support dynamic node/edge addition without full re-init |

## Detailed Changes

### 1. Data Model Extension (`lib/types.ts`)

```typescript
export type ActionNode = {
  id: string;
  name: string;
  status: NodeStatus;
  recommendation: string;
  children?: ActionNode[];  // NEW: recursive subtasks
};
```

This is backward-compatible. Existing `ActionNode` objects without `children` are treated as leaf nodes.

### 2. Component: NodeTaskDialog (`components/graph/NodeTaskDialog.tsx`)

**Component tree:**
```
NodeTaskDialog
├── DialogHeader (node name, status badge, close button)
├── TabBar ("Tasks" | "AI Generate")
├── TasksTab
│   ├── TaskList
│   │   └── TaskRow[] (checkbox, name, expand button)
│   └── AddTaskInline (+ button → input → Enter to add)
└── AIGenerateTab
    ├── PromptInput (textarea + Generate button)
    ├── LoadingState (spinner)
    └── TaskPreview (checkbox list + "Add selected" button)
```

**Props:**
```typescript
type NodeTaskDialogProps = {
  plan: StrategyPlan;
  selection: GraphSelection;
  actionStates: Record<string, ActionState>;
  onSelect: (selection: GraphSelection) => void;
  onClose: () => void;
  onToggleAction: (actionId: string, state: ActionState) => void;
  onAddTasks: (parentNodeId: string, tasks: NewTask[]) => void;
  isDemo: boolean;
};

type NewTask = {
  name: string;
  recommendation: string;
};
```

**Tab state:**
- `activeTab: "tasks" | "generate"` -- local state in the dialog.
- Switching tabs preserves the other tab's state.

**Tasks tab state:**
- `addingTask: boolean` -- whether the inline input is shown.
- `newTaskName: string` -- the input value.

**AI Generate tab state:**
- `prompt: string` -- user input.
- `isGenerating: boolean` -- loading state.
- `previewTasks: Array<NewTask & { selected: boolean }>` -- generated tasks with selection state.
- `error: string | null` -- error message.

### 3. Resolving the Selected Node

The current `resolveSelection` function in `SelectionCard.tsx` resolves a `GraphSelection` to a pillar or action from the flat `StrategyPlan`. With recursive children, resolution must walk the tree:

```typescript
function resolveNode(
  plan: StrategyPlan,
  selection: GraphSelection,
): ResolvedNode | null {
  if (!selection) return null;

  for (const pillar of plan.strategicPillars) {
    if (pillar.id === selection.nodeId) {
      return { kind: "pillar", pillar, actions: pillar.actions };
    }
    const found = findActionDeep(pillar.actions, selection.nodeId);
    if (found) {
      return { 
        kind: "action", 
        pillar, 
        action: found, 
        actions: found.children ?? [] 
      };
    }
  }
  return null;
}

function findActionDeep(actions: ActionNode[], id: string): ActionNode | null {
  for (const action of actions) {
    if (action.id === id) return action;
    if (action.children) {
      const found = findActionDeep(action.children, id);
      if (found) return found;
    }
  }
  return null;
}
```

### 4. Adding Tasks

**Manual addition:**
1. User clicks "+", types task name, presses Enter.
2. `onAddTasks(parentNodeId, [{ name, recommendation: "User-created task" }])` is called.
3. Parent component (`GoalTree` or a state manager) creates a new `ActionNode` with a generated `id` (e.g., `crypto.randomUUID()`), status `"On Track"`, and appends to the parent's `children` array.
4. State is persisted to localStorage via `planStore`.

**AI generation:**
1. User types a prompt and clicks "Generate."
2. `POST /api/node/tasks` is called with node context.
3. Response is displayed as a preview list.
4. User selects desired tasks and clicks "Add selected."
5. Same `onAddTasks` flow as manual.

### 5. Graph Layout for Children (`graphLayout.ts`)

When a pillar is selected and it has action nodes, those are already rendered. When an action node is selected and it has `children`, those children need to be laid out.

**Approach:**
- `buildGraphLayout` currently only renders `pillar.actions` as action nodes.
- Extend it to accept an optional `expandedNodeId` parameter.
- When `expandedNodeId` is an action node with children, add those children as deeper-ring nodes.

**Layout math for recursive children:**
```typescript
const CHILD_RADIUS = 7.5; // further out than ACTION_RADIUS (5.5)

if (expandedActionId && action.id === expandedActionId && action.children) {
  action.children.forEach((child, ci) => {
    const childSpread = (Math.PI / 6) * (ci - (action.children.length - 1) / 2);
    const childAngle = aAngle + childSpread;
    const cx = Math.cos(childAngle) * CHILD_RADIUS;
    const cy = Math.sin(childAngle) * CHILD_RADIUS;
    // ... create LayoutNode and LayoutEdge for child
  });
}
```

**Alternative approach (preferred for simplicity):**
Instead of modifying `buildGraphLayout`, handle dynamic children in `useGraphScene` by creating `NodeMesh` and `EdgeRender` objects on the fly when a node with children is selected. This avoids rebuilding the entire layout.

### 6. API Route (`app/api/node/tasks/route.ts`)

```typescript
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { z } from "zod";

const RequestSchema = z.object({
  nodeId: z.string(),
  nodeName: z.string(),
  nodeDescription: z.string(),
  parentContext: z.string(),
  userPrompt: z.string().min(1).max(500),
});

const TaskSchema = z.object({
  name: z.string(),
  recommendation: z.string(),
});

const ResponseSchema = z.object({
  tasks: z.array(TaskSchema).min(1).max(8),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { nodeName, nodeDescription, parentContext, userPrompt } = parsed.data;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    // Deterministic fallback
    return NextResponse.json({
      tasks: buildFallbackTasks(nodeName, userPrompt),
    });
  }

  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: taskGenerationSystemPrompt },
      { role: "user", content: taskGenerationUserPrompt(
        parentContext, nodeName, nodeDescription, userPrompt
      )},
    ],
    temperature: 0.7,
    max_tokens: 1024,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    return NextResponse.json({
      tasks: buildFallbackTasks(nodeName, userPrompt),
    });
  }

  const result = ResponseSchema.safeParse(JSON.parse(raw));
  if (!result.success) {
    return NextResponse.json({
      tasks: buildFallbackTasks(nodeName, userPrompt),
    });
  }

  return NextResponse.json({ tasks: result.data.tasks });
}
```

### 7. Prompt Templates (`lib/prompts.ts`)

```typescript
export const taskGenerationSystemPrompt = `You are a strategic academic advisor helping a university student break down goals into concrete, actionable tasks.

Given a student's goal context and a specific area they need help with, generate 3-6 tasks. Each task must have:
- "name": A short, action-oriented title (max 60 chars)
- "recommendation": 1-2 sentences of specific, practical guidance

Return a JSON object with a "tasks" array. No other text.`;

export function taskGenerationUserPrompt(
  parentContext: string,
  nodeName: string,
  nodeDescription: string,
  userPrompt: string,
): string {
  return `Overall goal: ${parentContext}
Area of focus: ${nodeName} — ${nodeDescription}
Student's request: ${userPrompt}

Generate concrete tasks to help with this request.`;
}
```

### 8. Plan Store Changes (`lib/planStore.ts`)

Add functions for recursive task management:

```typescript
export function addTasksToNode(
  planId: string,
  parentNodeId: string,
  newTasks: Array<{ name: string; recommendation: string }>,
): ActionNode[] {
  const plan = loadPlan(planId);
  if (!plan) return [];

  const created: ActionNode[] = newTasks.map((t) => ({
    id: crypto.randomUUID(),
    name: t.name,
    status: "On Track" as NodeStatus,
    recommendation: t.recommendation,
  }));

  // Find the parent node (pillar or action, recursively)
  const attached = attachChildren(plan.strategicPillars, parentNodeId, created);
  if (attached) {
    savePlan(planId, plan);
  }
  return created;
}

function attachChildren(
  pillars: StrategicPillar[],
  parentId: string,
  children: ActionNode[],
): boolean {
  for (const pillar of pillars) {
    if (pillar.id === parentId) {
      // Adding to a pillar: append to actions
      pillar.actions.push(...children);
      return true;
    }
    if (attachToAction(pillar.actions, parentId, children)) return true;
  }
  return false;
}

function attachToAction(
  actions: ActionNode[],
  parentId: string,
  children: ActionNode[],
): boolean {
  for (const action of actions) {
    if (action.id === parentId) {
      action.children = [...(action.children ?? []), ...children];
      return true;
    }
    if (action.children && attachToAction(action.children, parentId, children)) {
      return true;
    }
  }
  return false;
}
```

### 9. Validation Schemas (`lib/validate.ts`)

```typescript
export const TaskGenerationRequestSchema = z.object({
  nodeId: z.string(),
  nodeName: z.string(),
  nodeDescription: z.string(),
  parentContext: z.string(),
  userPrompt: z.string().min(1).max(500),
});
```

### 10. GoalTree Integration (`GoalTree.tsx`)

Replace `<SelectionCard>` with `<NodeTaskDialog>`:

```typescript
{hideChrome ? null : (
  <NodeTaskDialog
    plan={plan}
    selection={selection}
    actionStates={actionStates}
    onSelect={select}
    onClose={clearSelection}
    onToggleAction={markAction}
    onAddTasks={handleAddTasks}
    isDemo={isDemo}
  />
)}
```

The `handleAddTasks` function calls `addTasksToNode` from `planStore` and triggers a re-render of the graph.

## State Management

### Local State (component-level)
- `activeTab` in `NodeTaskDialog`
- `addingTask`, `newTaskName` in Tasks tab
- `prompt`, `isGenerating`, `previewTasks`, `error` in AI Generate tab

### Shared State (lifted to GoalTree or page-level)
- `plan` -- the `StrategyPlan` object, now potentially mutated with new children
- `actionStates` -- existing action state map, extended with new task IDs

### Persistence
- `localStorage` via `planStore.ts` -- the entire `StrategyPlan` with recursive `children` is serialized/deserialized.
- For demo plans: changes persist within the session (using a patched in-memory copy).

## Performance Considerations

- Recursive `ActionNode.children` tree is walked only when resolving selections. With typical depths of 2-3 levels and ~5-10 nodes per level, this is negligible.
- Dynamic node/edge creation in `useGraphScene` avoids full layout rebuilds.
- AI generation network latency is the bottleneck; mitigated with clear loading states and fallback.
- Graph node count could grow with heavy use. Limit visible nodes to selected node's direct children only (hide grandchildren until their parent is selected).

## Error Handling

| Scenario | Behavior |
|---|---|
| Groq API unavailable | Fallback to deterministic tasks |
| Groq returns invalid JSON | Fallback to deterministic tasks |
| Network error during generation | Show error message, allow retry |
| Empty prompt submitted | Disable Generate button when prompt is empty |
| Maximum recursion depth concern | No hard limit; graph only renders 1 level deep from selected node |

## Validation

- [ ] `npm run typecheck` -- verify `ActionNode` extension compiles
- [ ] `npm run build` -- clean build
- [ ] Dialog opens on pillar click with Tasks tab active
- [ ] Dialog opens on action click with Tasks tab active
- [ ] Manual task addition creates a new node on the graph
- [ ] AI generation returns tasks and displays preview
- [ ] Confirming AI tasks adds nodes to graph
- [ ] Clicking a new child node opens the same dialog (recursion)
- [ ] Checkbox toggles persist across dialog open/close
- [ ] State persists across page reload
- [ ] Fallback works when Groq is unavailable
- [ ] Dialog traps focus and responds to Escape
