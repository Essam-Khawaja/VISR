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

**Reason:** Pathwise should start from strategic direction, then derive years, semesters, current semester, and tasks. Starting with current tasks would collapse it back into a to-do app.

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

