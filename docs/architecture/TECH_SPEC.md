# TECH SPEC: Pathwise

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Graph visualization | Three.js if feasible; polished 2D radial graph fallback |
| AI API | xAI Grok API via direct HTTP |
| Validation | Zod |
| Database | Supabase Postgres via `@supabase/supabase-js` |
| State | React `useState` / `useEffect` |

No global state manager for the MVP.

---

## Dependencies

Install and use:

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "typescript": "5.x",
    "tailwindcss": "3.x",
    "framer-motion": "latest",
    "three": "latest",
    "@types/three": "latest",
    "@supabase/supabase-js": "latest",
    "zod": "latest",
    "uuid": "latest",
    "@types/uuid": "latest"
  }
}
```

---

## Environment Variables

```bash
XAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Never expose `XAI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the client.

---

## Canonical Files

```text
lib/types.ts
lib/validation.ts
lib/statusColors.ts
lib/demoData.ts
lib/supabase.ts
lib/grok.ts
lib/prompts/strategyPrompt.ts
lib/prompts/opportunityPrompt.ts
```

---

## API Routes

### POST /api/generate

Purpose: accept a student profile from onboarding, call Grok, validate the result, save it to Supabase, and return the `planId`.

Request:

```ts
{
  profile: Omit<StudentProfile, "id" | "createdAt">
}
```

Response:

```ts
{
  planId: string;
  studentId: string;
}
```

Internal flow:

1. Generate UUID for student profile.
2. Save profile to `student_profiles`.
3. Build strategy prompt using `buildStrategyPrompt(profile)`.
4. Call Grok with strict JSON-output prompt.
5. Parse Grok response as JSON.
6. Validate with `StrategyPlanSchema`.
7. If validation fails, retry once with a correction prompt that includes the validation error.
8. Save validated plan to `strategy_plans.plan` as JSONB.
9. Return `planId` and `studentId`.
10. If anything fails, return a structured error response.

### POST /api/opportunity

Purpose: evaluate a new opportunity against the current strategy.

Request:

```ts
{
  planId: string;
  opportunityText: string;
}
```

Response:

```ts
{
  check: OpportunityCheck;
}
```

Internal flow:

1. Fetch strategy plan from Supabase by `planId`, unless it is the demo plan.
2. Build opportunity prompt using the current `StrategyPlan` and `opportunityText`.
3. Call Grok.
4. Parse JSON response.
5. Validate with `OpportunityCheckSchema`.
6. Save to `opportunity_checks.check` as JSONB.
7. Return `OpportunityCheck`.
8. If API key or Supabase is missing for the demo route, return the seeded robotics-club check for the matching demo input.

### GET /api/plan/[planId]

Purpose: fetch a saved strategy plan by ID.

Response:

```ts
{
  plan: StrategyPlan;
  profile?: StudentProfile;
}
```

For `demo-cs-student-001`, return seeded demo data.

---

## Zod Schemas

`lib/validation.ts` must match `lib/types.ts`.

Validation requirements:

- `StrategyPlan.alignmentScore` must be 0 to 100.
- `StrategyPlan.strategicPillars` must have at least 4 pillars.
- `StrategyPlan.semesterPriorities` must have at least 3 items.
- `StrategyPlan.cutList` must have at least 2 items.
- `StrategyPlan.nextSevenDays` must have 3 to 7 items.
- `StrategyPlan.risks` must have at least 1 item.
- `OpportunityCheck.fitScore` must be 0 to 100.
- `OpportunityCheck.recommendation` must be one of:
  - `Say Yes`
  - `Say No`
  - `Defer`
  - `Say Yes With Conditions`

---

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

interface StrategyMapProps {
  pillars: StrategicPillar[];
  destination: string;
  mainBottleneck: string;
}

interface CutListProps {
  items: CutItem[];
}

interface NextSevenDaysProps {
  actions: ActionItem[];
}

interface RiskCardsProps {
  risks: RiskItem[];
}

interface SemesterPrioritiesProps {
  priorities: string[];
}

interface OpportunityCheckerProps {
  planId: string;
}

interface OpportunityResultProps {
  check: OpportunityCheck;
}
```

---

## Strategy Map Implementation

Preferred: Three.js.

Implementation notes:

- Client-side component only.
- Initialize scene, camera, renderer in `useEffect`.
- Center node at origin.
- Place pillar nodes in a circle around center.
- Place action nodes around each pillar.
- Use simple sphere geometry or sprite circles.
- Use line geometry for edges.
- Use raycaster for hover detection.
- On hover, render HTML popover with name, status, recommendation.
- Animate bottleneck or At Risk node with pulsing material opacity.
- Slowly rotate parent group.
- Clean up renderer on unmount.

Fallback: 2D radial graph.

- Relative container.
- SVG for edges.
- Absolutely positioned div nodes.
- Center node in middle.
- Pillars placed with polar coordinates.
- Actions placed near their pillar.
- Framer Motion node spawn animation.
- Hover popovers.

The 2D version is acceptable if it is polished and reliable.

---

## Status Color Mapping

```ts
export const pillarStatusColor = {
  Strong: "#00F5A0",
  Okay: "#FFB547",
  Weak: "#FF4D6D",
  Missing: "#FF4D6D"
};

export const nodeStatusColor = {
  "On Track": "#00F5A0",
  Behind: "#FFB547",
  "At Risk": "#FF4D6D",
  Deferred: "#3D4F6B",
  Cut: "#3D4F6B"
};

export const cutRecommendationColor = {
  Cut: "#FF4D6D",
  Defer: "#FFB547",
  Keep: "#3D4F6B",
  "Double Down": "#00F5A0"
};

export const routeStatusColor = {
  "On Track": "#00F5A0",
  "At Risk": "#FF4D6D",
  Scattered: "#FFB547",
  "Needs Focus": "#FFB547"
};
```

---

## Loading and Error States

No blank screens.

| Operation | Loading UI |
|---|---|
| Strategy generation | Full-screen animated progress with the five onboarding loading steps |
| Dashboard load | Skeleton cards |
| Opportunity check | Animated gauge/loading result shell |
| Graph load | Nodes fade/scale in |

Errors:

- Grok generation failure: "Strategy generation failed. Try again or open the demo."
- Opportunity failure: "Could not evaluate this opportunity. Your saved strategy is still available."
- Graph failure: show the 2D fallback graph.

---

## Performance Notes

- `/dashboard/demo-cs-student-001` must load instantly from static data.
- Keep dashboard initial data fetching server-side where possible.
- Keep opportunity checker client-side because it is interactive.
- Avoid re-mounting the graph on hover or minor state changes.
- Keep components small and typed.
