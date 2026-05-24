# Feature Tech Spec: Main Dashboard

## Status
Draft

## Related Docs
- Global PRD: `docs/architecture/PRD.md` (Strategy Dashboard, Goal Tree, Cut List)
- Global Data Model: `docs/architecture/DATA_MODEL.md`
- Feature PRD: `docs/features/007-main-dashboard/PRD.md`
- Sub-components: `degree-roadmap-engine.md`, `graph-visualization.md`, `bottleneck.md`, `cut-list.md`
- Modules: [002](../002-degree-roadmap-engine/), [003](../003-graph-visualization/)

## Technical Summary
Single Next.js page composes layout, data fetching, and child components. Server aggregates profile + roadmap + strategy snapshot; client renders graph and cards.

## Files Expected to Change
- `src/app/dashboard/page.tsx`
- `src/components/dashboard/DashboardLayout.tsx`
- `src/components/dashboard/DashboardHeader.tsx`
- `src/components/dashboard/BottleneckCard.tsx`
- `src/components/dashboard/CutListCard.tsx`
- `src/components/graph/RoadmapGraph.tsx` (from 003, embedded)
- `src/lib/strategy/bottleneck.ts`
- `src/lib/strategy/cutList.ts`
- `src/lib/strategy/buildStrategySnapshot.ts`
- `src/app/api/dashboard/route.ts` — aggregated payload

## Aggregated API Response

```ts
type DashboardPayload = {
  profile: UserProfile;
  roadmap: Roadmap;
  strategy: {
    destination: string;
    currentStage: string;
    routeStatus: RouteStatus;
    alignmentScore: number; // 0-100
    bottleneck: BottleneckSnapshot;
    cutList: CutListSnapshot;
  };
};
```

## Components

| Component | Purpose |
|-----------|---------|
| `DashboardPage` | Route, data fetch, layout |
| `DashboardHeader` | Destination, stage, bottleneck one-liner, score, route badge |
| `RoadmapGraph` | Hero graph (003) |
| `BottleneckCard` | Full bottleneck detail |
| `CutListCard` | Grouped cut/defer/keep/double-down |
| `DashboardSkeleton` | Loading state for graph + cards |

## Data flow

```
GET /api/dashboard
  → load profile (001)
  → load or generate roadmap (002)
  → buildStrategySnapshot(profile, roadmap, progress)
      → bottleneck.ts
      → cutList.ts
      → alignmentScore + routeStatus helpers
  → return DashboardPayload
```

## Alignment score (MVP heuristic)
- Base 50
- +10 per completed roadmap node (cap +30)
- -5 per skipped task last week (cap -20)
- +10 if top pathway tag matches goal category
- Clamp 0–100

## Route status (MVP)
| Score / signals | Status |
|-----------------|--------|
| alignment ≥ 70, skips low | `On Track` |
| alignment 40–69 | `Needs Focus` |
| many skips or drift | `Scattered` |
| alignment < 40 | `At Risk` |

## State Management
- Server Component fetch for initial load (preferred)
- Client revalidate after roadmap regen or task completion
- Graph selection state local to `RoadmapGraph`

## Styling
Follow global design tokens in `docs/architecture/PRD.md` section 6:
- Dark base `#080C14`, accent `#4FACFE`, danger `#FF4D6D` for bottleneck
- Graph hero min-height: `60vh` on desktop

## Testing / Verification
- [ ] Dashboard loads with mock `DashboardPayload`
- [ ] Missing roadmap triggers generate then re-fetch
- [ ] Bottleneck card + graph highlight share `linkedNodeId`
- [ ] Cut list renders all four categories
- [ ] Typecheck/lint/build pass
