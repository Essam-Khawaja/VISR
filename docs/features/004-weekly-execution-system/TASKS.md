# Feature Tasks: Weekly Execution System

## Setup
- [ ] Read feature PRD and tech spec
- [ ] Read roadmap schema (002) and profile (001)
- [ ] Confirm weekly cap and rollover rules in DECISIONS.md

## Implementation
- [ ] Define `WeeklyPlan` and `Task` types
- [ ] Create weekly plan + tasks DB tables
- [ ] Implement `generateWeeklyPlan` selection logic
- [ ] Implement task title templates per node type
- [ ] Implement dependency check (prerequisites completed)
- [ ] Create `GET /api/weekly-plan/current` (get-or-create)
- [ ] Build weekly task dashboard UI
- [ ] Build task card component (status, difficulty, linked node)
- [ ] Wire dashboard as post-onboarding home
- [ ] Add week header (dates, week number)
- [ ] Add loading / empty states

## Integration
- [ ] Consume roadmap from Feature 002
- [ ] Hand off task completion to Feature 005
- [ ] Expose `linkedNodeId` for graph highlight (003)

## Validation
- [ ] Test get-or-create for same week
- [ ] Test new week creates new plan
- [ ] Manual full loop: onboarding → roadmap → weekly tasks
- [ ] Run typecheck, lint, build

## Completion
- [ ] Update PRD/tech spec status
- [ ] Update this task list
- [ ] Add decisions to `DECISIONS.md`
