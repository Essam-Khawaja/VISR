# DATA MODEL: Pathwise

## TypeScript Types

These are the canonical types for the entire application. Defined once in `/lib/types.ts`. All components, API routes, and database interactions use these types.

```typescript
// lib/types.ts

export type StudentProfile = {
  id: string;
  university: string;
  degree: string;
  year: string;
  targetGoal: string;
  secondaryGoals: string[];
  currentCourses: string[];
  commitments: string[];
  workHoursPerWeek: number;
  constraints: string[];
  brainDump: string;
  createdAt: string;
};

export type NodeStatus = "On Track" | "Behind" | "At Risk" | "Deferred" | "Cut";
export type PillarStatus = "Strong" | "Okay" | "Weak" | "Missing";
export type RouteStatus = "On Track" | "At Risk" | "Scattered" | "Needs Focus";
export type Recommendation = "Say Yes" | "Say No" | "Defer" | "Say Yes With Conditions";
export type CutRecommendation = "Cut" | "Defer" | "Keep" | "Double Down";
export type Priority = "High" | "Medium" | "Low";
export type Severity = "High" | "Medium" | "Low";

export type ActionNode = {
  id: string;
  name: string;
  status: NodeStatus;
  recommendation: string;
};

export type StrategicPillar = {
  id: string;
  name: string;
  status: PillarStatus;
  reason: string;
  actions: ActionNode[];
};

export type CutItem = {
  id: string;
  activity: string;
  recommendation: CutRecommendation;
  reason: string;
};

export type ActionItem = {
  id: string;
  title: string;
  category: string;
  priority: Priority;
};

export type RiskItem = {
  id: string;
  title: string;
  severity: Severity;
  explanation: string;
};

export type StrategyPlan = {
  id: string;
  studentId: string;
  destination: string;
  currentStage: string;
  mainBottleneck: string;
  routeStatus: RouteStatus;
  alignmentScore: number; // 0-100
  strategicPillars: StrategicPillar[];
  semesterPriorities: string[];
  cutList: CutItem[];
  nextSevenDays: ActionItem[];
  risks: RiskItem[];
  createdAt: string;
};

export type OpportunityCheck = {
  id: string;
  studentId: string;
  planId: string;
  opportunityText: string;
  fitScore: number; // 0-100
  recommendation: Recommendation;
  reasoning: string;
  whyItFits: string[];
  tradeoffs: string[];
  conditions: string[];
  cutsRequired: string[];
  createdAt: string;
};
```

---

## Supabase Schema

```sql
-- Run in Supabase SQL editor

create table student_profiles (
  id uuid primary key default gen_random_uuid(),
  university text not null,
  degree text not null,
  year text not null,
  target_goal text not null,
  secondary_goals text[] default '{}',
  current_courses text[] default '{}',
  commitments text[] default '{}',
  work_hours_per_week integer default 0,
  constraints text[] default '{}',
  brain_dump text not null,
  created_at timestamptz default now()
);

create table strategy_plans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id),
  destination text not null,
  current_stage text not null,
  main_bottleneck text not null,
  route_status text not null,
  alignment_score integer not null,
  strategic_pillars jsonb not null,
  semester_priorities text[] default '{}',
  cut_list jsonb not null,
  next_seven_days jsonb not null,
  risks jsonb not null,
  created_at timestamptz default now()
);

create table opportunity_checks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id),
  plan_id uuid references strategy_plans(id),
  opportunity_text text not null,
  fit_score integer not null,
  recommendation text not null,
  reasoning text not null,
  why_it_fits text[] default '{}',
  tradeoffs text[] default '{}',
  conditions text[] default '{}',
  cuts_required text[] default '{}',
  created_at timestamptz default now()
);
```

---

## Fixture JSON

Pre-generated demo scenario. Save this to Supabase with a hardcoded UUID before the hackathon demo. Also export as `/lib/fixture.ts` so all developers can build against it locally without hitting the API.

