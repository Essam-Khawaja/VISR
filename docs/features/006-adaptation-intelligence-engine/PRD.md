# Feature PRD: Adaptation Intelligence Engine

## Status
Draft

## Summary
Keeps the long-term plan **useful and aligned** as the student changes. Detects patterns—missed tasks, inactive nodes, repeated engagement in one direction, goal drift—and recalibrates the roadmap: strengthen active pathways, fade or deprioritize unused branches, suggest goal updates when behavior diverges from stated ambition.

## User Problem
Static four-year plans become outdated by second semester. Students do not know if their plan still matches who they are becoming.

## User Story
As a student whose interests and habits evolve, I want my roadmap to adapt based on what I actually do, so that the plan stays relevant instead of ignored.

## Main User Flow
1. System runs adaptation job after key events (week end, task completion batch, profile edit) or on schedule.
2. Engine scores nodes and pathways using rules (engagement, completion, skips, inactivity).
3. Engine applies updates: adjust `priority`, suggest new nodes, deprioritize/fade inactive branches.
4. Student sees optional "Plan updated" notice with human-readable reason.
5. Updated roadmap flows back to graph, weekly tasks, and future reflections.

## Requirements

### Must Have
- [ ] Rule-based scoring (not full AI agent for MVP)
- [ ] Detect inactive nodes (no tasks completed in N weeks)
- [ ] Detect repeated completion in same tag/pathway → increase depth/priority
- [ ] Detect high skip/miss rate → reduce priority on related nodes
- [ ] Detect goal drift heuristic → prompt student to confirm or update primary goal
- [ ] Persist roadmap `version` increment on adaptation
- [ ] Feed updated priorities into weekly task generator

### Nice to Have
- [ ] Suggest 1–2 new nodes when strong interest signal detected
- [ ] Explainability: "We deprioritized X because…"
- [ ] Student approve/reject adaptation batch

## Out of Scope
- Autonomous LLM rewriting entire roadmap without rules
- Predictive GPA or career outcome modeling
- Cross-user benchmarking

## UX Notes
- Non-blocking notifications; student can dismiss.
- Goal drift prompt: "You've completed 8 tasks in startups but your goal is health tech—update goal?"
- Do not delete nodes in MVP; only adjust priority and visual fade (graph).

## Inputs / Outputs

| Direction | Description |
|-----------|-------------|
| **Input** | Roadmap, task history, reflections metadata, profile |
| **Output** | Updated `Roadmap` (priorities, optional new nodes), user notifications |

## Success Criteria
- [ ] Inactive pathway lowers node priority within 1 adaptation run
- [ ] Active pathway raises priority and appears in next weekly plan more often
- [ ] Goal drift surfaces confirm/update prompt in test scenario
- [ ] Roadmap version increments and graph reflects deprioritized styling
