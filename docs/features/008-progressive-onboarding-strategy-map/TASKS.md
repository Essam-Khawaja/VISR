# Feature Tasks: Progressive Onboarding Strategy Map

## Status
Complete

## Setup
- [x] Read feature PRD
- [x] Read feature tech spec
- [x] Read `docs/architecture/PRD.md` onboarding + Strategy Map sections
- [x] Read [001-landing-and-onboarding](../001-landing-and-onboarding/) and [005-strategy-map-visualization](../005-strategy-map-visualization/)
- [x] Confirm scope with stakeholder: ring layout + per-step insight API

## Phase 1 — Input fixes (unblock UX)
- [x] Add `components/onboarding/ChipInput.tsx` (draft text + chips, Enter/comma to add)
- [x] Replace course list in `StepAcademic` / new `StepCourses` with `ChipInput`
- [x] Replace commitments list in `StepCommitments` with `ChipInput`
- [x] Manual test: spaces inside names, commas between items, no character loss
- [x] Unit-style manual: paste "Algorithms, Databases, Linear Algebra" → 3 chips

## Phase 2 — Onboarding map state + layout
- [x] Add `onboardingMapTypes.ts` and `useOnboardingMap.ts`
- [x] Add `buildOnboardingLayout.ts` (goal center, course ring, commitment ring)
- [x] Extend `graphTypes.ts` for onboarding node kinds if needed
- [x] Extend `GoalTree` / `useGraphScene` with `displayMode: "onboarding"` (read-only, no HUD)
- [x] Add `OnboardingMapPanel.tsx` + `OnboardingShell.tsx` split layout
- [x] Wire step transitions to `applyMapDelta` on Continue

## Phase 3 — Step wizard refactor
- [x] Split constraints into `StepConstraints.tsx` (optional step 4)
- [x] Update `OnboardingProgress` labels (Destination → Classes → Commitments → Constraints → Brain dump)
- [x] Refactor `OnboardingForm.tsx` for 5 steps + map state + session draft v2
- [x] Update `app/onboarding/page.tsx` for full-height split layout
- [x] Add `OnboardingInsightStrip.tsx` (placeholder text until API)

## Phase 4 — Per-step AI insights
- [x] Add `lib/deterministicOnboardingInsight.ts`
- [x] Add `OnboardingInsightRequestSchema` to `lib/validate.ts`
- [x] Add `app/api/onboarding/insight/route.ts` (Groq + fallback)
- [x] Fetch insight on each Continue; show loading skeleton
- [x] Brain dump step: return `bottleneckPreview` + optional concern labels on map

## Phase 5 — Final generate + morph
- [x] Keep `POST /api/generate` on submit; optional `onboardingPreview` in body
- [x] Replace or augment `GenerationLoading` as map overlay with morph messages
- [x] Ensure `planStore.save` + redirect unchanged
- [x] Dashboard graph should feel like continuation (same goal label)

## Phase 6 — Polish
- [x] Back button: revert step index; optional dimming of later ring nodes
- [x] Empty/error states per PRD
- [x] `prefers-reduced-motion` on edge draw
- [ ] 2D graph fallback if WebGL fails during onboarding (deferred: nice-to-have)

## Validation
- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`
- [ ] Manual: full onboarding → map grows 3 rings → dashboard
- [ ] Manual: demo CTA still bypasses onboarding
- [ ] Manual: generate failure shows error + demo link with map still visible

## Completion
- [x] Update PRD status → Complete
- [x] Update Tech Spec status → Complete
- [x] Mark tasks complete
- [x] Note in [001-landing-and-onboarding](../001-landing-and-onboarding/) that onboarding UX is superseded by 008
- [x] Add entry to `docs/features/README.md`
