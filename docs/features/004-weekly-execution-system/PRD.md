# Feature PRD: Weekly Execution System

## Status
Draft

## Summary
**Core product loop.** Converts the long-term roadmap into a small set of concrete weekly tasks tailored to the student's current level, progress, and academic year. Tasks are actionable (join a club, complete a module, start a project, explore a career domain)—not abstract goals—and each task links back to a roadmap node.

## User Problem
Students have long-term ambition but no bridge to what to do *this week*. Without weekly grounding, the roadmap becomes wallpaper.

## User Story
As a student with a generated roadmap, I want 3–5 specific tasks each week linked to my plan, so that my long-term goal turns into actions I can actually complete.

## Main User Flow
1. System runs weekly plan generation (on week boundary or first visit of week).
2. Generator selects eligible roadmap nodes based on year, status, dependencies, priority.
3. System creates `WeeklyPlan` with `Task[]` (title, linkedNodeId, difficulty, status).
4. Student sees task dashboard for current week.
5. Student marks tasks in progress / complete (handoff to Feature 005).
6. Next week: new plan generated; incomplete tasks may roll over or deprioritize (see decisions).

## Requirements

### Must Have
- [ ] Generate `WeeklyPlan` from roadmap + current progress
- [ ] 3–7 tasks per week (configurable cap, default ~5)
- [ ] Each task has: id, title, linkedNodeId, difficulty, status
- [ ] Tasks are concrete actions, not vague goals
- [ ] Task dashboard UI for current week
- [ ] Fixed weekly cycle (not daily planner for MVP)
- [ ] Link tasks to graph nodes

### Nice to Have
- [ ] Roll incomplete high-priority tasks to next week
- [ ] Student snooze or swap a suggested task
- [ ] Push/email reminder mid-week

## Out of Scope
- Daily habit tracking
- Calendar sync (Google/Outlook)
- Team/shared tasks

## UX Notes
- Dashboard is default home after onboarding.
- Show week number and date range.
- Task card: title, difficulty badge, linked node name, CTA to start/complete.
- Empty state: "Generating your week…" on first run.

## Inputs / Outputs

| Direction | Description |
|-----------|-------------|
| **Input** | `Roadmap`, node statuses, current week, `UserProfile.yearOfStudy` |
| **Output** | `WeeklyPlan` with `Task[]` |

## Success Criteria
- [ ] New week produces new task set from roadmap
- [ ] Each task maps to valid `linkedNodeId`
- [ ] Student can view and interact with all tasks for current week
- [ ] Demo: completing a task flow connects to reflection (Feature 005)
