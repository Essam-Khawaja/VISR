# Feature Modules — Adaptive Degree OS

Six feature modules, implemented in this order:

| Order | Folder | Name |
|-------|--------|------|
| 1 | [001-user-foundation](001-user-foundation/) | User Foundation Layer |
| 2 | [002-degree-roadmap-engine](002-degree-roadmap-engine/) | Degree Roadmap Engine |
| 3 | [004-weekly-execution-system](004-weekly-execution-system/) | Weekly Execution System **(core loop)** |
| 4 | [003-graph-visualization](003-graph-visualization/) | Graph Visualization System |
| 5 | [005-progress-reflection-system](005-progress-reflection-system/) | Progress + Reflection System |
| 6 | [006-adaptation-intelligence-engine](006-adaptation-intelligence-engine/) | Adaptation Intelligence Engine |

## System flow

```
User Profile (001)
       ↓
Roadmap Engine (002)
       ↓
Graph (003) ←→ Weekly Tasks (004)
       ↓
Progress + Reflection (005)
       ↓
Adaptation Engine (006)
       ↓
(updated roadmap) → loop
```

## Each folder contains

- `PRD.md` — what and why
- `TECH_SPEC.md` — how to build
- `TASKS.md` — implementation checklist
- `DECISIONS.md` — locked product/tech choices

## Workflow

Before coding any feature:

1. Read global `docs/architecture/` docs
2. Read the feature PRD + TECH_SPEC
3. Work through TASKS.md in order
4. Log new decisions in DECISIONS.md

Templates: `docs/templates/FEATURE_*.md`
