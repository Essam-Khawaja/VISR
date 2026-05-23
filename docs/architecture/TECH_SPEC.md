# TECH SPEC: Pathwise

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 App Router | SSR for dashboard, API routes built in |
| Language | TypeScript | Shared types across frontend and backend |
| Styling | Tailwind CSS | Fast iteration, utility-first |
| Animation | Framer Motion | Dashboard card animations, score counter |
| 3D Graph | Three.js (custom) | Full control over visual quality — no library ceiling |
| AI | Anthropic Claude claude-sonnet-4-5 | Reliable structured JSON output |
| Validation | Zod | Parse and validate Claude JSON before saving |
| Database | Supabase (PostgreSQL) | Simple, free tier, instant setup |
| State | React useState / useEffect | No global state manager needed for MVP |

---

## Dependencies

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "typescript": "5.x",
    "tailwindcss": "3.x",
    "framer-motion": "11.x",
    "three": "0.165.x",
    "@types/three": "0.165.x",
    "@anthropic-ai/sdk": "latest",
    "@supabase/supabase-js": "2.x",
    "zod": "3.x",
    "uuid": "9.x",
    "@types/uuid": "9.x"
  }
}
```

---

## API Routes

### POST /api/generate

Accepts a StudentProfile, calls Claude, validates and saves the result.

**Request body:**
```typescript
{
  profile: Omit<StudentProfile, "id" | "createdAt">
}
```

**Response:**
```typescript
{
  planId: string;
  studentId: string;
}
```

**Internal flow:**
1. Assign UUID to profile, save to Supabase `student_profiles`
2. Build prompt from profile using `buildStrategyPrompt(profile)`
3. Call Claude claude-sonnet-4-5 with the prompt
4. Parse response text as JSON
5. Validate with `StrategyPlanSchema` (Zod)
6. If invalid: retry once with a correction prompt, then return 500
7. Save validated plan to Supabase `strategy_plans`
8. Return `{ planId, studentId }`

**Error handling:**
- Zod validation failure → retry once → 500 with error details
- Claude API error → 500 with message
- Supabase error → 500 with message

---

### POST /api/opportunity

Accepts an opportunity string and planId, calls Claude with plan context.

**Request body:**
```typescript
{
  planId: string;
  opportunityText: string;
}
```

**Response:**
```typescript
{
  check: OpportunityCheck
}
```

**Internal flow:**
1. Fetch StrategyPlan from Supabase by planId
2. Build opportunity prompt with plan context + opportunity text
3. Call Claude claude-sonnet-4-5
4. Parse and validate with `OpportunityCheckSchema` (Zod)
5. Save to Supabase `opportunity_checks`
6. Return full OpportunityCheck object

---

## Zod Schemas

```typescript
// lib/validation.ts

import { z } from "zod";

const ActionNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["On Track", "Behind", "At Risk", "Deferred", "Cut"]),
  recommendation: z.string()
});

const StrategicPillarSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["Strong", "Okay", "Weak", "Missing"]),
  reason: z.string(),
  actions: z.array(ActionNodeSchema)
});

const CutItemSchema = z.object({
  id: z.string(),
  activity: z.string(),
  recommendation: z.enum(["Cut", "Defer", "Keep", "Double Down"]),
  reason: z.string()
});

const ActionItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  priority: z.enum(["High", "Medium", "Low"])
});

const RiskItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  severity: z.enum(["High", "Medium", "Low"]),
  explanation: z.string()
});

export const StrategyPlanSchema = z.object({
  destination: z.string(),
  currentStage: z.string(),
  mainBottleneck: z.string(),
  routeStatus: z.enum(["On Track", "At Risk", "Scattered", "Needs Focus"]),
  alignmentScore: z.number().min(0).max(100),
  strategicPillars: z.array(StrategicPillarSchema).min(4),
  semesterPriorities: z.array(z.string()).min(3),
  cutList: z.array(CutItemSchema).min(2),
  nextSevenDays: z.array(ActionItemSchema).min(3).max(7),
  risks: z.array(RiskItemSchema).min(1)
});

export const OpportunityCheckSchema = z.object({
  fitScore: z.number().min(0).max(100),
  recommendation: z.enum(["Say Yes", "Say No", "Defer", "Say Yes With Conditions"]),
  reasoning: z.string(),
  whyItFits: z.array(z.string()),
  tradeoffs: z.array(z.string()),
  conditions: z.array(z.string()),
  cutsRequired: z.array(z.string())
});
```

---

## Component Props Reference

```typescript
// Key component interfaces

interface GoalTreeProps {
  pillars: StrategicPillar[];
  destination: string;
  mainBottleneck: string;
}

interface StrategyHeaderProps {
  destination: string;
  currentStage: string;
  mainBottleneck: string;
  routeStatus: RouteStatus;
  alignmentScore: number;
}

interface AlignmentScoreProps {
  score: number; // animates from 0 to this value on mount
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

interface FitScoreGaugeProps {
  score: number;
  recommendation: Recommendation;
}

interface OpportunityResultProps {
  check: OpportunityCheck;
}
```

---

## Status Color Mapping

Used consistently across the dashboard and the Three.js graph.

```typescript
// lib/statusColors.ts

export const pillarStatusColor = {
  "Strong": "#00F5A0",   // --success
  "Okay": "#FFB547",     // --warning
  "Weak": "#FF4D6D",     // --danger
  "Missing": "#FF4D6D"   // --danger
};

export const nodeStatusColor = {
  "On Track": "#00F5A0",  // --success
  "Behind": "#FFB547",    // --warning
  "At Risk": "#FF4D6D",   // --danger
  "Deferred": "#3D4F6B",  // --muted
  "Cut": "#3D4F6B"        // --muted
};

export const cutRecommendationColor = {
  "Cut": "#FF4D6D",
  "Defer": "#FFB547",
  "Keep": "#6B7FA3",
  "Double Down": "#00F5A0"
};

export const routeStatusColor = {
  "On Track": "#00F5A0",
  "At Risk": "#FF4D6D",
  "Scattered": "#FFB547",
  "Needs Focus": "#FFB547"
};
```

---

## Supabase Client

```typescript
// lib/supabase.ts

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

---

## Loading States

Every async operation has a defined loading state. No blank screens.

| Operation | Loading UI |
|---|---|
| Strategy generation | Full-screen animated progress with steps ("Analyzing your goal...", "Identifying bottleneck...", "Building your route...") |
| Dashboard initial load | Cards fade in with skeleton placeholders |
| Opportunity check | Circular gauge animates to 0 first, then fills to real score |
| Graph initial render | Nodes spawn with a staggered scale-in animation |

---

## Performance Notes

- The demo scenario is pre-fetched. `/dashboard/demo-cs-student-001` never calls the AI.
- Three.js canvas is initialized once and not re-mounted on prop changes — update via refs.
- Supabase queries are server-side in page.tsx using the App Router — no client-side fetching for initial data.
- The opportunity check is the only live AI call during the demo. It is fast (~1.5s) and has a loading state.
