# Feature Decisions: Progressive Onboarding Strategy Map

## Decision Log

### 2026-05-23 — Onboarding builds a dedicated ring map, then converts to full StrategyPlan

**Decision:**  
During onboarding, the graph uses a **three-ring builder model** (goal → courses → commitments), not the final pillar/action graph. On submit, `POST /api/generate` still returns a standard `StrategyPlan`; the dashboard replaces the layout with `buildGraphLayout(plan)`.

**Reason:**  
The user’s mental model is “I set the main goal in the center, hang classes on it, then hang clubs around that.” That is simpler and more legible during data entry than showing empty pillars. The full strategic graph is the payoff after AI synthesis.

**Alternatives Considered:**  
- Show real pillars incrementally as user types — rejected; pillars require inference the user has not provided yet.  
- No map until generate — rejected; this is the core product ask.

**Consequence:**  
Need `OnboardingMapState` + `buildOnboardingLayout` separate from production `buildGraphLayout`. Visual continuity is copy + animation, not identical node IDs.

---

### 2026-05-23 — Map updates on Continue, not on every keystroke

**Decision:**  
The strategy map updates only when the user clicks **Continue** on a step, not on each character typed.

**Reason:**  
Avoids flooding `/api/onboarding/insight` and keeps animations meaningful. Typing fixes (ChipInput) stay local until commit.

**Alternatives Considered:**  
- Live map as chips are added — nice-to-have later.  
- Debounced map update — more complex, still animates too often.

**Consequence:**  
Insight strip updates once per step transition. User may not see course nodes until they continue — acceptable if copy says “Next we’ll add these to your map.”

---

### 2026-05-23 — ChipInput replaces join/split-on-keystroke for list fields

**Decision:**  
Courses and commitments use a **chip/tag input**: draft text field + list of chips. Add chip on Enter or comma (keydown); spaces allowed inside a chip label.

**Reason:**  
Current implementation (`value.join(", ")` + `split` on every `onChange`) **drops commas and breaks natural typing** — reported bug. Chips are the standard pattern for multi-value entry.

**Alternatives Considered:**  
- Single textarea, parse only on blur — works but weaker UX for “how many items” feedback.  
- Masked input with escaped commas — too fiddly.

**Consequence:**  
New `ChipInput` component; `currentCourses` and `commitments` remain `string[]` in `OnboardingFormData`.

---

### 2026-05-23 — Per-step insight via lightweight API route

**Decision:**  
Add `POST /api/onboarding/insight` for short advisor copy per step. Final plan still from `POST /api/generate`.

**Reason:**  
User wants “AI responses” visible after each prompt. A full plan generation per step is slow and expensive. Short insights (~1–2 sentences) are enough for trust-building.

**Alternatives Considered:**  
- Client-only deterministic insights — acceptable fallback, not sufficient when Groq key present.  
- One big generate at end with streamed partial JSON — fragile for hackathon timeline.

**Consequence:**  
New route + `deterministicOnboardingInsight.ts`. Groq prompts must stay short (token cap).

---

### 2026-05-23 — Constraints step does not add map nodes (MVP)

**Decision:**  
Step 4 (constraints + work hours if not moved) updates the insight strip only. No new nodes on the map unless we add a legend chip row later.

**Reason:**  
Constraints are not “things orbiting the goal” in the user’s description (goal, classes, clubs). Keeps the map readable.

**Alternatives Considered:**  
- Small satellite nodes for each constraint — cluttered.  
- Dashed outer ring — nice-to-have.

**Consequence:**  
Map growth story is three beats: goal, classes, commitments (+ brain dump preview halo).

---

### 2026-05-23 — Brain dump shows bottleneck preview, not full pillars

**Decision:**  
On brain dump step, AI returns `bottleneckPreview` (string) shown on map chrome and insight strip. Optional 1–3 “concern” satellite nodes only if deterministic/Groq returns `concernLabels[]`.

**Reason:**  
Full pillars require complete profile synthesis. Preview teases the dashboard without faking pillar structure.

**Alternatives Considered:**  
- Immediately call `/api/generate` on brain dump — slow, duplicates submit.  
- No preview — misses “AI responses” moment.

**Consequence:**  
Brain dump insight route may share keyword logic with `deterministicPlan.detectBottleneck`.

---

### 2026-05-23 — Supersedes 001 onboarding UX, not landing

**Decision:**  
Feature `008-progressive-onboarding-strategy-map` owns onboarding behavior going forward. `001-landing-and-onboarding` remains valid for landing page; its onboarding section is legacy reference only.

**Reason:**  
Avoid conflicting specs. README will list 008 as the onboarding source of truth for map-building flow.

**Consequence:**  
Implementers read 008 before changing `components/onboarding/*`.

---

### 2026-05-23 — Split layout: ~40% form / ~60% map (desktop)

**Decision:**  
Desktop: vertical split with prompt card on top (~min 280px) and map filling remaining viewport height. Mobile: map below form, min-height 280px, user scrolls.

**Reason:**  
User asked to “see the strategy map below being made.” Matches dashboard command-center light theme.

**Alternatives Considered:**  
- Side-by-side 50/50 — cramped for long brain dump.  
- Full-screen map with floating form — harder to implement.

**Consequence:**  
`OnboardingShell` uses `flex-col` and `min-h-[100dvh]`.
