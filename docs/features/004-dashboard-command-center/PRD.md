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

- Light premium dashboard background.
- Strategy Map appears as a dashboard card, not the whole screen.
- The map has an "Expand map" action that opens the existing interactive graph in a large modal.
- Main dashboard grid shows Next 7 Days, Cut List, Opportunity Checker, Priorities, Risks, and Strategy Map.
- Header shows destination, current stage, main bottleneck, route status, and alignment score.
- Alignment score is visually prominent and animated.
- Next 7 Days actions can be marked open, done, or deferred.
- Dashboard shows a compact route progress metric from action states.

## Acceptance Criteria

- Dashboard renders any valid `StrategyPlan`.
- Demo dashboard renders instantly.
- Bottleneck is immediately visible.
- Graph is useful but does not dominate the page.
- Dashboard looks like a polished strategy workspace, not a right rail attached to a graph.
- No generic SaaS template feel.
- No blank loading or error states.
