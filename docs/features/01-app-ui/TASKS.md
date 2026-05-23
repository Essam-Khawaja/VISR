# Feature Tasks: App UI & Design System

## Status
Complete

## Setup
- [x] Read feature PRD
- [x] Read feature tech spec
- [x] Check global architecture docs
- [x] Confirm implementation scope (UI + design system; graph logic excluded)

## Phase 0 — Design foundation
- [x] Confirm `styles/tokens.css` matches PRD color table
- [x] Wire `globals.css` + Tailwind theme to tokens
- [x] Add `app/layout.tsx` fonts (Inter + display font)
- [x] Create `lib/statusColors.ts`
- [x] Create `lib/motion.ts` animation constants
- [x] Verify `lib/fixture.ts` imports in a scratch page

## Phase 1 — UI primitives
- [x] `components/ui/Card.tsx` — surface, border, hover lift hook
- [x] `components/ui/Badge.tsx` — route status + recommendation variants
- [x] `components/ui/Button.tsx` — primary / secondary / ghost
- [x] `components/ui/Input.tsx`
- [x] `components/ui/Textarea.tsx`
- [x] `components/ui/Skeleton.tsx`
- [x] `components/ui/Stamp.tsx` — verdict stamp used by CutList
- [x] `components/ui/NumberDial.tsx` — animated tabular count-up
- [x] `components/signature/RouteLine.tsx`
- [x] `components/signature/Reticle.tsx`
- [x] `components/signature/CornerBrackets.tsx`
- [x] `components/signature/ScanLine.tsx`
- [x] `components/signature/Grain.tsx`
- [x] `components/signature/GlowFollow.tsx`

## Phase 2 — Landing page
- [x] `app/page.tsx` — hero, tagline, value prop
- [x] CTA → `/onboarding`
- [x] Demo CTA → `/dashboard/${DEMO_PLAN_ID}`
- [x] Dark premium background treatment (CSS only)
- [x] Manual: page loads with no layout shift

## Phase 3 — Onboarding UI
- [x] `OnboardingProgress.tsx`
- [x] `StepDestination.tsx`
- [x] `StepAcademic.tsx`
- [x] `StepCommitments.tsx`
- [x] `StepBrainDump.tsx`
- [x] `OnboardingForm.tsx` — step machine + validation
- [x] `app/onboarding/page.tsx`
- [x] `GenerationLoading.tsx` — stepped full-screen messages
- [x] Wire submit → `POST /api/generate` → redirect (404 falls back to demo)
- [x] Error state + retry on generate failure
- [x] `sessionStorage` draft persistence

## Phase 4 — Dashboard shell & header
- [x] `fetchStrategyPlan` in dashboard page (server) — fixture fallback
- [x] `DashboardLayout.tsx` — bento grid, responsive stack
- [x] `StrategyHeader.tsx` with animated `RouteLine`
- [x] `AlignmentScore.tsx` — speedometer + 120px count-up
- [x] `GoalTreePlaceholder.tsx` — constellation
- [x] `GoalTreeSlot.tsx` — boundary for `feat/graph`
- [x] `app/dashboard/[planId]/page.tsx`
- [x] Not-found / invalid planId UI
- [x] Link to `/opportunity/[planId]`

## Phase 5 — Dashboard cards
- [x] `BottleneckCard.tsx`
- [x] `SemesterPriorities.tsx`
- [x] `CutList.tsx` — grouped, verdict stamps
- [x] `NextSevenDays.tsx` — priority chips
- [x] `RiskCards.tsx` — severity styling
- [x] Staggered card entrance (Framer, 40ms)
- [x] Card hover lift (150ms)
- [x] Scan-line skeleton state

## Phase 6 — Opportunity check UI
- [x] `OpportunityInput.tsx`
- [x] `FitScoreGauge.tsx` — 800ms fill animation, pending state
- [x] `OpportunityResult.tsx` — all sections
- [x] `RecommendationStamp.tsx` — spring-in stamp
- [x] `app/opportunity/[planId]/page.tsx`
- [x] Wire `POST /api/opportunity` (404 falls back to fixture)
- [x] Loading + error states
- [x] Back to dashboard navigation

## Integration
- [x] Dashboard renders correctly from fixture / demo `planId`
- [x] Onboarding → generate → dashboard E2E (with demo fallback)
- [x] `GoalTreeSlot` ready for `GoalTree` swap-in
- [x] Status colors match graph (via shared `lib/statusColors.ts`)
- [x] No unrelated files changed

## Validation
- [x] `npm run typecheck` — clean
- [x] `npm run lint` — clean
- [x] `npm run build` — clean, no warnings
- [x] Landing → demo dashboard works
- [x] Onboarding completable in &lt; 3 minutes
- [x] `prefers-reduced-motion` honored (CSS safety net + per-component Framer guards)
- [x] Demo scenario in global PRD §9 reads correctly on the dashboard

## Completion
- [x] Update feature PRD status → Complete
- [x] Update feature tech spec status → Complete
- [x] Mark all tasks above done
- [x] Log final UI decisions in `DECISIONS.md`
