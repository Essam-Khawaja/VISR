# Feature PRD: Degree Roadmap Engine

## Status
Draft

## Summary
Transforms the student profile into a structured four-year academic and career roadmap. Output is year-by-year stages (exploration → specialization → career prep) with interconnected nodes: courses, skills, clubs, projects, and milestones—aligned to the student's goal (e.g. health tech → health tech clubs, relevant courses).

## User Problem
Students receive generic degree requirements but no personalized path that connects classes, experiences, and career direction into one coherent long-term plan.

## User Story
As a student with a defined goal, I want a four-year roadmap tailored to my degree and interests, so that I know what to explore, build, and prioritize each year—not just which courses satisfy requirements.

## Main User Flow
1. System receives `UserProfile` after onboarding (or profile update).
2. Generator produces `Roadmap` with years 1–4, each with focus theme and `nodes[]`.
3. Nodes include type, label, dependencies, and suggested timing.
4. Roadmap persisted and passed to Graph Visualization (003) and Weekly Execution (004).

## Requirements

### Must Have
- [ ] Input: `UserProfile` (degree, year, interests, primaryGoal)
- [ ] Output: `Roadmap` with 4 years and progressive focus labels
- [ ] Node types: `course`, `skill`, `club`, `project`, `milestone`
- [ ] Nodes linked to goal (e.g. health tech → relevant clubs/courses)
- [ ] Dependency edges between nodes where applicable
- [ ] Persist roadmap JSON per student
- [ ] Regenerate on profile goal change (manual trigger for MVP)

### Nice to Have
- [ ] Hybrid AI + rule-based generation for richer suggestions
- [ ] Brain dump from profile influences node suggestions
- [ ] Semester-level granularity within each year

### Nice to Have
- [ ] Import university-specific course catalog

## Out of Scope
- Real-time sync with registrar enrollment
- Guaranteed accuracy of club/course existence at every university
- Full LLM agent that autonomously edits roadmap without rules guardrails

## UX Notes
- After generation, show summary: "Your 4-year path toward [goal]"
- Allow user to skim year tabs before viewing graph.
- Loading state during generation (may take several seconds if AI used).

## Inputs / Outputs

| Direction | Description |
|-----------|-------------|
| **Input** | `UserProfile` |
| **Output** | `Roadmap` JSON (years, nodes, edges) |

## Success Criteria
- [ ] Roadmap generated from test profiles with goal-specific nodes
- [ ] Year 1 skews exploration; later years skew specialization/career prep
- [ ] Roadmap consumable by graph renderer and task generator
- [ ] Demo: health-tech goal surfaces health-tech-relevant clubs/projects
