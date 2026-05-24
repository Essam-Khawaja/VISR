# TASKS: Pathwise

## 24-Hour MVP Build Plan

Functional completeness beats broken ambition. The goal is a polished core loop, not every possible feature.

---

## Phase 1: Foundation

- [ ] Install required dependencies: `next`, `react`, `react-dom`, `typescript`, `tailwindcss`, `framer-motion`, `three`, `@types/three`, direct HTTP to xAI chat completions, `@supabase/supabase-js`, `zod`, `uuid`, `@types/uuid`
- [ ] Create `lib/types.ts` with canonical Pathwise types
- [ ] Create `lib/validation.ts` with Zod schemas
- [ ] Create `lib/statusColors.ts`
- [ ] Create `lib/demoData.ts` with CS student plan and robotics opportunity check
- [ ] Add CSS variables to `styles/globals.css`
- [ ] Confirm Tailwind can use the design tokens

---

## Phase 2: Demo Dashboard First

- [ ] Create `/dashboard/demo-cs-student-001`
- [ ] Load `demoStrategyPlan` instantly without AI
- [ ] Create `Card.tsx`
- [ ] Create `StatusBadge.tsx`
- [ ] Create `StrategyHeader.tsx`
- [ ] Create `AlignmentScore.tsx` with Framer Motion count-up
- [ ] Create dashboard layout with dark premium background
- [ ] Ensure destination, current stage, bottleneck, route status, and alignment score are visible in 10 seconds

---

## Phase 3: Core Dashboard Cards

- [ ] Create `CutList.tsx`
- [ ] Group cut items by `Cut`, `Defer`, `Keep`, and `Double Down`
- [ ] Create `NextSevenDays.tsx`
- [ ] Show action title, category, and priority
- [ ] Create `RiskCards.tsx`
- [ ] Create `SemesterPriorities.tsx`
- [ ] Add card fade-in and subtle hover lift
- [ ] Verify Cut List and Next Seven Days are screenshot-ready

---

## Phase 4: Strategy Map

Preferred Three.js path:

- [ ] Create `StrategyMap.tsx` as a client component
- [ ] Initialize scene, camera, renderer, and cleanup
- [ ] Render destination node at center
- [ ] Render pillar nodes in radial orbit
- [ ] Render action nodes clustered around pillars
- [ ] Draw edges between destination, pillars, and actions
- [ ] Apply status colors
- [ ] Pulse bottleneck-related or At Risk node
- [ ] Add slow rotation or cinematic drift
- [ ] Add hover popover

Fallback 2D path:

- [ ] Use relative container and SVG edges
- [ ] Position nodes with polar coordinates
- [ ] Animate nodes with Framer Motion
- [ ] Highlight bottleneck with red pulse
- [ ] Add hover popovers

Hard rule:

- [ ] If Three.js is not reliable, ship the polished 2D graph.

---

## Phase 5: Opportunity Checker

- [ ] Create `OpportunityChecker.tsx`
- [ ] Add textarea and "Check Fit" button
- [ ] Create `OpportunityResult.tsx`
- [ ] Show fit score gauge, recommendation headline, reasoning, why it fits, tradeoffs, conditions, and cuts required
- [ ] Use demo robotics-club result as mocked fallback
- [ ] Create `POST /api/opportunity`
- [ ] Fetch existing plan by `planId`
- [ ] Build opportunity prompt
- [ ] Call Grok
- [ ] Validate with `OpportunityCheckSchema`
- [ ] Save to `opportunity_checks`
- [ ] Return structured result
- [ ] Show failure message without losing saved strategy

---

## Phase 6: Onboarding

- [ ] Create `/onboarding`
- [ ] Step 1: target goal
- [ ] Step 2: degree, year, university, courses
- [ ] Step 3: commitments
- [ ] Step 4: work hours and constraints
- [ ] Step 5: brain dump
- [ ] Add "Build My Route" submit button
- [ ] Add animated loading route:
  - "Reading your situation..."
  - "Finding your bottleneck..."
  - "Building your strategy map..."
  - "Choosing what to cut..."
  - "Creating your 7-day route..."
- [ ] Submit to `POST /api/generate`
- [ ] Redirect to `/dashboard/[planId]`
- [ ] On failure, show "Strategy generation failed. Try again or open the demo."

---

## Phase 7: Strategy Generation API

- [ ] Create `lib/grok.ts`
- [ ] Create `lib/prompts/strategyPrompt.ts`
- [ ] Create `lib/prompts/opportunityPrompt.ts`
- [ ] Create `lib/supabase.ts`
- [ ] Create `POST /api/generate`
- [ ] Generate student UUID
- [ ] Save profile to `student_profiles`
- [ ] Call Grok with strict JSON strategy prompt
- [ ] Validate with `StrategyPlanSchema`
- [ ] Retry once with correction prompt on validation failure
- [ ] Save plan JSONB to `strategy_plans`
- [ ] Return `{ planId, studentId }`
- [ ] Return structured errors

---

## Phase 8: Plan Fetching and Landing

- [ ] Create `GET /api/plan/[planId]`
- [ ] Return demo plan for `demo-cs-student-001`
- [ ] Return Supabase plan for normal UUIDs
- [ ] Create `/dashboard/[planId]`
- [ ] Render dashboard from fetched plan
- [ ] Create optional `/demo` redirect
- [ ] Build landing page:
  - "Stop organizing chaos. Find the route."
  - Product subheading
  - "Build My Route" CTA
  - "View Demo" CTA
  - Problem section
  - Feature section
  - Demo preview card

---

## Phase 9: Supabase Setup

- [ ] Create `student_profiles`
- [ ] Create `strategy_plans`
- [ ] Create `opportunity_checks`
- [ ] Use JSONB columns from `DATA_MODEL.md`
- [ ] Configure environment variables
- [ ] Confirm server-side writes do not expose service role key
- [ ] Add setup instructions or SQL migration

---

## Phase 10: Polish and Demo Prep

- [ ] Check text contrast
- [ ] Check desktop screenshot framing
- [ ] Check mobile sanity
- [ ] Verify no text overlaps cards or buttons
- [ ] Verify no blank loading states
- [ ] Verify dashboard demo route loads instantly
- [ ] Verify opportunity result for "Should I join the robotics club?"
- [ ] Capture five screenshot-ready states:
  - Onboarding brain dump screen
  - Full Strategy Dashboard with Strategy Map
  - Bottleneck highlighted
  - Cut List and Next Seven Days visible
  - Opportunity Check result
- [ ] Practice 60-second demo script

---

## Demo Script to Support

> Pathwise is for students who are doing a lot but cannot tell what matters.
>
> Here is a CS student trying to land an internship. They have five courses, a job, a club role, two unfinished projects, and an empty GitHub.
>
> Pathwise identifies the bottleneck: no shipped project.
>
> It builds a Strategy Map showing the student's destination, pillars, actions, and risks.
>
> It tells them what to cut: do not join another general club, defer research, cap the current club role, and double down on one complete portfolio project.
>
> Then it gives the next 7 days.
>
> Finally, if the student asks, "Should I join robotics club?", Pathwise does not just say yes or no. It gives a fit score, conditions, tradeoffs, and what must be cut if they accept.
>
> Pathwise does not help students do more. It helps them stop doing the wrong things.

