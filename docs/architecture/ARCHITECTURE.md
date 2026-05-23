# ARCHITECTURE: Pathwise

## System Overview

Pathwise is a Next.js 14 App Router application. The user submits a profile, the backend calls the Claude API, the response is validated and saved to Supabase, and the frontend renders the strategy dashboard from the saved data.

There are no real-time features. There is no auth for the hackathon MVP. Strategy plans are identified by a UUID stored in localStorage and passed as a route param.

---

## High-Level Data Flow

```
User fills onboarding form
        │
        ▼
POST /api/generate
  - Build prompt from StudentProfile
  - Call Claude claude-sonnet-4-5
  - Parse and validate JSON with Zod
  - Save StudentProfile + StrategyPlan to Supabase
  - Return { planId }
        │
        ▼
Redirect to /dashboard/[planId]
  - Fetch StrategyPlan from Supabase by planId
  - Render dashboard components from plan data
  - Three.js graph reads strategicPillars + actions
        │
        ▼
User opens /opportunity/[planId]
  - User enters opportunity text
  - POST /api/opportunity with planId + text
  - Fetch existing StrategyPlan from Supabase for context
  - Call Claude with plan context + opportunity
  - Return OpportunityCheck result
  - Render opportunity result UI
```

---

## Directory Structure

```
/app
  /page.tsx                  — Landing page
  /onboarding/page.tsx       — Multi-step onboarding form
  /dashboard/[planId]/page.tsx — Strategy dashboard
  /opportunity/[planId]/page.tsx — Opportunity check tool
  /api
    /generate/route.ts       — POST: generate strategy from profile
    /opportunity/route.ts    — POST: evaluate opportunity against strategy

/components
  /graph
    GoalTree.tsx             — Three.js canvas component (Person 1 owns this)
    useGraphScene.ts         — Three.js scene setup hook
    graphNodes.ts            — Node geometry and material definitions
    graphEdges.ts            — Animated gradient edge definitions
    graphAnimations.ts       — Camera drift, node pulse, hover logic
  /dashboard
    StrategyHeader.tsx       — Destination / stage / status / score
    BottleneckCard.tsx       — Main bottleneck callout
    AlignmentScore.tsx       — Large animated score display
    CutList.tsx              — Cut/defer/keep/double-down list
    NextSevenDays.tsx        — Action items for the week
    RiskCards.tsx            — Risk warning cards
    SemesterPriorities.tsx   — Priority list
  /onboarding
    OnboardingForm.tsx       — Multi-step form shell
    StepDestination.tsx
    StepAcademic.tsx
    StepCommitments.tsx
    StepBrainDump.tsx
  /opportunity
    OpportunityInput.tsx     — Freeform text input
    FitScoreGauge.tsx        — Circular gauge component
    OpportunityResult.tsx    — Full result display
  /ui
    Card.tsx                 — Base card component
    Badge.tsx                — Status badge (On Track / At Risk etc)
    NodePopover.tsx          — Hover popover for graph nodes

/lib
  /claude.ts                 — Claude API call wrapper
  /prompts.ts                — Prompt templates
  /validation.ts             — Zod schemas
  /supabase.ts               — Supabase client
  /types.ts                  — All TypeScript types

/styles
  /globals.css               — CSS variables, base styles
  /tokens.css                — Design token definitions
```

---

## Team Ownership

| Area | Owner | Key Files |
|---|---|---|
| Goal Tree visualization | Person 1 | `/components/graph/*` |
| AI pipeline + API routes | Person 2 | `/app/api/*`, `/lib/claude.ts`, `/lib/prompts.ts`, `/lib/validation.ts` |
| Dashboard UI + design system | Person 3 | `/components/dashboard/*`, `/components/ui/*`, `/styles/*` |

Person 3 also owns the onboarding form UI shell. Person 2 owns the form submission logic.

---

## Branching Strategy

```
main
├── feat/graph              — Person 1
├── feat/ai-pipeline        — Person 2
└── feat/dashboard-ui       — Person 3
```

Merge order:
1. `feat/ai-pipeline` merges first — establishes types and fixture JSON
2. `feat/dashboard-ui` merges second — dashboard works against fixture
3. `feat/graph` merges last — swaps in real Three.js component

All three branches start from the same commit that includes:
- `/lib/types.ts` with all shared types
- `/lib/fixture.ts` with the pre-generated demo scenario JSON
- Design tokens in `/styles/tokens.css`
- Supabase client in `/lib/supabase.ts`

---

## Critical Path

The fixture JSON must be committed before anyone starts their feature branch. This is the single dependency that unblocks all three people working in parallel.

**Hour 0 blocker: commit these three files to main before branching**
1. `lib/types.ts`
2. `lib/fixture.ts`
3. `styles/tokens.css`

---

## No-Auth Strategy

For the hackathon, there is no login. When a user completes onboarding, the generated `planId` (UUID) is saved to localStorage. The dashboard and opportunity check pages read `planId` from the URL. Supabase rows are public read/write with no RLS for the hackathon.

The demo scenario has a hardcoded `planId` that always resolves to the pre-generated CS student strategy.

---

## Environment Variables

```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DEMO_PLAN_ID=                    # UUID of the pre-generated demo scenario
```
