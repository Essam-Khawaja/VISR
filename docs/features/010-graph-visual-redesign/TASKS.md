# Feature Tasks: Graph Visual Redesign

## Status
Complete

## Setup
- [x] Read feature PRD and tech spec
- [x] Read feature 009 (pastel theme) docs for palette values
- [x] Read current graph files

## Phase 1 -- Type Extensions
- [x] Add `pastelColor`, `progressPercent`, `actionCount` fields to `LayoutNode`
- [x] Add optional `progressPercent` field to `LayoutEdge`

## Phase 2 -- Layout & Color Assignment
- [x] Define `PILLAR_PASTELS` and `GOAL_PASTEL` in `graphLayout.ts`
- [x] Assign `pastelColor` and `actionCount` to nodes

## Phase 3 -- Node Rendering
- [x] Use `pastelColor` as primary color in `createNodeMesh`
- [x] Add `pulseHalo` sprite to each node mesh

## Phase 4 -- Edge Rendering
- [x] Replace TubeGeometry with straight dashed lines
- [x] Add progress fill overlay line

## Phase 5 -- Orbit Ring
- [x] Add dashed orbit ring at `PILLAR_RADIUS`

## Phase 6 -- Pulse Animation
- [x] Add pulse constants and implement in animate loop
- [x] Gate behind `!reduceMotion`

## Phase 7 -- Camera Zoom Fix
- [x] Adjust lean factor to 0.35, lookAt to 0.5

## Phase 8 -- HTML Label Overhaul
- [x] Center labels on node with white text
- [x] Add action count badge and progress bar

## Validation
- [x] `npm run typecheck`

## Completion
- [x] Update PRD status to Complete
- [x] Mark tasks complete
