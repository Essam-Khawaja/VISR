# Feature Modules — Adaptive Degree OS

## Core modules

| Order | Folder | Name | Role |
|-------|--------|------|------|
| 1 | [001-user-foundation](001-user-foundation/) | User Foundation Layer | Onboarding + profile |
| 2 | [002-degree-roadmap-engine](002-degree-roadmap-engine/) | Degree Roadmap Engine | **Backend:** 4-year roadmap generation |
| 3 | [004-weekly-execution-system](004-weekly-execution-system/) | Weekly Execution System | **Core loop:** weekly tasks |
| 4 | [003-graph-visualization](003-graph-visualization/) | Graph Visualization System | **Component:** roadmap → graph renderer |
| 5 | [005-progress-reflection-system](005-progress-reflection-system/) | Progress + Reflection | Task completion + accountability |
| 6 | [006-adaptation-intelligence-engine](006-adaptation-intelligence-engine/) | Adaptation Intelligence | Roadmap recalibration rules |

## Integrated UI

| Order | Folder | Name | Role |
|-------|--------|------|------|
| 7 | [007-main-dashboard](007-main-dashboard/) | **Main Dashboard** | **Home screen:** composes 002 + 003 + bottleneck + cut list |

### What's inside 007-main-dashboard

| Sub-doc | Contents |
|---------|----------|
| [degree-roadmap-engine.md](007-main-dashboard/degree-roadmap-engine.md) | How roadmap data appears on dashboard |
| [graph-visualization.md](007-main-dashboard/graph-visualization.md) | Hero graph (60% layout) |
| [bottleneck.md](007-main-dashboard/bottleneck.md) | Single constraint + card |
| [cut-list.md](007-main-dashboard/cut-list.md) | Cut / defer / keep / double down |

## Recommended build order

1. `001-user-foundation`
2. `002-degree-roadmap-engine` (API + generator first)
3. `004-weekly-execution-system` (core loop)
4. `003-graph-visualization` (graph component)
5. **`007-main-dashboard`** (wire 002 + 003 + bottleneck + cut list)
6. `005-progress-reflection-system`
7. `006-adaptation-intelligence-engine`

## System flow

```
User Profile (001)
       ↓
Roadmap Engine (002) ──────────────────┐
       ↓                               │
Main Dashboard (007) ← Graph (003)     │
  · hero graph                         │
  · bottleneck                         │
  · cut list                           │
       ↓                               │
Weekly Tasks (004) ←───────────────────┘
       ↓
Progress + Reflection (005)
       ↓
Adaptation Engine (006)
       ↓
(updated roadmap) → refresh dashboard
```

## Each folder contains

- `PRD.md` — what and why
- `TECH_SPEC.md` — how to build
- `TASKS.md` — implementation checklist
- `DECISIONS.md` — locked product/tech choices

`007-main-dashboard` also has sub-component markdown files for integrated slices.

## Workflow

Before coding any feature:

1. Read global `docs/architecture/` docs
2. Read the feature PRD + TECH_SPEC
3. Work through TASKS.md in order
4. Log new decisions in DECISIONS.md

Templates: `docs/templates/FEATURE_*.md`
