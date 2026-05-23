# Feature Tasks: Strategy MVP

## Status
In Progress — implementation complete; manual QA pending

## Setup
- [x] Read feature PRD
- [x] Read feature tech spec
- [x] Confirm scope (light theme + persistence + API + living strategy + Today)

## Phase 1 — Light visual system
- [x] Rewrite `styles/tokens.css` with light palette + radii + shadows
- [x] Update `styles/globals.css` (body bg, focus, selection)
- [x] Extend `tailwind.config.ts` (soft tints, radii, shadows)
- [x] Update `components/ui/Card.tsx` (rounded-2xl, soft shadow)
- [x] Update `components/ui/Button.tsx` (pill primary, rounded-xl secondary)
- [x] Update `components/ui/Badge.tsx` (dot + soft bg)
- [x] Update `components/ui/Input.tsx`, `Textarea.tsx` (rounded-xl, taller)
- [x] Update `components/ui/Skeleton.tsx` (light shimmer)
- [x] Update `components/ui/NumberDial.tsx` colors (inherits tokens)
- [x] Tone-down or remove `CornerBrackets` / `Reticle` from light surfaces (removed from layout + HUD)
- [x] Update `components/landing/LandingHero.tsx`
- [x] Update `components/onboarding/OnboardingProgress.tsx` + steps + `GenerationLoading.tsx`
- [x] Update `components/layout/DashboardSidebar.tsx`
- [x] Update `components/dashboard/DashboardLayout.tsx`
- [x] Update `components/opportunity/*`
- [x] Sanity: `npm run typecheck && npm run lint && npm run build` clean

## Phase 2 — Graph in light theme
- [x] Soften `components/graph/glowTexture.ts`
- [x] Switch nodes to non-additive (`MeshBasicMaterial`, solid)
- [x] Switch edges to non-additive gray tubes
- [x] Bottleneck pulse: scale + soft halo (no flash)
- [x] Update `StrategyHUD.tsx` to white cards + shadow
- [x] Update `SelectionCard.tsx` to white surface + rounded
- [x] Update `NodePopover.tsx`

## Phase 3 — Plan store + APIs
- [x] Add `lib/planStore.ts` with save/load/update/applyOpportunity helpers
- [x] Add `lib/prompts.ts` (strategy + opportunity prompt templates)
- [x] Add `lib/validate.ts` (Zod schemas)
- [x] Add `lib/aiClient.ts` (OpenAI wrapper, optional)
- [x] Add `lib/deterministicPlan.ts` (fallback generator)
- [x] Add `lib/deterministicOpportunity.ts` (fallback scorer)
- [x] Add `app/api/generate/route.ts`
- [x] Add `app/api/opportunity/route.ts`
- [x] Update `components/onboarding/OnboardingForm.tsx` — call /api/generate, save to store, redirect
- [x] Client hydration via `PlanProvider` (replaces server fetchPlan for user plans)
- [x] Update `components/dashboard/DashboardLayout.tsx` — hydrate from store on mount
- [x] Update `components/opportunity/OpportunityClient.tsx` — call /api/opportunity with current plan
- [x] Add "Apply to my plan" CTA on `OpportunityResult.tsx`
- [x] Add `.env.example` with `OPENAI_API_KEY` placeholder + comment about fallback

## Phase 4 — Living strategy
- [x] Add `PlanProvider` exposing plan + actionStates + markAction + applyOpportunity
- [x] Wrap `DashboardLayout` in provider (client component)
- [x] Action checkbox in `SelectionCard` (pillar list + action detail)
- [x] Graph reflects action completion (success/muted colors) — `useGraphScene` + `actionStates`
- [ ] Pillar status recomputed in graph nodes (all done → Strong) — deferred; static plan status for MVP
- [x] Intelligence sections in `SelectionCard` (filter nextSevenDays + cutList + risks by pillar)
- [x] Add `components/dashboard/IntelligenceDock.tsx` — full Next 7 days dock, toggle button
- [x] Persist action state to planStore on toggle

## Phase 5 — Today mode
- [x] Add `components/dashboard/TodayOverlay.tsx`
- [x] Register `T` key handler in `GoalTree.tsx`
- [x] Today shows top 3 high-priority `nextSevenDays` items with checkboxes
- [x] Add Today button to `DashboardSidebar.tsx`
- [x] Hint copy ("Press T for today")

## Validation
- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`
- [ ] Manual: onboarding → real plan → reload → same plan
- [ ] Manual: action checkbox + graph updates
- [ ] Manual: Today opens, action checks, persists
- [ ] Manual: Opportunity Apply mutates plan
- [ ] Manual: Demo path still works

## Completion
- [ ] Update PRD status → Complete (after manual QA)
- [ ] Update Tech Spec status → Complete (after manual QA)
