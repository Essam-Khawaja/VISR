# Feature PRD: User Foundation Layer

## Status
Draft

## Summary
Captures the structured student profile that every other feature depends on. Onboarding collects degree context, interests, long-term goals, and optional constraints, then outputs a normalized profile object stored for the roadmap engine, weekly tasks, and adaptation loop.

## User Problem
Ambitious students know what they want in broad terms but lack a single structured representation of who they are academically and where they are headed. Without a normalized profile, long-term plans cannot be personalized or kept aligned over time.

## User Story
As an ambitious university student, I want to tell the platform my degree, year, interests, and career goal in one onboarding flow, so that every recommendation and task is grounded in my actual situation.

## Main User Flow
1. Student signs up or starts onboarding.
2. Student completes multi-step form: degree, year of study, interests, primary long-term goal, optional constraints (time, difficulty).
3. System validates required fields and normalizes inputs (e.g. interests as tags).
4. System saves `UserProfile` and routes student to roadmap generation.

## Requirements

### Must Have
- [ ] Collect degree and year of study
- [ ] Collect primary long-term career goal (single primary goal for MVP)
- [ ] Collect interests (multi-select or tags)
- [ ] Optional constraints: available hours per week, difficulty preference
- [ ] Validate required fields: degree, goal
- [ ] Persist normalized `UserProfile` for downstream features
- [ ] Completable in under 3 minutes

### Nice to Have
- [ ] Brain dump / unstructured text field for extra context
- [ ] University name and current courses
- [ ] Current commitments (clubs, jobs, projects)
- [ ] Profile edit after onboarding

## Out of Scope
- Social login beyond basic auth (MVP)
- Multiple competing primary goals with equal weight
- Import from university SIS / transcript systems
- Advisor or admin roles

## UX Notes
- Multi-step wizard with clear progress indicator.
- Interests as selectable tags with optional free-text add.
- Goal field: short phrase (e.g. "health tech product roles") not essay.
- Empty state: first visit only shows onboarding; returning users skip to dashboard if profile exists.
- Error state: inline validation on required fields before submit.

## Inputs / Outputs

| Direction | Description |
|-----------|-------------|
| **Input** | Onboarding form responses |
| **Output** | Normalized `UserProfile` object stored in DB |

## Success Criteria
This feature is complete when:
- [ ] User can complete onboarding and land on next step (roadmap generation)
- [ ] Profile persists and reloads on return visit
- [ ] Missing degree or goal blocks submit with clear errors
- [ ] Profile object is consumable by Degree Roadmap Engine (Feature 002)
