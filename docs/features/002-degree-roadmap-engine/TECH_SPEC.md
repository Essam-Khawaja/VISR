# Feature Tech Spec: Degree Roadmap Engine

## Status
Draft

## Related Docs
- Global Architecture: `docs/architecture/ARCHITECTURE.md`
- Feature PRD: `docs/features/002-degree-roadmap-engine/PRD.md`
- Upstream: `docs/features/001-user-foundation/`

## Technical Summary
`generateRoadmap(profile: UserProfile): Roadmap` — hybrid approach recommended: rule-based templates per goal category + optional LLM enrichment for node labels and descriptions. Output stored per `studentId`.

## Files Expected to Change
- `src/lib/roadmap/generator.ts`
- `src/lib/roadmap/templates/` — goal/degree templates
- `src/app/api/roadmap/route.ts`
- `src/lib/types.ts` — `Roadmap`, `RoadmapNode`, `RoadmapEdge`

## Components

| Component | Purpose |
|-----------|---------|
| `generateRoadmap` | Main entry: profile → roadmap |
| `applyGoalTemplate` | Map primaryGoal + interests to node sets |
| `assignYearAndFocus` | Place nodes into year buckets with focus string |
| `buildDependencies` | Create edges between nodes |

## Data Model

```ts
type RoadmapNodeType = "course" | "skill" | "club" | "project" | "milestone";

type RoadmapNode = {
  id: string;
  type: RoadmapNodeType;
  label: string;
  description?: string;
  year: number; // 1–4
  tags: string[]; // e.g. health-tech
  status: "not_started" | "in_progress" | "completed";
  priority: number; // 0–100, used by adaptation
};

type RoadmapEdge = {
  from: string;
  to: string;
};

type RoadmapYear = {
  year: number;
  focus: string; // e.g. "exploration", "specialization", "career_prep"
  nodes: RoadmapNode[];
};

type Roadmap = {
  id: string;
  studentId: string;
  primaryGoal: string;
  years: RoadmapYear[];
  edges: RoadmapEdge[];
  version: number;
  createdAt: string;
  updatedAt: string;
};
```

## API / Server Logic
- `POST /api/roadmap/generate` — body: `{ profileId }` or uses session profile → returns `Roadmap`
- `GET /api/roadmap` — current roadmap for student

## Generator Logic (MVP)
1. Classify goal into category (e.g. `health-tech`, `software`, `research`) via keyword rules.
2. Load template node list for category + degree.
3. Merge interest tags → boost matching nodes' priority.
4. Assign nodes to years by type (exploration nodes → year 1–2, career nodes → year 3–4).
5. Build dependency edges (skill A before project B, course before internship milestone).

## State Management
- Server-side generation; client shows loading spinner
- Cache roadmap in DB; version increment on regeneration

## Validation
- Profile must exist and have `primaryGoal` before generate
- Roadmap must have at least 1 node per year (or empty year allowed with warning in dev)

## Testing / Verification
- [ ] Generate from health-tech profile → nodes contain health-tech tags
- [ ] Edges reference valid node IDs
- [ ] GET returns same roadmap after generate
- [ ] Typecheck/lint/build pass
