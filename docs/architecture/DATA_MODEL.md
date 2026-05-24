# DATA MODEL: Pathwise

## TypeScript Types

Canonical file: `lib/types.ts`

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

Notes:

- `StrategyPlan` and `OpportunityCheck` intentionally do not include persistence metadata. Route/API wrappers can carry `planId`, `studentId`, or timestamps separately.
- This keeps the AI schema small and prevents Claude from inventing database metadata.

---

## Zod Validation

Canonical file: `lib/validation.ts`

Validation requirements:

- `StrategyPlan.alignmentScore`: number from 0 to 100.
- `StrategyPlan.strategicPillars`: at least 4.
- `StrategyPlan.semesterPriorities`: at least 3.
- `StrategyPlan.cutList`: at least 2.
- `StrategyPlan.nextSevenDays`: 3 to 7.
- `StrategyPlan.risks`: at least 1.
- `OpportunityCheck.fitScore`: number from 0 to 100.
- All enum fields must use exact values from `lib/types.ts`.

---

## Supabase Schema

Use JSONB for flexible hackathon speed.

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

Hackathon RLS decision:

- For the MVP, either disable RLS or use permissive policies while no auth exists.
- Before real deployment, add Supabase Auth and row-level security.

---

## Database Mapping

Student profile:

| TypeScript | Supabase |
|---|---|
| `id` | `id` |
| `degree` | `degree` |
| `year` | `year` |
| `university` | `university` |
| `targetGoal` | `target_goal` |
| `courses` | `courses` |
| `commitments` | `commitments` |
| `workHoursPerWeek` | `work_hours_per_week` |
| `constraints` | `constraints` |
| `brainDump` | `brain_dump` |
| `createdAt` | `created_at` |

Strategy plan:

| TypeScript | Supabase |
|---|---|
| plan object | `plan` JSONB |
| external plan ID | `strategy_plans.id` |
| linked student | `student_id` |

Opportunity check:

| TypeScript | Supabase |
|---|---|
| check object | `check` JSONB |
| raw input | `opportunity_text` |
| linked plan | `plan_id` |

---

## Demo Data

Canonical file: `lib/demoData.ts`

Exports:

```ts
export const DEMO_PLAN_ID = "demo-cs-student-001";
export const demoStudentProfile: StudentProfile = { ... };
export const demoStrategyPlan: StrategyPlan = { ... };
export const demoOpportunityCheck: OpportunityCheck = { ... };
```

Demo profile summary:

> Second-year CS student at the University of Calgary. Goal is a software engineering internship. Taking five courses including algorithms and databases. Working 12 hours/week. Helping run a student club. Considering another club, research outreach, networking, and two unfinished side projects. GitHub is basically empty and LeetCode has not started.

Demo strategy:

- Destination: Software Engineering Internship
- Current Stage: Skill Signal
- Main Bottleneck: No shipped project, GitHub is empty
- Route Status: Scattered
- Alignment Score: 64

Strategic pillars:

1. Portfolio Signal, Weak
2. Interview Readiness, Weak
3. Academic Stability, Okay
4. Commitment Load, Weak

Semester priorities:

- Ship one complete public project
- Build basic interview consistency
- Reduce scattered commitments

Cut list:

- Cut: Joining another general club
- Defer: Research outreach
- Keep: Current club role
- Double Down: One complete portfolio project

Next seven days:

1. Pick one project and commit to finishing it
2. Push current progress to GitHub today
3. Write a README explaining what the project does
4. Complete 6 LeetCode easy or medium problems
5. Apply to 5 internships with a tailored resume

Risks:

- Overcommitment
- Fake productivity
- Academic overload

Demo opportunity:

- Input: "Should I join the robotics club?"
- Fit Score: 78
- Recommendation: Say Yes With Conditions
- Required cuts: pause second side project, do not join another general club, reduce current club role to 3 hours/week.

