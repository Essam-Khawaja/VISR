# Feature Tasks: Degree Roadmap Engine

## Setup
- [ ] Read feature PRD and tech spec
- [ ] Read `001-user-foundation` output shape (`UserProfile`)
- [ ] Confirm generator scope (rule-based MVP vs hybrid)

## Implementation
- [ ] Define `Roadmap`, `RoadmapNode`, `RoadmapEdge` types
- [ ] Create roadmap DB persistence
- [ ] Build goal category classifier (keyword/rules)
- [ ] Create 2–3 goal templates (e.g. health-tech, software internship)
- [ ] Implement `generateRoadmap(profile)` function
- [ ] Implement year/focus assignment logic
- [ ] Implement dependency edge builder
- [ ] Create `POST /api/roadmap/generate`
- [ ] Create `GET /api/roadmap`
- [ ] Trigger generation after onboarding complete
- [ ] Add loading UI while generating

## Integration
- [ ] Consume `UserProfile` from Feature 001
- [ ] Expose roadmap to Feature 003 (graph) and 004 (weekly tasks)
- [ ] Store `version` for adaptation engine diffs later

## Validation
- [ ] Unit test generator with fixture profiles
- [ ] Manual test: onboarding → roadmap appears
- [ ] Run typecheck, lint, build

## Completion
- [ ] Update PRD/tech spec status
- [ ] Update this task list
- [ ] Log decisions in `DECISIONS.md`
