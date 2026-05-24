# Feature Tech Spec: Graph Visualization System

## Status
Draft

## Related Docs
- Feature PRD: `docs/features/003-graph-visualization/PRD.md`
- Upstream: `docs/features/002-degree-roadmap-engine/`

## Technical Summary
Use a React graph library (e.g. React Flow) to render `Roadmap.nodes` and `Roadmap.edges`. Transform roadmap into library node/edge format; apply styles from `status` and `priority`.

## Files Expected to Change
- `src/app/graph/page.tsx` (or dashboard tab)
- `src/components/graph/RoadmapGraph.tsx`
- `src/lib/graph/mapRoadmapToFlow.ts`
- `package.json` — add reactflow (or chosen library)

## Components

| Component | Purpose |
|-----------|---------|
| `RoadmapGraph` | Canvas wrapper, React Flow provider |
| `RoadmapNode` | Custom node component with status styling |
| `NodeDetailPanel` | Side panel on node select |
| `mapRoadmapToFlow` | Pure function: Roadmap → nodes/edges |

## Data Model (graph layer)

```ts
type GraphNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    nodeType: RoadmapNodeType;
    status: "not_started" | "in_progress" | "completed";
    progress?: number; // 0–100
    priority?: number;
  };
};

type GraphEdge = {
  id: string;
  source: string;
  target: string;
};
```

## Layout
- MVP: deterministic layout by `year` (column per year) + vertical stack within column
- Optional: dagre layout for automatic positioning post-MVP

## Styling Rules

| Status | Visual |
|--------|--------|
| `not_started` | Muted border, default size |
| `in_progress` | Highlight color, medium emphasis |
| `completed` | Strong fill, check indicator |
| Low `priority` (< 30) | Reduced opacity (adaptation) |

## State Management
- Fetch roadmap via `GET /api/roadmap`
- Local selection state for active node
- Re-fetch or optimistic update when progress events occur

## Testing / Verification
- [ ] Graph renders with 20+ nodes without crash
- [ ] Edge connections match roadmap dependencies
- [ ] Status color updates when mock status changes
- [ ] Typecheck/lint/build pass
