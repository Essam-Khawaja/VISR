# Feature Tasks: Node Task Dialog and AI Generator

## Status
Complete

## Setup
- [x] Read feature PRD and tech spec
- [x] Read current files

## Phase 1 -- Data Model
- [x] Add `children?: ActionNode[]` to `ActionNode`
- [x] Recursive Zod schema with `z.lazy()`
- [x] Add `addTasksToNode` to `planStore.ts`
- [x] Add `TaskGenerationRequestSchema`

## Phase 2 -- API Route
- [x] Create `app/api/node/tasks/route.ts` with Groq + fallback
- [x] Add task generation prompts
- [x] Zod request/response validation

## Phase 3 -- NodeTaskDialog Component
- [x] Create `NodeTaskDialog.tsx` with tabbed structure
- [x] Tasks tab with checkboxes, expand, manual add
- [x] AI Generate tab with prompt, preview, confirm

## Phase 4 -- GoalTree Integration
- [x] Replace `SelectionCard` with `NodeTaskDialog`
- [x] Wire `onAddTasks` through GoalTree → GoalTreeSlot → PlanProvider

## Phase 5 -- Persistence
- [x] `addTasksToNode` saves to localStorage
- [x] Demo mode uses in-memory mutation

## Phase 6 -- Accessibility
- [x] aria-label on dialog, aria-selected on tabs, role attributes

## Validation
- [x] `npm run typecheck`

## Completion
- [x] Update PRD status to Complete
- [x] Mark tasks complete
