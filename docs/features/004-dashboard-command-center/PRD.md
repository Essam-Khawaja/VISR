# PRD: Dashboard Command Center

## Purpose

The dashboard is the main product. It must communicate the student's strategic situation in 10 seconds.

## User Story

As a student, I want one screen that shows my destination, bottleneck, route status, alignment score, Strategy Map, what to cut, and what to do next.

## Scope

- `/dashboard/[planId]`
- `/dashboard/demo-cs-student-001`
- Dashboard composition
- Header and alignment score
- Semester priorities
- Risk cards
- Integration slots for Strategy Map, Cut List, Next Seven Days, and Opportunity Checker

## Layout Requirements

- Dark premium background.
- Strategy Map takes visual priority.
- Cards around the graph.
- Header shows destination, current stage, main bottleneck, route status, and alignment score.
- Alignment score is visually prominent and animated.

## Acceptance Criteria

- Dashboard renders any valid `StrategyPlan`.
- Demo dashboard renders instantly.
- Bottleneck is immediately visible.
- No generic SaaS template feel.
- No blank loading or error states.

