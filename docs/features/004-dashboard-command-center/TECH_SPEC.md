# TECH SPEC: Dashboard Command Center

## Files

```text
app/dashboard/[planId]/page.tsx
app/dashboard/demo-cs-student-001/page.tsx
components/StrategyHeader.tsx
components/AlignmentScore.tsx
components/SemesterPriorities.tsx
components/RiskCards.tsx
components/Card.tsx
components/StatusBadge.tsx
```

## Component Props

```ts
interface StrategyHeaderProps {
  destination: string;
  currentStage: string;
  mainBottleneck: string;
  routeStatus: RouteStatus;
  alignmentScore: number;
}

interface AlignmentScoreProps {
  score: number;
}
```

## Implementation Architecture

- Keep dashboard pages as server components when fetching initial plan data.
- Use a shared dashboard composition component if both demo and real routes would duplicate layout.
- Pass `StrategyPlan` data down as typed props.
- Keep interactive children like `OpportunityChecker` and animated graph as client components.
- Use Framer Motion inside client components for score count-up and card entrance.

## Data Loading

For real plans:

1. Read `params.planId`.
2. Fetch plan from Supabase or call `GET /api/plan/[planId]`.
3. Validate with `StrategyPlanSchema`.
4. Render dashboard.
5. If not found, show an error panel with demo link.

For demo:

1. Import `demoStrategyPlan`.
2. Render directly.

## Styling Architecture

- Page background: `--bg-base`.
- Cards: `--bg-surface`, `--border`, max 8px radius unless a component needs otherwise.
- Text: `--text-primary`, `--text-secondary`.
- Status colors come only from `lib/statusColors.ts`.

