# DECISIONS: Graph And Onboarding Rebuild

## D1: One Visible Node Body

**Decision:** The graph should render one visible node disk per node. The HTML/SVG overlay will become the visible node body, while Three.js remains the positioning, edge, camera, and hit-test layer.

**Reason:** The current node plus text-bubble layering looks like two separate circles. HTML/SVG gives reliable text wrapping and circular progress without fighting WebGL text rendering.

## D2: Tasks Become Graph Nodes

**Decision:** Canonical `StrategyTask` rows should render as task nodes in the graph.

**Reason:** If adding a task does not change the map, the graph feels disconnected from execution. Rendering tasks as nodes makes the map visibly grow and keeps Today/Week in sync.

## D3: Keep `strategy_tasks` As Execution Source

**Decision:** Do not replace `strategy_tasks`. Use it as the source for dated execution tasks.

**Reason:** Feature 014 already connected graph, Today, and Week through this model. This feature extends visual graph structure without undoing that integration.

## D4: Add `strategy_nodes` For Non-Task Graph Structure

**Decision:** Introduce `strategy_nodes` for university years, semesters, courses, clubs, work, projects, and other non-task graph nodes.

**Reason:** These entities are graph context, not dated execution tasks. Storing them separately avoids turning every university concept into a fake task.

## D5: Onboarding Starts With End-Of-University Identity

**Decision:** The first onboarding question is "What do you want to be at the end of university?"

**Reason:** VISR should start from strategic direction, then derive years, semesters, current semester, and tasks. Starting with current tasks would collapse it back into a to-do app.

## D6: Onboarding Uses Progressive Graph Scopes

**Decision:** Onboarding should move through graph scopes: destination, university timeline, current year, current semester, task seed, handoff.

**Reason:** The user needs to see the zoom from big life arc to this semester. A single flat graph cannot communicate that hierarchy clearly.

## D7: No AI-Generated Tasks In Onboarding

**Decision:** Onboarding may use AI for insight copy or later strategy evaluation, but it must not auto-generate tasks.

**Reason:** The user explicitly wants to be prompted to make tasks. Manual task entry also avoids low-quality AI task spam and keeps the graph personally grounded.

## D8: First-Run App Opens Onboarding

**Decision:** `/` should route to onboarding when there is no active plan and to the dashboard when an active plan exists.

**Reason:** The product should feel like a setup-driven strategy command center, not a static landing page the user has to interpret.

## D9: Demo Reliability Remains Separate

**Decision:** Demo routes and seeded Today tasks stay intact even after first-run onboarding routing changes.

**Reason:** The hackathon demo still needs a reliable path that does not depend on a new user completing onboarding live.

## D10: Course Load Estimates Are Helpful Defaults, Not Degree Audit Truth

**Decision:** Fall/Winter course counts are estimated from total required courses and remaining fall/winter terms.

**Reason:** This gives the graph useful structure fast without pretending to be a university-specific degree planner.

## D11: Onboarding Nodes Re-IDed On Handoff

**Decision:** During onboarding, nodes use `planId = "onboarding-preview"`. On handoff, all nodes and tasks are re-IDed with the real planId before saving to nodeStore/taskStore.

**Reason:** The onboarding preview plan is transient. Persisting with the real ID ensures the dashboard can load the graph without a separate migration step.

## D12: Dashboard Auto-Drills To Current Semester

**Decision:** When real StrategyNode[] data is present (not legacy pillar conversion), the graph auto-focuses on the current academic year and semester via focusPath.

**Reason:** The user's most relevant context is always the current semester. Starting zoomed out at the university root wastes a click on every dashboard visit.

## D13: Halos Fully Hidden In Unified Node Mode

**Decision:** All Three.js halo, pulseHalo, core, and ring material opacities are forced to 0. The HTML overlay button is the sole visible node.

**Reason:** The dual-layer rendering (glow sprite + HTML disk) created a visible second circle. Hiding the glow layer produces a clean single-disk appearance while preserving Three.js for positioning, edges, and camera control.

## D14: Nucleus Resolution Falls Back To Legacy Pillars

**Decision:** `resolveNucleusLevel` attempts StrategyNode[] hierarchy first. If no real root node or no children are found, it falls back to the legacy `plan.strategicPillars` path.

**Reason:** Demo plans and older saved plans use the legacy pillar model. The fallback ensures the graph still works for these cases without data migration.

## D15: Demo Replay Reset And University Node Task Dialog

**Decision:** Dashboard exposes a "Replay onboarding" demo control that clears local and Supabase plan graph data (`strategy_plans`, `strategy_nodes`, `strategy_tasks`) plus the onboarding session draft, then routes to `/strategyweb/onboarding`. Explore mode opens `NodeTaskDialog` only on nucleus clicks; `NodeTaskDialog` resolves `StrategyNode` ids (not only legacy `goal`/pillar ids).

**Reason:** Stale duplicate nodes from earlier onboarding bugs require a full reset for demo testing without dedupe logic. University explore nuclei use non-legacy ids (`onboarding-semester-fall`, etc.), so the dialog must resolve saved graph nodes for the add-task flow to work.

## D16: Preview Nucleus Layout And Aggregated Task List

**Decision:** Client replay reset uses anon Supabase only (no service role in browser). Preview/explore nucleus layouts (`layoutOverride`) render all nodes at full opacity without label-spacing push. `PlanProvider` filters to university subtree when university nodes exist. Center-node dialog lists tasks on the nucleus and direct child nodes via `tasksForNucleus`.

**Reason:** Service client throws in browser; pillar drill-down opacity hid preview orbit nodes; mixed legacy pillar + university nodes polluted semester view; semester dialog must show tasks attached to courses/clubs on the orbit.

## D17: Preview Map Camera Lock And Shared Radial Layout

**Decision:** Dashboard preview locks the graph camera at nucleus origin (`layoutOverride` never pans to orbit nodes). Preview canvas uses `pointer-events: none`; explore is opened via a dedicated bottom affordance (graph not wrapped in a button). Dashboard preview reuses `buildRadialLayoutFromCenter` from onboarding layout.

**Reason:** Orbit-node camera pan and accidental drag shifted the semester nucleus off-screen; shared radial layout matches onboarding centering and ring spacing for many children.

