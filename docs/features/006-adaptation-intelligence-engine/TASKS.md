# Feature Tasks: Adaptation Intelligence Engine

## Setup
- [ ] Read feature PRD and tech spec
- [ ] Read task/reflection data shapes from 004 and 005
- [ ] Confirm rule thresholds in DECISIONS.md

## Implementation
- [ ] Define `AdaptationResult` and `AdaptationChange` types
- [ ] Implement activity signal queries (completions, skips, by tag)
- [ ] Implement `nodeInactive` rule
- [ ] Implement `pathwayHot` rule
- [ ] Implement `weeklyMissRate` rule
- [ ] Implement `goalDrift` rule
- [ ] Implement `runAdaptation(studentId)` orchestrator
- [ ] Persist roadmap updates with version bump
- [ ] Create `POST /api/adaptation/run` (protected/cron)
- [ ] Create `GET /api/adaptation/last`
- [ ] Build plan update notification banner
- [ ] Build goal review prompt modal
- [ ] Wire week-end trigger (cron or scheduled job stub)

## Integration
- [ ] Weekly plan generator reads updated priorities (004)
- [ ] Graph fade styling reads priority (003)
- [ ] Profile goal PATCH clears drift state (001)

## Validation
- [ ] Unit tests per rule with fixtures
- [ ] End-to-end: skip tasks 2 weeks → priorities drop
- [ ] End-to-end: complete tagged tasks → pathway strengthens
- [ ] Run typecheck, lint, build

## Completion
- [ ] Update PRD/tech spec status
- [ ] Update this task list
- [ ] Add decisions to `DECISIONS.md`
