# Feature PRD: Main Dashboard

## Status
Draft

## Summary
The **primary home screen** after onboarding. Integrates the degree roadmap, growth graph (hero), strategic bottleneck, and cut list into one cohesive view. A student should understand their situation within 10 seconds: where they are headed, what is blocking them, what to sacrifice, and how their long-term plan looks visually.

This feature **does not replace** the backend modules in [002-degree-roadmap-engine](../002-degree-roadmap-engine/) and [003-graph-visualization](../003-graph-visualization/) — it is the **UI shell** that composes them alongside strategy cards.

## User Problem
Roadmaps, graphs, and advice scattered across pages feel like another app. Students need one place that answers: *Where am I going? What's in my way? What should I cut? What does my path look like?*

## User Story
As an ambitious student, I want one dashboard that shows my goal, my growth graph, my biggest bottleneck, and what to cut or defer, so that I can orient myself without digging through menus.

## Main User Flow
1. Student completes onboarding (001) → lands on dashboard.
2. If no roadmap exists, dashboard triggers generation (002) and shows loading state.
3. Dashboard header shows: destination (goal), current stage, route status, alignment score.
4. **Hero (60% width):** growth graph from roadmap (003) — click node for details.
5. **Side cards:** bottleneck detail, cut list (cut / defer / keep / double down).
6. Student acts on insight → navigates to weekly tasks (004) or completes onboarding edits.

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Header: Destination | Stage | Bottleneck (1-line) | Score   │
├──────────────────────────────┬──────────────────────────────┤
│                              │  Bottleneck Card             │
│   Growth Graph (Hero)        │  (detail + linked node)      │
│   ~60% width                 ├──────────────────────────────┤
│   from Roadmap (002+003)     │  Cut List Card               │
│                              │  Cut | Defer | Keep | 2x     │
├──────────────────────────────┴──────────────────────────────┤
│ Optional footer: link to Weekly Tasks (004)                 │
└─────────────────────────────────────────────────────────────┘
```

## Sub-components (see linked docs)

| Component | Doc | Source module |
|-----------|-----|---------------|
| Roadmap data + year context | [degree-roadmap-engine.md](degree-roadmap-engine.md) | 002 |
| Growth graph (hero) | [graph-visualization.md](graph-visualization.md) | 003 |
| Bottleneck | [bottleneck.md](bottleneck.md) | 007 (strategy slice) |
| Cut list | [cut-list.md](cut-list.md) | 007 (strategy slice) |

## Requirements

### Must Have
- [ ] Single `/dashboard` route as default post-onboarding home
- [ ] Load `UserProfile` (001), `Roadmap` (002), strategy signals for bottleneck/cut list
- [ ] Embed growth graph as hero visualization (003)
- [ ] Header: destination, current stage, main bottleneck (summary), route status, alignment score
- [ ] Bottleneck card with specific explanation (not generic)
- [ ] Cut list card with items in four categories, each with reason tied to goal
- [ ] Empty/loading states when roadmap or strategy not yet generated
- [ ] Click graph bottleneck-related node ↔ highlight bottleneck card

### Nice to Have
- [ ] Semester priorities mini-card
- [ ] Risk warnings strip
- [ ] Staggered card entrance animation (Framer Motion)
- [ ] Alignment score count-up animation

## Out of Scope
- Weekly task list on same page (lives on 004; link only for MVP)
- Opportunity check tool (separate feature, post-MVP)
- Full Three.js cinematic goal tree (global PRD vision) — MVP uses React Flow graph per 003

## UX Notes
- Graph is the page — not a tab buried in settings.
- Tone: sharp advisor. Example bottleneck copy: *"Your bottleneck is no shipped project. Everything else is noise until that changes."*
- Cut list reasons must reference student's `primaryGoal` and current bottleneck.
- Mobile: stack graph above cards (graph still primary, not collapsed by default).

## Inputs / Outputs

| Direction | Description |
|-----------|-------------|
| **Input** | `UserProfile`, `Roadmap`, task/progress summary (005), adaptation priorities (006) |
| **Output** | Rendered dashboard; optional `StrategySnapshot` persisted for bottleneck + cut list |

## Success Criteria
- [ ] Dashboard loads in under 2s with cached roadmap
- [ ] Bottleneck visible without scrolling on laptop viewport
- [ ] Graph renders full roadmap with status colors
- [ ] Cut list has ≥2 items with goal-specific reasons in demo
- [ ] Does not feel like a generic admin template or chatbot UI
