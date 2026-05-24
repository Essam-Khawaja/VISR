# TASKS: Graph And Onboarding Rebuild

## 1. Documentation

- [x] Commit this feature spec before implementation.
- [x] Confirm this feature supersedes onboarding behavior from `008-progressive-onboarding-strategy-map`.
- [x] Confirm this feature extends graph behavior from `014-integration`.

## 2. One Visible Graph Node

- [x] Inspect current `useGraphScene.ts` overlay rendering.
- [x] Remove the separate visible text bubble.
- [x] Make one visible node disk contain:
  - label text
  - fill
  - circular progress ring
  - child/task count badge if needed
- [x] Hide or make transparent the duplicate Three.js core fill.
- [x] Keep Three.js node group as the anchor for edges/camera/animation.
- [x] Ensure overlay click selects the node.
- [x] Ensure canvas raycast hit target matches the visible node diameter.
- [x] Add measured label sizing.
- [x] Ensure long labels wrap inside the disk without ellipsis.
- [x] Verify desktop and mobile graph views.

## 3. Task Nodes Grow The Graph

- [x] Extend graph layout inputs to accept canonical `StrategyTask[]`.
- [x] Render tasks as graph nodes under their parent node.
- [x] When adding a task from the center node, attach it to the active center.
- [x] When adding a task from a course/club/work node, attach it to that node.
- [x] When adding a child task under an existing task, attach via `parentTaskId`.
- [x] Animate newly added task node from center to orbit.
- [x] Keep task due date and done state synced with Today/Week.
- [x] Ensure task node done state contributes to parent circular progress.
- [x] Preserve existing seeded demo tasks in Today.

## 4. Data Model

- [x] Add `StrategyNode` runtime type.
- [x] Add `StrategyNodeKind`.
- [x] Add `StrategyGraphScope`.
- [x] Add `UniversityOnboardingProfile`.
- [x] Add `UniversityGraphDraft`.
- [x] Add Zod schemas for new types.
- [x] Add local node store:
  - `loadNodes(planId)`
  - `saveNodes(planId, nodes)`
  - `createStrategyNode(input)`
  - `updateStrategyNode(nodeId, patch)`
  - `nodesForParent(nodes, parentNodeId)`
- [x] Decide whether to implement `strategy_nodes` table in this pass or local-only first.
- [x] If Supabase is included, update `db/schema.sql`.

## 5. Active Plan Routing

- [x] Add active plan helpers in `planStore` or a small `activePlanStore`.
- [x] Set active plan after onboarding completion.
- [x] Change `/` to route:
  - no active plan -> `/strategyweb/onboarding`
  - active plan -> `/strategyweb/dashboard/[planId]`
- [x] Keep `/strategyweb/demo` and demo dashboard working.
- [x] Keep direct `/flowgram` and `/flowgram/week` compatibility paths.

## 6. Premium Onboarding Shell

- [x] Rebuild `OnboardingShell` as full-screen map-first experience.
- [x] Place question card top-left on desktop.
- [x] Make card dock gracefully on mobile.
- [x] Keep map visible throughout onboarding.
- [x] Add smooth step transitions with Framer Motion.
- [x] Persist draft to `pathwise-onboarding-draft-v3`.
- [x] Add "resume draft" behavior.

## 7. Onboarding Step: End State

- [x] Ask: "What do you want to be at the end of university?"
- [x] Capture `endOfUniversityGoal`.
- [x] Create university outcome root node.
- [x] Render root node immediately.

## 8. Onboarding Step: University Context

- [x] Capture university name.
- [x] Capture degree/program.
- [x] Capture expected program length.
- [x] Capture total courses required.
- [x] Capture courses completed if known.
- [x] Capture current year.
- [x] Capture expected graduation year if known.
- [x] Create linear year graph.
- [x] Highlight current year.
- [x] Compute initial fall/winter course load estimate.

## 9. Onboarding Step: Year Zoom

- [x] Ask for current semester.
- [x] Ask if spring/summer courses are expected.
- [x] Ask for recurring clubs/work/research/projects.
- [x] Assign commitments to semesters.
- [x] Zoom graph into current year.
- [x] Show Fall, Winter, Spring, Summer around current year.
- [x] Attach commitment nodes to semesters.

## 10. Onboarding Step: Current Semester

- [x] Ask for exact classes.
- [x] Ask for work hours.
- [x] Ask to verify clubs/projects/research.
- [x] Ask constraints.
- [x] Zoom graph into current semester.
- [x] Add course nodes.
- [x] Add commitment nodes.
- [x] Add deterministic strategic pillar nodes.

## 11. Onboarding Step: Manual Task Seed

- [x] Ask the user to add known tasks.
- [x] Require task title.
- [x] Require due date.
- [x] Require priority.
- [x] Let user choose parent node or default to selected center.
- [x] Show each task as a graph node immediately.
- [x] Save tasks through canonical `strategy_tasks`.
- [x] Do not generate tasks with AI.

## 12. Onboarding Handoff

- [x] Ask bottleneck/risk questions.
- [x] Highlight likely bottleneck node.
- [x] Save profile, graph nodes, and tasks.
- [x] Create initial strategy plan summary.
- [x] Set active plan ID.
- [x] Redirect to dashboard.

## 13. Dashboard Integration

- [x] Dashboard opens at current semester graph scope.
- [x] Breadcrumbs allow university/year/semester navigation.
- [ ] Opportunity checker evaluates against active current-semester strategy. (Deferred: requires AI API changes)
- [x] Graph task additions continue to sync with Today/Week.
- [ ] Today and Week should use active plan when available. (Deferred: requires workspace-1 changes)
- [x] Demo routes keep using seeded demo plan/tasks.

## 14. Verification

- [x] Open app without active plan -> onboarding starts.
- [x] Step 1 creates end-of-university node.
- [x] Step 2 creates year timeline.
- [x] Step 3 zooms into current year and creates semesters.
- [x] Step 4 zooms into current semester and creates classes/commitments.
- [x] Step 5 manually adds a task node.
- [x] Added task appears in graph.
- [ ] Added task appears in Today for its due date. (Needs workspace-1 active plan wiring)
- [ ] Added future task appears in Week on correct date. (Needs workspace-1 active plan wiring)
- [x] Done state syncs graph <-> Today <-> Week.
- [x] Node visual is one circle, not text bubble plus mesh.
- [x] Long labels remain inside node.
- [x] Demo dashboard still works.
- [x] Seeded demo tasks remain in Today.
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
