# DECISIONS: Pathwise

Architectural and product decisions for the 24-hour MVP.

---

## D1: Build the Full Core Loop First

**Decision:** Prioritize onboarding, demo plan load, dashboard, cut list, next 7 days, and opportunity check before secondary features.

**Reason:** The judging story depends on the full loop: "I was scattered. Pathwise found my bottleneck, told me what to cut, and gave me the next 7 days."

**Tradeoff:** Some depth, polish, or persistence details may be thinner.

**Mitigation:** The demo route and core dashboard must be screenshot-ready.

---

## D2: Strategy Dashboard, Not Chatbot

**Decision:** The product surface is a dashboard with a visual Strategy Map, not a chat interface.

**Reason:** The product should feel like a premium student command center and not a generic AI wrapper.

**Tradeoff:** More custom UI work.

**Mitigation:** Use a static demo plan and typed components to keep build scope contained.

---

## D3: Demo Route Does Not Depend on Live AI

**Decision:** `/dashboard/demo-cs-student-001` loads seeded data from `lib/demoData.ts`.

**Reason:** The main judging demo must be instant and reliable.

**Tradeoff:** The primary dashboard demo is not generated live.

**Mitigation:** The live AI path still exists through onboarding and opportunity checking. Opportunity checker can demonstrate AI live, with a clean fallback if keys are missing.

---

## D4: Store Rich Plan Objects as JSONB

**Decision:** Store the generated `StrategyPlan` in `strategy_plans.plan` JSONB and the opportunity result in `opportunity_checks.check` JSONB.

**Reason:** The nested strategy schema is likely to change during a hackathon. JSONB keeps persistence fast and flexible.

**Tradeoff:** Less queryable than normalized tables.

**Mitigation:** Post-hackathon, frequently queried fields can be promoted to columns.

---

## D5: Grok for Structured Strategy Output

**Decision:** Use xAI Grok API via direct HTTP, default model `grok-4-1-fast-non-reasoning`.

**Reason:** Structured JSON reliability matters more than marginal cost for the MVP.

**Tradeoff:** Slightly higher cost than smaller models.

**Mitigation:** The demo route avoids live strategy generation during judging.

---

## D6: Validate Every AI Response with Zod

**Decision:** Grok output is never trusted until it passes `StrategyPlanSchema` or `OpportunityCheckSchema`.

**Reason:** Invalid JSON or invalid enum values would break the dashboard.

**Tradeoff:** More backend code.

**Mitigation:** Retry strategy generation once with a correction prompt that includes the validation error.

---

## D7: Three.js Preferred, 2D Radial Graph Accepted

**Decision:** Attempt a custom Three.js Strategy Map, but ship a polished 2D radial graph if Three.js risks reliability.

**Reason:** Visual originality helps the demo, but functional completeness matters more.

**Tradeoff:** The fallback is less technically ambitious.

**Mitigation:** The 2D version still uses custom layout, SVG edges, motion, hover popovers, and bottleneck highlighting.

---

## D8: No Authentication for MVP

**Decision:** No login or account system.

**Reason:** Auth does not help the hackathon demo and adds setup risk.

**Tradeoff:** Not production-safe for real student data.

**Mitigation:** Add Supabase Auth and RLS post-hackathon.

---

## D9: Embedded Opportunity Checker

**Decision:** Opportunity checking lives inside the dashboard instead of a separate page.

**Reason:** The opportunity only makes sense against the visible current strategy. Keeping it on the dashboard makes the tradeoff easier to understand.

**Tradeoff:** More dashboard density.

**Mitigation:** Use a compact input and reveal the structured result after submit.

---

## D10: Local React State Only

**Decision:** Use `useState` and `useEffect`; no global state manager.

**Reason:** The app has simple route-level data and local interactive states.

**Tradeoff:** Shared state patterns may need revisiting later.

**Mitigation:** Keep state close to components and pass typed props.
