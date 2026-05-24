# Feature Tasks: User Foundation Layer

## Setup
- [ ] Read feature PRD
- [ ] Read feature tech spec
- [ ] Check global architecture docs (`docs/architecture/DATA_MODEL.md`)
- [ ] Confirm implementation scope

## Implementation
- [ ] Define `UserProfile` type in `lib/types.ts`
- [ ] Create DB table / collection for `UserProfile`
- [ ] Build onboarding wizard UI (multi-step)
- [ ] Implement degree, year, goal, interests steps
- [ ] Implement optional constraints step
- [ ] Add client-side validation for required fields
- [ ] Create `POST /api/profile` endpoint
- [ ] Create `GET /api/profile` endpoint
- [ ] Wire submit → save → redirect to roadmap flow
- [ ] Add loading state on submit
- [ ] Add error state for failed save

## Integration
- [ ] Connect onboarding to auth (user must be signed in or session created)
- [ ] Pass saved profile to Degree Roadmap Engine trigger (Feature 002)
- [ ] Ensure styling matches project

## Validation
- [ ] Run typecheck
- [ ] Run lint
- [ ] Run build
- [ ] Manually test full onboarding flow
- [ ] Verify profile JSON shape matches tech spec

## Completion
- [ ] Update feature PRD status
- [ ] Update feature tech spec status
- [ ] Update this task list
- [ ] Add any decisions to `DECISIONS.md`
