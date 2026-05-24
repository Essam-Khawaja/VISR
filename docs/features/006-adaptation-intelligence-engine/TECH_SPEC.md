# Feature Tech Spec: Adaptation Intelligence Engine

## Status
Draft

## Related Docs
- Feature PRD: `docs/features/006-adaptation-intelligence-engine/PRD.md`
- Upstream: 002, 004, 005, 001

## Technical Summary
`runAdaptation(studentId): AdaptationResult` — pure rules engine over activity signals. Updates roadmap node `priority` (0–100), optionally appends suggested nodes from templates, bumps `roadmap.version`.

## Files Expected to Change
- `src/lib/adaptation/engine.ts`
- `src/lib/adaptation/rules/`
- `src/app/api/adaptation/run/route.ts`
- `src/components/notifications/PlanUpdateBanner.tsx`

## Signals (MVP)

| Signal | Source | Threshold example |
|--------|--------|-------------------|
| `nodeInactive` | No completed task for node in 4 weeks | priority -= 20 |
| `pathwayHot` | ≥3 completions sharing tag in 2 weeks | priority += 15 for tag-matching nodes |
| `weeklyMissRate` | >50% tasks skipped 2 weeks running | reduce priority on current year nodes |
| `goalDrift` | >70% completions tags mismatch `primaryGoal` category | trigger goal review prompt |

## Data Model

```ts
type AdaptationResult = {
  roadmapId: string;
  previousVersion: number;
  newVersion: number;
  changes: AdaptationChange[];
  notifications: string[];
  suggestGoalReview: boolean;
};

type AdaptationChange = {
  nodeId: string;
  field: "priority" | "status";
  oldValue: number | string;
  newValue: number | string;
  reason: string;
};
```

## Rules Engine (pseudocode)

```
for each node in roadmap:
  score = node.priority
  if inactive(node): score -= 20
  if hotTag(node.tags): score += 15
  clamp(score, 0, 100)
  if score != node.priority: record change

if goalDrift(profile, completions): suggestGoalReview = true

persist roadmap, return AdaptationResult
```

## Triggers
- Cron: end of week (after weekly plan closes)
- Event: after 3rd task completion in a week (debounced)
- Manual: dev endpoint only

## API / Server Logic
- `POST /api/adaptation/run` — internal/cron; returns `AdaptationResult`
- `GET /api/adaptation/last` — last run summary for UI banner

## Integration
- Weekly generator (004) sorts by updated `priority`
- Graph (003) uses priority < 30 for faded nodes
- Profile (001) goal update resets drift counter

## Testing / Verification
- [ ] Fixture: inactive node → priority drops
- [ ] Fixture: hot pathway → matching nodes rise
- [ ] Fixture: mismatched completions → `suggestGoalReview`
- [ ] Roadmap version increments
- [ ] Typecheck/lint/build pass
