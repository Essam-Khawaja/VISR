# PRD: Strategy Map Visualization

## Purpose

The Strategy Map is the hero visualization. It turns the plan into a visual model of destination, pillars, actions, and bottleneck.

## User Story

As a student, I want to see how my actions connect to my goal and where the bottleneck is, so I can stop treating every activity as equally important.

## Scope

- `StrategyMap.tsx`
- Data-driven radial graph
- Bottleneck highlight
- Status color encoding
- Hover popovers
- Three.js implementation if reliable
- 2D radial fallback if needed

## Acceptance Criteria

- Renders from `StrategicPillar[]`.
- Center node is destination.
- Pillar nodes orbit the destination.
- Action nodes cluster around pillars.
- Bottleneck-related node pulses red.
- Hover shows name, status, and recommendation.
- Graph failure falls back to polished 2D.

