# TASKS: Graph And Onboarding Rebuild

## 1. Documentation

- [ ] Commit this feature spec before implementation.
- [ ] Confirm this feature supersedes onboarding behavior from `008-progressive-onboarding-strategy-map`.
- [ ] Confirm this feature extends graph behavior from `014-integration`.

## 2. One Visible Graph Node

- [ ] Inspect current `useGraphScene.ts` overlay rendering.
- [ ] Remove the separate visible text bubble.
- [ ] Make one visible node disk contain:
  - label text
  - fill
  - circular progress ring
  - child/task count badge if needed
- [ ] Hide or make transparent the duplicate Three.js core fill.
- [ ] Keep Three.js node group as the anchor for edges/camera/animation.
- [ ] Ensure overlay click selects the node.
- [ ] Ensure canvas raycast hit target matches the visible node diameter.
- [ ] Add measured label sizing.
- [ ] Ensure long labels wrap inside the disk without ellipsis.
- [ ] Verify desktop and mobile graph views.

## 3. Task Nodes Grow The Graph

- [ ] Extend graph layout inputs to accept canonical `StrategyTask[]`.
- [ ] Render tasks as graph nodes under their parent node.
- [ ] When adding a task from the center node, attach it to the active center.
- [ ] When adding a task from a course/club/work node, attach it to that node.
- [ ] When adding a child task under an existing task, attach via `parentTaskId`.
- [ ] Animate newly added task node from center to orbit.
- [ ] Keep task due date and done state synced with Today/Week.
- [ ] Ensure task node done state contributes to parent circular progress.
- [ ] Preserve existing seeded demo tasks in Today.

## 4. Data Model

- [ ] Add `StrategyNode` runtime type.
- [ ] Add `StrategyNodeKind`.
- [ ] Add `StrategyGraphScope`.
- [ ] Add `UniversityOnboardingProfile`.
- [ ] Add `UniversityGraphDraft`.
- [ ] Add Zod schemas for new types.
- [ ] Add local node store:
  - `loadNodes(planId)`
  - `saveNodes(planId, nodes)`
  - `createStrategyNode(input)`
  - `updateStrategyNode(nodeId, patch)`
  - `nodesForParent(nodes, parentNodeId)`
- [ ] Decide whether to implement `strategy_nodes` table in this pass or local-only first.
- [ ] If Supabase is included, update `db/schema.sql`.

## 5. Active Plan Routing

- [ ] Add active plan helpers in `planStore` or a small `activePlanStore`.
- [ ] Set active plan after onboarding completion.
- [ ] Change `/` to route:
  - no active plan -> `/2/onboarding`
  - active plan -> `/2/dashboard/[planId]`
- [ ] Keep `/2/demo` and demo dashboard working.
- [ ] Keep direct `/1` and `/1/week` compatibility paths.

## 6. Premium Onboarding Shell

- [ ] Rebuild `OnboardingShell` as full-screen map-first experience.
- [ ] Place question card top-left on desktop.
- [ ] Make card dock gracefully on mobile.
- [ ] Keep map visible throughout onboarding.
- [ ] Add smooth step transitions with Framer Motion.
- [ ] Persist draft to `pathwise-onboarding-draft-v3`.
- [ ] Add "resume draft" behavior.

## 7. Onboarding Step: End State

- [ ] Ask: "What do you want to be at the end of university?"
- [ ] Capture `endOfUniversityGoal`.
- [ ] Create university outcome root node.
- [ ] Render root node immediately.

## 8. Onboarding Step: University Context

- [ ] Capture university name.
- [ ] Capture degree/program.
- [ ] Capture expected program length.
- [ ] Capture total courses required.
- [ ] Capture courses completed if known.
- [ ] Capture current year.
- [ ] Capture expected graduation year if known.
- [ ] Create linear year graph.
- [ ] Highlight current year.
- [ ] Compute initial fall/winter course load estimate.

## 9. Onboarding Step: Year Zoom

- [ ] Ask for current semester.
- [ ] Ask if spring/summer courses are expected.
- [ ] Ask for recurring clubs/work/research/projects.
- [ ] Assign commitments to semesters.
- [ ] Zoom graph into current year.
- [ ] Show Fall, Winter, Spring, Summer around current year.
- [ ] Attach commitment nodes to semesters.

## 10. Onboarding Step: Current Semester

- [ ] Ask for exact classes.
- [ ] Ask for work hours.
- [ ] Ask to verify clubs/projects/research.
- [ ] Ask constraints.
- [ ] Zoom graph into current semester.
- [ ] Add course nodes.
- [ ] Add commitment nodes.
- [ ] Add deterministic strategic pillar nodes.

## 11. Onboarding Step: Manual Task Seed

- [ ] Ask the user to add known tasks.
- [ ] Require task title.
- [ ] Require due date.
- [ ] Require priority.
- [ ] Let user choose parent node or default to selected center.
- [ ] Show each task as a graph node immediately.
- [ ] Save tasks through canonical `strategy_tasks`.
- [ ] Do not generate tasks with AI.

## 12. Onboarding Handoff

- [ ] Ask bottleneck/risk questions.
- [ ] Highlight likely bottleneck node.
- [ ] Save profile, graph nodes, and tasks.
- [ ] Create initial strategy plan summary.
- [ ] Set active plan ID.
- [ ] Redirect to dashboard.

## 13. Dashboard Integration

- [ ] Dashboard opens at current semester graph scope.
- [ ] Breadcrumbs allow university/year/semester navigation.
- [ ] Opportunity checker evaluates against active current-semester strategy.
- [ ] Graph task additions continue to sync with Today/Week.
- [ ] Today and Week should use active plan when available.
- [ ] Demo routes keep using seeded demo plan/tasks.

## 14. Verification

- [ ] Open app without active plan -> onboarding starts.
- [ ] Step 1 creates end-of-university node.
- [ ] Step 2 creates year timeline.
- [ ] Step 3 zooms into current year and creates semesters.
- [ ] Step 4 zooms into current semester and creates classes/commitments.
- [ ] Step 5 manually adds a task node.
- [ ] Added task appears in graph.
- [ ] Added task appears in Today for its due date.
- [ ] Added future task appears in Week on correct date.
- [ ] Done state syncs graph <-> Today <-> Week.
- [ ] Node visual is one circle, not text bubble plus mesh.
- [ ] Long labels remain inside node.
- [ ] Demo dashboard still works.
- [ ] Seeded demo tasks remain in Today.
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`

