# Feature Tasks: Graph Visualization System

## Setup
- [ ] Read feature PRD and tech spec
- [ ] Confirm roadmap schema from Feature 002
- [ ] Choose graph library (React Flow recommended)

## Implementation
- [ ] Install graph library dependency
- [ ] Implement `mapRoadmapToFlow(roadmap)`
- [ ] Implement layout by year (positions)
- [ ] Build `RoadmapGraph` component
- [ ] Build custom node component with status colors
- [ ] Render edges from `roadmap.edges`
- [ ] Add node click → detail panel
- [ ] Add graph route/tab in main app navigation
- [ ] Add loading state while fetching roadmap
- [ ] Add empty state if no roadmap

## Integration
- [ ] Read roadmap from API (Feature 002)
- [ ] Reflect `status` updated by Feature 005
- [ ] Link node detail to related weekly tasks (Feature 004) when available

## Validation
- [ ] Manual test with sample roadmap JSON
- [ ] Verify pan/zoom works
- [ ] Run typecheck, lint, build

## Completion
- [ ] Update PRD/tech spec status
- [ ] Update this task list
- [ ] Add decisions to `DECISIONS.md`
