# ARCHITECTURE: VISR

## System Overview

VISR is a Next.js 14 App Router application for overwhelmed university students. The MVP is a strategy dashboard, not a task manager, chatbot, calendar, or course planner.

The core loop is:

1. Student completes onboarding.
2. App generates or loads a strategy plan.
3. Student lands on the dashboard.
4. Dashboard shows destination, bottleneck, alignment score, Strategy Map, cut list, risks, and next 7 days.
5. Student enters a new opportunity.
6. App evaluates the opportunity against the current strategy.
7. App explains the tradeoff and what must be cut if the student says yes.

There is no authentication for the hackathon MVP. Strategy plans are accessed by `planId`. The demo route loads static seeded data and does not require a live AI or Supabase call.

---

## High-Level Data Flow

```text
Landing page
  CTA: Build My Route
        |
        v
/onboarding
  Multi-step StudentProfile form
        |
        v
POST /api/generate
  - Generate student UUID
  - Save StudentProfile to Supabase
  - Build strict JSON strategy prompt
  - Call Groq chat completions
  - Parse and validate StrategyPlan with Zod
  - Retry once with correction prompt if validation fails
  - Save plan JSONB to Supabase
  - Return { planId, studentId }
        |
        v
/dashboard/[planId]
  - Fetch saved StrategyPlan by planId
  - Render premium strategy dashboard
  - Strategy Map visualizes destination, pillars, actions, and bottleneck
        |
        v
Opportunity Checker embedded on dashboard
  - User enters opportunity text
  - POST /api/opportunity with planId + opportunityText
  - Fetch existing StrategyPlan for context
  - Call Groq with opportunity prompt
  - Validate OpportunityCheck with Zod
  - Save check JSONB to Supabase
  - Render fit score, recommendation, tradeoffs, conditions, and cuts required
```

Demo shortcut:

```text
/demo -> /dashboard/demo-cs-student-001
/dashboard/demo-cs-student-001 -> static demo data from /lib/demoData.ts
```

---

## Routes

```text
app/
  page.tsx
    Landing page with CTA to onboarding and secondary CTA to demo.

  onboarding/
    page.tsx
      Multi-step student onboarding form.

  dashboard/
    [planId]/
      page.tsx
        Main strategy dashboard loaded from Supabase, except demo id.

    demo-cs-student-001/
      page.tsx
        Demo dashboard route that loads seeded demo data instantly.

  demo/
    page.tsx
      Optional redirect to /dashboard/demo-cs-student-001.

  api/
    generate/
      route.ts
        POST: Generate and persist StrategyPlan from StudentProfile.

    opportunity/
      route.ts
        POST: Evaluate a new opportunity against an existing StrategyPlan.

    plan/
      [planId]/
        route.ts
          GET: Fetch saved plan and optional profile.
```

---

## Source Structure

```text
components/
  AlignmentScore.tsx
  StrategyHeader.tsx
  StrategyMap.tsx
  CutList.tsx
  NextSevenDays.tsx
  RiskCards.tsx
  SemesterPriorities.tsx
  OpportunityChecker.tsx
  OpportunityResult.tsx
  LoadingRoute.tsx
  StatusBadge.tsx
  Card.tsx

lib/
  types.ts
  validation.ts
  statusColors.ts
  demoData.ts
  supabase.ts
  groq.ts
  prompts/
    strategyPrompt.ts
    opportunityPrompt.ts

styles/
  globals.css
```

The component structure is intentionally flat for hackathon speed. Shared primitives stay in `components/` unless the implementation naturally grows a subfolder.

---

## MVP Data Storage

Supabase uses three tables:

- `student_profiles`: normalized onboarding profile fields.
- `strategy_plans`: `plan jsonb not null` plus `student_id`.
- `opportunity_checks`: `check jsonb not null` plus `plan_id` and raw opportunity text.

JSONB is the MVP choice because the plan shape is rich, nested, and likely to change during the hackathon.

---

## AI Boundary

Server-only:

- `GROQ_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`, if server-side writes require it

Client-safe:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Groq calls only happen inside API routes or server utilities. The client never receives API keys.

`/lib/groq.ts` owns:

- Groq chat completions request construction.
- Model string, defaulting to `llama-3.3-70b-versatile`.
- `callGroqJson(system: string, user: string, opts?: GroqOptions)`.
- Markdown fence stripping.
- JSON parsing errors with useful messages.

---

## Demo Reliability Strategy

The demo route is the primary judging path:

- `/dashboard/demo-cs-student-001` loads from `/lib/demoData.ts`.
- No AI call is required.
- No Supabase call is required.
- The opportunity checker can return the expected robotics-club demo result when the API key or database is missing.

Live generation still exists for product completeness, but the hackathon demo should not depend on live generation.

---

## Technical Priorities

Functional completeness beats broken ambition.

Priority order:

1. Types and Zod schemas
2. Demo data
3. Dashboard UI using demo data
4. Strategy Header
5. Cut List
6. Next Seven Days
7. Risk Cards
8. Strategy Map
9. Opportunity Checker with clean mocked fallback
10. Groq API integration for opportunity checker
11. Onboarding form
12. `/api/generate` with Groq
13. Supabase persistence
14. Polish animations
15. Screenshot-ready visual polish

The Strategy Map should use Three.js if feasible. A polished 2D radial graph is the accepted fallback and is preferred over a fragile 3D implementation.

---

## No-Auth Strategy

For the hackathon, there is no login. A completed onboarding flow redirects to `/dashboard/[planId]`. The `planId` may also be stored in `localStorage` for convenience.

The lack of auth is acceptable for MVP speed. Post-hackathon, Supabase Auth and row-level security should be added before handling real student data.
