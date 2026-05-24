# Feature Modules: Pathwise MVP

These feature docs are the implementation layer under `docs/architecture/`. They use one naming convention:

```text
NNN-kebab-case/
  PRD.md
  TECH_SPEC.md
  TASKS.md
  DECISIONS.md
```

Each feature must explain both product behavior and technical implementation architecture.

---

## Core Modules

| Order | Folder | Name | Role |
|---|---|---|---|
| 0 | [000-project-foundation-and-data-contract](000-project-foundation-and-data-contract/) | Project Foundation and Data Contract | Dependencies, env, types, validation, demo data, Supabase schema |
| 1 | [001-landing-and-onboarding](001-landing-and-onboarding/) | Landing and Onboarding | Capture the student profile and start generation |
| 2 | [002-strategy-generation-ai](002-strategy-generation-ai/) | Strategy Generation AI | Groq prompt, validation, and plan creation |
| 3 | [003-demo-data-and-plan-fetching](003-demo-data-and-plan-fetching/) | Demo Data and Plan Fetching | Reliable demo route and plan retrieval |
| 4 | [004-dashboard-command-center](004-dashboard-command-center/) | Dashboard Command Center | Main strategy dashboard composition |
| 5 | [005-strategy-map-visualization](005-strategy-map-visualization/) | Strategy Map Visualization | Hero graph, bottleneck highlight, graph fallback |
| 6 | [006-opportunity-checker](006-opportunity-checker/) | Opportunity Checker | Evaluate new opportunities against the current plan |
| 7 | [007-supabase-persistence-and-api](007-supabase-persistence-and-api/) | Supabase Persistence and API | Database implementation and persistence helpers |
| 8 | [008-progressive-onboarding-strategy-map](008-progressive-onboarding-strategy-map/) | Progressive Onboarding Strategy Map | Live map-building onboarding; fixes list inputs; per-step AI insights |
| 9 | [009-pastel-theme-overhaul](009-pastel-theme-overhaul/) | Pastel Theme Overhaul | Sitewide warm pastel palette replacing cool blue/slate tokens |
| 10 | [010-graph-visual-redesign](010-graph-visual-redesign/) | Graph Visual Redesign | Per-pillar pastel nodes, pulse animation, dashed edges with progress, zoom fix |
| 11 | [011-node-task-dialog](011-node-task-dialog/) | Node Task Dialog and AI Generator | Tabbed dialog with task list, manual add, AI task generation, recursive expansion |
| 12 | [012-project-sidebar](012-project-sidebar/) | Project Sidebar | Collapsible sidebar with pillar-based projects, task checkboxes, inline add |
| 13 | [013-kanban-dashboard](013-kanban-dashboard/) | Kanban Dashboard | Tabbed Map/Insights workspace, per-pillar Kanban boards, navbar dropdown |

---

## Onboarding source of truth

For **onboarding UX** (split layout, progressive map, chip inputs), use **[008-progressive-onboarding-strategy-map](008-progressive-onboarding-strategy-map/)**.  
[001-landing-and-onboarding](001-landing-and-onboarding/) remains the reference for the landing page only.

---

## Recommended Build Order

1. `000-project-foundation-and-data-contract`
2. `003-demo-data-and-plan-fetching`
3. `004-dashboard-command-center`
4. `005-strategy-map-visualization`
5. `006-opportunity-checker`
6. `001-landing-and-onboarding`
7. `002-strategy-generation-ai`
8. `007-supabase-persistence-and-api`

For hackathon execution, the practical priority is:

1. Foundation contract: dependencies, types, validation, status colors, demo data
2. Demo dashboard
3. Strategy header, cut list, next 7 days, and risks
4. Strategy Map
5. Opportunity Checker with mocked fallback
6. Landing and onboarding shell
7. Groq integration
8. Supabase persistence
9. Polish

---

## System Flow

```text
Landing
  |
  v
Onboarding -> POST /api/generate
  |              |
  |              v
  |         Groq + Zod
  |              |
  |              v
  |         Supabase JSONB
  v
/dashboard/[planId]
  |
  |-- Strategy Header
  |-- Alignment Score
  |-- Strategy Map
  |-- Cut List
  |-- Next Seven Days
  |-- Risks
  |
  v
Opportunity Checker -> POST /api/opportunity
  |
  v
Fit score, recommendation, tradeoffs, conditions, cuts required
```

Demo shortcut:

```text
/dashboard/demo-cs-student-001
  -> lib/demoData.ts
  -> same dashboard components
```

---

## File Responsibilities

- `PRD.md`: user value, scope, acceptance criteria.
- `TECH_SPEC.md`: files, data flow, component/API architecture, implementation notes.
- `TASKS.md`: build checklist.
- `DECISIONS.md`: locked choices and tradeoffs.

Before coding any feature:

1. Read `docs/architecture/`.
2. Read this README.
3. Read the feature `PRD.md`.
4. Read the feature `TECH_SPEC.md`.
5. Work through `TASKS.md`.
6. Add new decisions to `DECISIONS.md`.
