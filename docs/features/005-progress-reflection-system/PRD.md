# Feature PRD: Progress + Reflection System

## Status
Draft

## Summary
Tracks whether the student actually did the work and learned from it—not just checked a box. On task completion, prompts a short reflection or proof-of-understanding (what did you learn, what did you produce). Reflections update node progress on the graph and feed the adaptation engine. This is the **accountability layer** that prevents mindless task completion.

## User Problem
Students tick off goals without integrating learning. The platform would become another to-do list unless completion requires demonstrating understanding or honest reflection.

## User Story
As a student who finished a weekly task, I want to briefly explain what I learned or show what I did, so that my progress is real and the system can adjust my plan intelligently.

## Main User Flow
1. Student marks task complete on dashboard.
2. Modal or step asks: "What did you learn?" and/or "Link/describe what you produced" (short text, min length).
3. System saves `Reflection`, updates task status, updates linked roadmap node (`in_progress` → `completed` or partial progress).
4. Graph view reflects updated node status on next load.
5. Adaptation engine reads reflection signals later (Feature 006).

## Requirements

### Must Have
- [ ] Task status tracking: pending → in_progress → completed
- [ ] Reflection required on completion (min 1–2 sentences)
- [ ] Store reflections linked to `taskId` and `linkedNodeId`
- [ ] Update roadmap node status when task completes
- [ ] Simple progress summary (e.g. tasks completed this week, nodes completed total)

### Nice to Have
- [ ] Optional attachment URL (project link, screenshot)
- [ ] Reflection quality hint ("be specific about what changed for you")
- [ ] Weekly reflection digest for student

## Out of Scope
- Heavy analytics dashboards
- AI grading of reflection quality at MVP
- Peer or advisor review

## UX Notes
- Reflection modal blocks "complete" until minimum text entered.
- Allow "save in progress" without reflection only for `in_progress`, not `completed`.
- Tone: curious coach, not surveillance.

## Inputs / Outputs

| Direction | Description |
|-----------|-------------|
| **Input** | Task completion + reflection text |
| **Output** | Updated task, `Reflection` record, updated node `status` |

## Success Criteria
- [ ] Cannot complete task without reflection in MVP
- [ ] Completed task updates linked graph node
- [ ] Reflections queryable for adaptation rules
- [ ] Demo shows accountability prompt clearly