```typescript
// lib/fixture.ts

export const DEMO_PLAN_ID = "demo-cs-student-001";

export const fixturePlan: StrategyPlan = {
  id: "demo-cs-student-001",
  studentId: "demo-student-001",
  destination: "Software Engineering Internship",
  currentStage: "Skill Signal",
  mainBottleneck: "No shipped project — GitHub is empty",
  routeStatus: "Scattered",
  alignmentScore: 64,
  strategicPillars: [
    {
      id: "pillar-skill",
      name: "Skill Signal",
      status: "Weak",
      reason: "GitHub is empty and no project is shipped. Recruiters have nothing to evaluate.",
      actions: [
        {
          id: "action-portfolio",
          name: "Portfolio Project",
          status: "At Risk",
          recommendation: "Pick one project and ship it. A finished simple project beats two unfinished complex ones."
        },
        {
          id: "action-github",
          name: "GitHub Activity",
          status: "Behind",
          recommendation: "Push daily. Even small commits. An empty GitHub is a red flag."
        },
        {
          id: "action-resume",
          name: "Resume",
          status: "Behind",
          recommendation: "Resume needs a shipped project before it is worth sending anywhere."
        }
      ]
    },
    {
      id: "pillar-interview",
      name: "Interview Readiness",
      status: "Missing",
      reason: "LeetCode not started. No mock interviews. This will become a blocker in 6 weeks.",
      actions: [
        {
          id: "action-dsa",
          name: "DSA Practice",
          status: "At Risk",
          recommendation: "Start with 6 easy LeetCode problems this week. Build the habit before the volume."
        },
        {
          id: "action-mock",
          name: "Mock Interviews",
          status: "Deferred",
          recommendation: "Defer until DSA foundation is 4 weeks in. Premature mock interviews build bad habits."
        }
      ]
    },
    {
      id: "pillar-recruiting",
      name: "Recruiting",
      status: "Okay",
      reason: "Applications started but low volume. Career fair attended which is good signal.",
      actions: [
        {
          id: "action-apps",
          name: "Applications",
          status: "Behind",
          recommendation: "Target 5 applications per week minimum. Volume matters at this stage."
        },
        {
          id: "action-careerfair",
          name: "Career Fair",
          status: "On Track",
          recommendation: "Keep attending. This is already working."
        }
      ]
    },
    {
      id: "pillar-network",
      name: "Network",
      status: "Okay",
      reason: "Attending events but not converting to meaningful connections or referrals.",
      actions: [
        {
          id: "action-events",
          name: "Tech Events",
          status: "On Track",
          recommendation: "Keep attending, but start asking for coffee chats after."
        },
        {
          id: "action-referrals",
          name: "Referrals",
          status: "Deferred",
          recommendation: "Message 2 upper-year students this week. A referral is worth 20 cold applications."
        }
      ]
    },
    {
      id: "pillar-academics",
      name: "Academics",
      status: "Strong",
      reason: "GPA is strong and courses are relevant. This pillar is not your bottleneck.",
      actions: [
        {
          id: "action-courses",
          name: "Relevant Courses",
          status: "On Track",
          recommendation: "Algorithms and databases are directly relevant. Keep going."
        },
        {
          id: "action-gpa",
          name: "GPA Risk",
          status: "On Track",
          recommendation: "No action needed. GPA is not your bottleneck. Do not over-invest here."
        }
      ]
    }
  ],
  semesterPriorities: [
    "Ship one complete portfolio project",
    "Establish daily LeetCode habit (6 problems/week minimum)",
    "Send 5 internship applications per week",
    "Message 2 upper-year students for coffee chats",
    "Cap all non-goal activities at 3 hours/week"
  ],
  cutList: [
    {
      id: "cut-1",
      activity: "Joining another general club",
      recommendation: "Cut",
      reason: "You are already scattered. A general club adds zero signal to a software internship application."
    },
    {
      id: "cut-2",
      activity: "Pursuing research this semester",
      recommendation: "Defer",
      reason: "Research is a strong long-term move but not while your GitHub is empty. Revisit after you ship."
    },
    {
      id: "cut-3",
      activity: "Current club role",
      recommendation: "Keep",
      reason: "Leadership signal is valuable. Keep it, but hard cap at 3 hours per week."
    },
    {
      id: "cut-4",
      activity: "Second side project",
      recommendation: "Cut",
      reason: "Two unfinished projects are worse than one finished one. Cut it now and finish the first."
    },
    {
      id: "cut-5",
      activity: "One portfolio project",
      recommendation: "Double Down",
      reason: "This is your entire bottleneck. Every hour you can find goes here until it ships."
    }
  ],
  nextSevenDays: [
    {
      id: "day-1",
      title: "Pick one project and commit to finishing it this month",
      category: "Skill Signal",
      priority: "High"
    },
    {
      id: "day-2",
      title: "Push current project progress to GitHub today",
      category: "Skill Signal",
      priority: "High"
    },
    {
      id: "day-3",
      title: "Write a README that clearly explains what the project does",
      category: "Skill Signal",
      priority: "High"
    },
    {
      id: "day-4",
      title: "Complete 6 LeetCode easy problems — build the habit",
      category: "Interview Readiness",
      priority: "High"
    },
    {
      id: "day-5",
      title: "Apply to 5 internships with your current resume",
      category: "Recruiting",
      priority: "Medium"
    },
    {
      id: "day-6",
      title: "Message 2 upper-year CS students asking for a 20-minute coffee chat",
      category: "Network",
      priority: "Medium"
    }
  ],
  risks: [
    {
      id: "risk-1",
      title: "Saying yes to more commitments before shipping",
      severity: "High",
      explanation: "Every new commitment delays the portfolio project. Your bottleneck gets worse, not better."
    },
    {
      id: "risk-2",
      title: "Recruiting season closes before GitHub is ready",
      severity: "High",
      explanation: "Most internship applications close in October-November. An empty GitHub in September is a crisis."
    },
    {
      id: "risk-3",
      title: "LeetCode gap becomes an interview blocker",
      severity: "Medium",
      explanation: "If you land an interview without DSA practice, you will fail the technical screen. Start now."
    }
  ],
  createdAt: new Date().toISOString()
};
```
