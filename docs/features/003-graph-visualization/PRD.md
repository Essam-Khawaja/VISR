# Feature PRD: Graph Visualization System

## Status
Draft

## Dashboard integration
Graph **rendering component** lives here. It is embedded as the **hero** on [007-main-dashboard](../007-main-dashboard/) — see [graph-visualization.md](../007-main-dashboard/graph-visualization.md). No separate `/graph` route required for MVP.

## Summary
Renders the degree roadmap as a living growth graph: nodes represent skills, experiences, courses, and milestones; edges represent dependencies. Visual state reflects progress—not started, in progress, completed—with completed areas appearing stronger and inactive paths de-emphasized (fade) when adaptation reduces priority.

## User Problem
Long-term plans in list or calendar form do not show how goals connect or how far along each branch the student is. Students need a spatial mental model of their degree journey.

## User Story
As a student executing my plan, I want to see my roadmap as an interactive graph that shows what I have done and what depends on what, so that I understand how close I am to each outcome.

## Main User Flow
1. Student lands on main dashboard (007); graph renders in hero region.
2. System loads `Roadmap` and maps nodes/edges to graph library format.
3. Graph renders with color/size by `status` and optional progress %.
4. Student clicks a node → detail panel (label, type, linked weekly tasks).
5. Progress updates from Feature 005 refresh node styling on reload.

## Requirements

### Must Have
- [ ] Render nodes from roadmap (`course`, `skill`, `club`, `project`, `milestone`)
- [ ] Render dependency edges
- [ ] Visual states: not started, in progress, completed
- [ ] Map `Roadmap` → graph data structure automatically
- [ ] Click node for basic details

### Nice to Have
- [ ] Node size or glow scales with progress
- [ ] Fade/lowlight nodes with low adaptation priority
- [ ] Filter by year or node type
- [ ] Mini-map or zoom/pan controls

## Out of Scope
- Complex physics animations at MVP
- Real-time collaborative editing
- 3D or "neuron" biological animations (keep 2D DAG simple first)

## UX Notes
- Default layout: left-to-right or top-to-bottom by year.
- Color legend for status.
- Performance: cap visible nodes or collapse distant years if graph is large.
- Empty state: prompt to complete onboarding / generate roadmap.

## Inputs / Outputs

| Direction | Description |
|-----------|-------------|
| **Input** | `Roadmap` + node `status` from progress system |
| **Output** | Interactive graph UI |

## Success Criteria
- [ ] Graph displays all roadmap nodes and edges from test data
- [ ] Status colors match legend
- [ ] Completing a task (Feature 005) updates node appearance after refresh
- [ ] Demo-readable on laptop screen for hackathon
