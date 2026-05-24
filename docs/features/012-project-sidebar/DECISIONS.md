# DECISIONS: Project Sidebar

## D1: Pillars as Projects

Strategic pillars from AI generation serve as the project list. No user-created projects for MVP -- all projects originate from the strategy plan.

## D2: Three-Column Layout

Added ProjectSidebar between a 72px nav rail and the flex workspace. The nav rail is icon-only to maximize horizontal space for the project panel and map.

## D3: Inline Add Only

Task creation happens inline within the sidebar (no modal). AI task generation remains in the NodeTaskDialog on the graph.

## D4: No Gantt for First Pass

Gantt chart requires start/end dates and a canvas renderer. Deferred to a follow-up feature. The `dueDate` field is added now to support it later.
