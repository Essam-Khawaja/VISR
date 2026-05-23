# Feature Tasks: Progress + Reflection System

## Setup
- [ ] Read feature PRD and tech spec
- [ ] Read weekly task API from Feature 004
- [ ] Confirm reflection minimum length in DECISIONS.md

## Implementation
- [ ] Define `Reflection` type and DB table
- [ ] Implement `PATCH /api/tasks/:id` with status transitions
- [ ] Implement completion flow requiring reflection payload
- [ ] Build `CompleteTaskModal` with reflection form
- [ ] Implement `updateNodeFromTask` helper
- [ ] Update roadmap node status on task completion (transaction)
- [ ] Implement `GET /api/progress/summary`
- [ ] Build progress summary widget on dashboard
- [ ] Add error handling if node update fails

## Integration
- [ ] Wire modal from Weekly Task List (004)
- [ ] Ensure graph (003) reads updated node status
- [ ] Expose reflection + completion events for adaptation (006)

## Validation
- [ ] Test reflection validation (too short rejected)
- [ ] Test node moves to completed after task complete
- [ ] Manual demo: complete task → see graph update
- [ ] Run typecheck, lint, build

## Completion
- [ ] Update PRD/tech spec status
- [ ] Update this task list
- [ ] Add decisions to `DECISIONS.md`
