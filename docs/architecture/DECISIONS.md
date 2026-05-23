# DECISIONS: Pathwise

Key architectural and design decisions made before the hackathon build. These should not be revisited during the 24-hour window unless something is broken.

---

## D1: Custom Three.js graph instead of React Flow

**Decision:** Build the Goal Tree as a custom Three.js scene, not with React Flow or any diagram library.

**Reason:** React Flow has a recognizable visual ceiling. Every React Flow graph looks like a flowchart builder. The Goal Tree is the hero component of the product and must visually impress judges within seconds. Custom Three.js gives full control over node geometry, gradient edges, camera animation, and lighting.

**Tradeoff:** Higher implementation complexity and time cost for Person 1.

**Mitigation:** Person 1 owns this component exclusively and works against the fixture JSON from hour 1. If the 3D version is not ready by hour 16, fall back to a custom SVG/Canvas 2D radial graph — still impressive, still custom, just flat.

---

## D2: No authentication for the hackathon

**Decision:** No login, no user accounts. Plan IDs are stored in localStorage and passed as URL params.

**Reason:** Auth adds setup time, complexity, and nothing to the demo. Judges do not care about auth. They care about the product.

**Tradeoff:** No data privacy, shared Supabase tables are public read/write.

**Mitigation:** This is acceptable for a 24-hour hackathon demo. Post-hackathon would add Supabase Auth.

---

## D3: Pre-generate and cache the demo scenario

**Decision:** The CS student demo scenario is generated before the hackathon presentation, saved to Supabase with a hardcoded UUID, and loaded directly. The live AI is never called during judging for the main demo.

**Reason:** Eliminates latency risk, eliminates API failure risk, ensures the demo always works. The only live AI call during the demo is the Opportunity Check, which is fast and has a clear loading state.

**Tradeoff:** The main dashboard demo is not "live" in the sense that it is not generating in real time.

**Mitigation:** The Opportunity Check is live, which demonstrates real AI integration. The generation flow can also be shown separately before the demo proper.

---

## D4: Claude claude-sonnet-4-5 for all AI calls

**Decision:** Use claude-sonnet-4-5 for both strategy generation and opportunity check. Do not use Haiku.

**Reason:** Haiku's structured JSON reliability is lower than Sonnet's. A malformed JSON response during a hackathon demo is catastrophic. The cost difference across a 24-hour demo is negligible (estimated $2-5 total).

**Tradeoff:** Slightly higher cost per call.

**Mitigation:** Pre-caching the demo scenario eliminates the most expensive call during judging.

---

## D5: Single accent color design system

**Decision:** The entire UI uses one accent color (`#4FACFE`). All other colors are neutrals, status colors (success/warning/danger), or text colors.

**Reason:** Multiple accent colors make interfaces look amateur. Restraint in color is the fastest way to make something look premium. Every accent use should feel intentional because there is only one.

**Tradeoff:** Less visual variety.

**Mitigation:** The Three.js graph provides rich color through status encoding on nodes. The dashboard itself stays restrained.

---

## D6: Server-side data fetching for dashboard

**Decision:** The dashboard page.tsx fetches StrategyPlan from Supabase server-side using the App Router. No client-side data fetching for the initial render.

**Reason:** Eliminates loading state for the main dashboard. The page arrives with data. Framer Motion handles the visual entry animations, not a skeleton loading state.

**Tradeoff:** Slightly more complex page setup.

**Mitigation:** Standard App Router pattern, well-documented, Cursor handles it cleanly.

---

## D7: Fixture JSON committed to repository

**Decision:** The full demo scenario StrategyPlan is committed to `/lib/fixture.ts` as a TypeScript export. All three developers build against this from hour 1.

**Reason:** Eliminates the dependency on Person 2's AI pipeline being done before Persons 1 and 3 can work with real data shapes. Everyone builds against the same fixture. Real data drops in at the end and everything just works.

**Tradeoff:** None significant.

---

## D8: Framer Motion only outside the Three.js canvas

**Decision:** All Framer Motion animations are applied to React components outside the Three.js canvas. The canvas handles its own animation loop internally.

**Reason:** Mixing Framer Motion with Three.js canvas re-renders causes performance issues. Three.js runs its own requestAnimationFrame loop and should not be controlled by React's render cycle.

**Implementation:** The GoalTree component is wrapped in a regular div that Framer Motion can animate (fade in, scale up on mount). Inside the canvas, everything is pure Three.js.

---

## D9: Next.js app colocated at repo root

**Decision:** Ship the MVP Next.js layout (`/app`, `/components`, `/lib`) from the repository root next to `/docs`.

**Reason:** Matches `ARCHITECTURE.md` directory conventions and avoids an extra nesting layer for a hackathon timeline.

**Tradeoff:** Spec docs and runnable code live in one tree — keep docs authoritative and route generated output to `.gitignore`-safe folders only.
