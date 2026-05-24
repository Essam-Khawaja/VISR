# Feature Tasks: Progressive Onboarding Strategy Map

## Status
Draft

## Setup
- [ ] Read feature PRD
- [ ] Read feature tech spec
- [ ] Read `docs/architecture/PRD.md` onboarding + Strategy Map sections
- [ ] Read [001-landing-and-onboarding](../001-landing-and-onboarding/) and [005-strategy-map-visualization](../005-strategy-map-visualization/)
- [ ] Confirm scope with stakeholder: ring layout + per-step insight API

## Phase 1 — Input fixes (unblock UX)
- [ ] Add `components/onboarding/ChipInput.tsx` (draft text + chips, Enter/comma to add)
- [ ] Replace course list in `StepAcademic` / new `StepCourses` with `ChipInput`
- [ ] Replace commitments list in `StepCommitments` with `ChipInput`
- [ ] Manual test: spaces inside names, commas between items, no character loss
- [ ] Unit-style manual: paste "Algorithms, Databases, Linear Algebra" → 3 chips

## Phase 2 — Onboarding map state + layout
- [ ] Add `onboardingMapTypes.ts` and `useOnboardingMap.ts`
- [ ] Add `buildOnboardingLayout.ts` (goal center, course ring, commitment ring)
- [ ] Extend `graphTypes.ts` for onboarding node kinds if needed
- [ ] Extend `GoalTree` / `useGraphScene` with `displayMode: "onboarding"` (read-only, no HUD)
- [ ] Add `OnboardingMapPanel.tsx` + `OnboardingShell.tsx` split layout
- [ ] Wire step transitions to `applyMapDelta` on Continue

## Phase 3 — Step wizard refactor
- [ ] Split constraints into `StepConstraints.tsx` (optional step 4)
- [ ] Update `OnboardingProgress` labels (Destination → Classes → Commitments → Constraints → Brain dump)
- [ ] Refactor `OnboardingForm.tsx` for 5 steps + map state + session draft v2
- [ ] Update `app/onboarding/page.tsx` for full-height split layout
- [ ] Add `OnboardingInsightStrip.tsx` (placeholder text until API)

## Phase 4 — Per-step AI insights
- [ ] Add `lib/deterministicOnboardingInsight.ts`
- [ ] Add `OnboardingInsightRequestSchema` to `lib/validate.ts`
- [ ] Add `app/api/onboarding/insight/route.ts` (Groq + fallback)
- [ ] Fetch insight on each Continue; show loading skeleton
- [ ] Brain dump step: return `bottleneckPreview` + optional concern labels on map

## Phase 5 — Final generate + morph
- [ ] Keep `POST /api/generate` on submit; optional `onboardingPreview` in body
- [ ] Replace or augment `GenerationLoading` as map overlay with morph messages
- [ ] Ensure `planStore.save` + redirect unchanged
- [ ] Dashboard graph should feel like continuation (same goal label)

## Phase 6 — Polish
- [ ] Back button: revert step index; optional dimming of later ring nodes
- [ ] Empty/error states per PRD
- [ ] `prefers-reduced-motion` on edge draw
- [ ] 2D graph fallback if WebGL fails during onboarding

## Validation
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Manual: full onboarding → map grows 3 rings → dashboard
- [ ] Manual: demo CTA still bypasses onboarding
- [ ] Manual: generate failure shows error + demo link with map still visible

## Completion
- [ ] Update PRD status → Complete
- [ ] Update Tech Spec status → Complete
- [ ] Mark tasks complete
- [ ] Note in [001-landing-and-onboarding](../001-landing-and-onboarding/) that onboarding UX is superseded by 008
- [ ] Add entry to `docs/features/README.md`
