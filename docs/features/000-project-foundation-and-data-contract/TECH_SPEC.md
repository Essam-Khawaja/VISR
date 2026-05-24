# TECH SPEC: Project Foundation and Data Contract

## Required Dependencies

Install or confirm:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "latest",
    "framer-motion": "latest",
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "three": "latest",
    "uuid": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "@types/three": "latest",
    "@types/uuid": "latest",
    "typescript": "5.x"
  }
}
```

Current repo note:

- `framer-motion`, `next`, `react`, `three`, and `zod` already exist.
- Add `@supabase/supabase-js`, `uuid`, and `@types/uuid`.
- Use direct HTTP to Groq chat completions; no Groq SDK is required.
- Remove or stop using the OpenAI-specific wrapper after `lib/groq.ts` is added.

## Environment Variables

```bash
GROQ_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
```

Rules:

- Never expose `GROQ_API_KEY`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY`.
- Client components can only use `NEXT_PUBLIC_*`.
- API routes own AI calls and database writes.

## Canonical Files

```text
lib/types.ts
lib/validation.ts
lib/statusColors.ts
lib/demoData.ts
lib/supabase.ts
lib/groq.ts
lib/prompts/strategyPrompt.ts
lib/prompts/opportunityPrompt.ts
```

Legacy compatibility plan:

- Replace `lib/fixture.ts` with `lib/demoData.ts`, or temporarily re-export from `fixture.ts` while migrating imports.
- Replace `lib/validate.ts` with `lib/validation.ts`, or temporarily re-export while migrating imports.
- Replace `lib/aiClient.ts` with `lib/groq.ts`.

## Type Contract

`lib/types.ts` is the source of truth.

```ts
export type RouteStatus =
  | "On Track"
  | "At Risk"
  | "Scattered"
  | "Needs Focus";

export type PillarStatus =
  | "Strong"
  | "Okay"
  | "Weak"
  | "Missing";

export type ActionStatus =
  | "On Track"
  | "Behind"
  | "At Risk"
  | "Deferred"
  | "Cut";

export type CutRecommendation =
  | "Cut"
  | "Defer"
  | "Keep"
  | "Double Down";

export type Priority =
  | "High"
  | "Medium"
  | "Low";

export type Severity =
  | "High"
  | "Medium"
  | "Low";

export type OpportunityRecommendation =
  | "Say Yes"
  | "Say No"
  | "Defer"
  | "Say Yes With Conditions";

export interface StudentProfile {
  id: string;
  degree: string;
  year: string;
  university: string;
  targetGoal: string;
  courses: string[];
  commitments: string[];
  workHoursPerWeek: number;
  constraints: string;
  brainDump: string;
  createdAt: string;
}

export interface ActionNode {
  id: string;
  name: string;
  status: ActionStatus;
  recommendation: string;
}

export interface StrategicPillar {
  id: string;
  name: string;
  status: PillarStatus;
  reason: string;
  actions: ActionNode[];
}

export interface CutItem {
  id: string;
  activity: string;
  recommendation: CutRecommendation;
  reason: string;
}

export interface ActionItem {
  id: string;
  title: string;
  category: string;
  priority: Priority;
}

export interface RiskItem {
  id: string;
  title: string;
  severity: Severity;
  explanation: string;
}

export interface StrategyPlan {
  destination: string;
  currentStage: string;
  mainBottleneck: string;
  routeStatus: RouteStatus;
  alignmentScore: number;
  strategicPillars: StrategicPillar[];
  semesterPriorities: string[];
  cutList: CutItem[];
  nextSevenDays: ActionItem[];
  risks: RiskItem[];
}

export interface OpportunityCheck {
  fitScore: number;
  recommendation: OpportunityRecommendation;
  reasoning: string;
  whyItFits: string[];
  tradeoffs: string[];
  conditions: string[];
  cutsRequired: string[];
}
```

Persistence metadata belongs outside the AI-facing plan object:

```ts
export interface StoredStrategyPlan {
  id: string;
  studentId: string;
  plan: StrategyPlan;
  createdAt: string;
}

export interface StoredOpportunityCheck {
  id: string;
  planId: string;
  opportunityText: string;
  check: OpportunityCheck;
  createdAt: string;
}
```

## Validation Contract

`lib/validation.ts` must export:

```ts
StudentProfileSchema
StrategyPlanSchema
OpportunityCheckSchema
GenerateRequestSchema
OpportunityRequestSchema
```

Rules:

- `alignmentScore`: 0 to 100.
- `strategicPillars`: min 4.
- `semesterPriorities`: min 3.
- `cutList`: min 2.
- `nextSevenDays`: min 3, max 7.
- `risks`: min 1.
- `fitScore`: 0 to 100.
- All enum values exact.

## Supabase Schema

Use JSONB for nested strategy data.

```sql
create table if not exists student_profiles (
  id uuid primary key,
  degree text not null,
  year text not null,
  university text not null,
  target_goal text not null,
  courses jsonb not null default '[]'::jsonb,
  commitments jsonb not null default '[]'::jsonb,
  work_hours_per_week integer not null default 0,
  constraints text not null default '',
  brain_dump text not null,
  created_at timestamp default now()
);

create table if not exists strategy_plans (
  id uuid primary key,
  student_id uuid references student_profiles(id),
  plan jsonb not null,
  created_at timestamp default now()
);

create table if not exists opportunity_checks (
  id uuid primary key,
  plan_id uuid references strategy_plans(id),
  opportunity_text text,
  check jsonb not null,
  created_at timestamp default now()
);
```

## Supabase Client Architecture

`lib/supabase.ts` should expose server-side helpers:

```ts
createSupabaseAnonClient()
createSupabaseServiceClient()
```

Rules:

- API routes use service client when writes require it.
- Client components do not import service client.
- Demo route must not require Supabase.

## Demo Data Contract

`lib/demoData.ts` exports:

```ts
export const DEMO_PLAN_ID = "demo-cs-student-001";
export const demoStudentProfile: StudentProfile;
export const demoStrategyPlan: StrategyPlan;
export const demoOpportunityCheck: OpportunityCheck;
```

The demo data must match:

- Destination: Software Engineering Internship
- Current Stage: Skill Signal
- Main Bottleneck: No shipped project, GitHub is empty
- Route Status: Scattered
- Alignment Score: 64
- Pillars: Portfolio Signal, Interview Readiness, Academic Stability, Commitment Load
- Opportunity: robotics club, fit score 78, Say Yes With Conditions

## API Contract

Initial API routes:

```text
POST /api/generate
POST /api/opportunity
GET /api/plan/[planId]
```

Response shapes:

```ts
// POST /api/generate
{
  planId: string;
  studentId: string;
}

// POST /api/opportunity
{
  check: OpportunityCheck;
}

// GET /api/plan/[planId]
{
  plan: StrategyPlan;
  profile?: StudentProfile;
}
```

Error shape:

```ts
{
  error: {
    code: string;
    message: string;
  }
}
```

## Implementation Order

1. Dependencies
2. Environment docs
3. `lib/types.ts`
4. `lib/validation.ts`
5. `lib/statusColors.ts`
6. `lib/demoData.ts`
7. `lib/supabase.ts`
8. `lib/groq.ts`
9. API contract stubs or implementations
10. Update imports from legacy file names

After each step, run:

```bash
npm run typecheck
npm run lint
```
