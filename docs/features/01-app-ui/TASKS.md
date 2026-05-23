# Feature Tasks: App UI & Design System

## Setup
- [x] Read feature PRD
- [x] Read feature tech spec
- [x] Check global architecture docs
- [x] Confirm implementation scope (UI + design system; graph logic excluded)

## Phase 0 — Design foundation (Hour 0, with team)
- [ ] Confirm `styles/tokens.css` matches PRD color table
- [ ] Wire `globals.css` + Tailwind theme to tokens
- [ ] Add `app/layout.tsx` fonts (Inter + display font)
- [ ] Create `lib/statusColors.ts`
- [ ] Create `lib/motion.ts` animation constants
- [ ] Verify `lib/fixture.ts` imports in a scratch page

## Phase 1 — UI primitives
- [ ] `components/ui/Card.tsx` — surface, border, hover lift hook
- [ ] `components/ui/Badge.tsx` — route status + recommendation variants
- [ ] `components/ui/Button.tsx` — primary / secondary / ghost
- [ ] `components/ui/Input.tsx`
- [ ] `components/ui/Textarea.tsx`
- [ ] `components/ui/Skeleton.tsx`
- [ ] `components/ui/NodePopover.tsx` — shell styles only

## Phase 2 — Landing page
- [ ] `app/page.tsx` — hero, tagline, value prop
- [ ] CTA → `/onboarding`
- [ ] Demo CTA → `/dashboard/${DEMO_PLAN_ID}`
- [ ] Dark premium background treatment (CSS only)
- [ ] Manual: page loads &lt; 2s, no layout shift

## Phase 3 — Onboarding UI
- [ ] `OnboardingProgress.tsx`
- [ ] `StepDestination.tsx`
- [ ] `StepAcademic.tsx`
- [ ] `StepCommitments.tsx`
- [ ] `StepBrainDump.tsx`
- [ ] `OnboardingForm.tsx` — step machine + validation
- [ ] `app/onboarding/page.tsx`
- [ ] `GenerationLoading.tsx` — stepped full-screen messages
- [ ] Wire submit → `POST /api/generate` → redirect (when API ready)
- [ ] Error state + retry on generate failure
- [ ] Optional: `sessionStorage` draft persistence

## Phase 4 — Dashboard shell & header
- [ ] `fetchStrategyPlan` in dashboard page (server)
- [ ] `DashboardLayout.tsx` — 60/40 grid, responsive stack
- [ ] `StrategyHeader.tsx`
- [ ] `AlignmentScore.tsx` — 120px count-up, reduced-motion
- [ ] `GoalTreePlaceholder.tsx` — loading + pre-graph state
- [ ] `GoalTreeSlot.tsx` — dynamic import boundary for `GoalTree`
- [ ] `app/dashboard/[planId]/page.tsx`
- [ ] Not-found / invalid planId UI
- [ ] Link to `/opportunity/[planId]`

## Phase 5 — Dashboard cards
- [ ] `BottleneckCard.tsx`
- [ ] `SemesterPriorities.tsx`
- [ ] `CutList.tsx` — grouped by recommendation, colors
- [ ] `NextSevenDays.tsx` — priority chips
- [ ] `RiskCards.tsx` — severity styling
- [ ] Staggered card entrance (Framer, 40ms)
- [ ] Card hover lift (150ms)
- [ ] Skeleton state on initial load

## Phase 6 — Opportunity check UI
- [ ] `OpportunityInput.tsx`
- [ ] `FitScoreGauge.tsx` — 800ms fill animation
- [ ] `OpportunityResult.tsx` — all sections from `OpportunityCheck`
- [ ] `app/opportunity/[planId]/page.tsx`
- [ ] Wire `POST /api/opportunity` (when API ready)
- [ ] Loading + error states
- [ ] Back to dashboard navigation

## Integration
- [ ] Dashboard renders correctly from `fixture` / demo `planId`
- [ ] Onboarding → generate → dashboard E2E (with AI branch)
- [ ] After `feat/graph` merge: `GoalTreeSlot` shows real `GoalTree`
- [ ] Status colors match graph nodes (visual spot-check)
- [ ] No unrelated files changed

## Validation
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Landing → demo dashboard (&lt; 60s judge comprehension test)
- [ ] Onboarding completable in &lt; 3 minutes
- [ ] `prefers-reduced-motion` check
- [ ] Compare dashboard to demo scenario in global PRD §9

## Completion
- [ ] Update feature PRD status → Complete
- [ ] Update feature tech spec status → Complete
- [ ] Mark all tasks above done
- [ ] Log final UI decisions in `DECISIONS.md`
