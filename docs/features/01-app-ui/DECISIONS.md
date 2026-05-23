# Feature Decisions: App UI & Design System

## Decision Log

### 2026-05-23 — Feature scoped as full app UI, graph excluded

**Decision:**  
Feature `01-app-ui` owns landing, onboarding shell, dashboard layout/cards, opportunity UI, design tokens, and shared `components/ui/*`. Three.js Goal Tree implementation stays in parallel feature/branch (`feat/graph`).

**Reason:**  
Architecture assigns Person 3 to dashboard UI + design system; Person 1 to graph. Splitting avoids merge conflicts and lets UI ship against `GoalTreePlaceholder` using fixture data.

**Alternatives Considered:**  
- Single “frontend” feature including graph — rejected; violates team ownership and critical path (graph merges last).
- UI-only with no onboarding — rejected; onboarding is demo-critical per global PRD.

**Consequence:**  
`GoalTreeSlot` must dynamic-import graph with `ssr: false`. Dashboard is “done” for hackathon when placeholder is swapped without layout changes.

---

### 2026-05-23 — Tailwind + CSS variables (not CSS-in-JS theme)

**Decision:**  
Use `tokens.css` as source of truth and extend Tailwind to reference CSS variables.

**Reason:**  
Matches global TECH_SPEC; graph and canvas can read the same `--*` values; fast hackathon iteration.

**Alternatives Considered:**  
- Hardcoded hex in Tailwind config only — rejected; graph and popovers need shared vars.
- styled-components — rejected; extra dependency, conflicts with Tailwind workflow.

**Consequence:**  
All new colors go through `tokens.css` first, then Tailwind `theme.extend`.

---

### 2026-05-23 — Framer Motion for UI; never inside Three.js canvas

**Decision:**  
All non-canvas animations use Framer Motion per global PRD §6.

**Reason:**  
Consistent motion language; graph team owns canvas animations separately.

**Alternatives Considered:**  
- CSS-only animations — rejected for staggered children and score counter ergonomics.
- GSAP — rejected; unnecessary dependency.

**Consequence:**  
`lib/motion.ts` centralizes durations/stagger; graph must not import Framer.

---

### 2026-05-23 — Dashboard 60/40 layout with graph-first responsive stack

**Decision:**  
Desktop: ~60% width for tree column, ~40% for cards. Below 1024px: full-width graph on top, cards below.

**Reason:**  
Directly implements global PRD: “Goal Tree occupies 60% of the screen. The graph is the page.”

**Alternatives Considered:**  
- 50/50 split — rejected; weakens hero visualization.
- Cards-only mobile without graph — rejected; graph is the product even when smaller.

**Consequence:**  
`DashboardLayout` uses CSS grid with `minmax` and single breakpoint at `lg`.

---

### 2026-05-23 — Display font: Clash Display with Cal Sans fallback

**Decision:**  
Load Clash Display via `next/font/local` if file available; otherwise fallback stack `"Cal Sans", "Inter", sans-serif` for hero/score only. Inter for all body UI.

**Reason:**  
Global PRD specifies Clash Display or Cal Sans for display; Inter is mandatory for UI.

**Alternatives Considered:**  
- Inter only — rejected; alignment score at 120px needs distinct display character.
- Google Fonts only — Clash may not be on Google; local WOFF is acceptable for hackathon.

**Consequence:**  
Document font file placement in `/public/fonts/` when added; until then fallback is acceptable for dev.

---

### 2026-05-23 — Demo path bypasses generation loading

**Decision:**  
Landing “View demo strategy” links directly to `/dashboard/[DEMO_PLAN_ID]` with no onboarding or AI loading screen.

**Reason:**  
Global architecture: demo is pre-cached in Supabase; judges must not wait on API during presentation.

**Alternatives Considered:**  
- Fake loading for drama — rejected; wastes demo time and risks failure.

**Consequence:**  
`DEMO_PLAN_ID` must be in env; landing CTA uses it explicitly.

---

### 2026-05-23 — `prefers-reduced-motion` supported from day one

**Decision:**  
Disable or shorten count-up, stagger, and gauge animations when user prefers reduced motion.

**Reason:**  
Low effort; avoids accessibility distraction during demos on macOS.

**Alternatives Considered:**  
- Ship motion full-only — rejected; easy win via `useReducedMotion()`.

**Consequence:**  
`AlignmentScore` and `FitScoreGauge` read Framer's `useReducedMotion` hook.

---

### 2026-05-23 — Pathwise's visual fingerprint is six signature components

**Decision:**  
Rather than dressing up generic cards, every surface composes from six custom signature components: `RouteLine`, `Reticle`, `CornerBrackets`, `ScanLine`, `Grain`, and `GlowFollow`. The dashboard's HUD aesthetic emerges from how these are layered, not from any one element.

**Reason:**  
A consistent visual language that is unmistakably not a shadcn/MUI/Vercel-template dashboard. The brackets replace bordered cards, the route line replaces section titles, the reticle frames anything that names a target, and the grain + glow break up the dark surface without resorting to gradient backgrounds.

**Alternatives Considered:**  
- Use a component library and re-skin — rejected; the visual ceiling is the library.
- Pure flat dark UI — rejected; nothing memorable.

**Consequence:**  
New surfaces should reach for these signature components before adding new chrome. If a card "wants a border", reach for `CornerBrackets`; if it wants a divider, reach for `RouteLine`; if it wants a target callout, reach for `Reticle`.

---

### 2026-05-23 — Bento layout (1.5fr : 1fr top), not equal-weight grid

**Decision:**  
Top section of dashboard is a `lg:grid-cols-[1.5fr_1fr]` grid: Goal Tree on the left dominating ~60% of the width, AlignmentScore + BottleneckCard stacked on the right. SemesterPriorities + RiskCards run as a 2-column row below; CutList and NextSevenDays as full-width rows after.

**Reason:**  
Honors the global PRD's "60% to the graph, the graph is the page" mandate while still surfacing the score and bottleneck at the top — both are demo-critical 10-second reads.

**Consequence:**  
Mobile collapses to single-column stack with the graph still appearing first (preserves hierarchy). Future cards should default into the rows below the top section unless they belong in the right-stack.

---

### 2026-05-23 — UI decouples from AI pipeline and Goal Tree via 404 / placeholder fallbacks

**Decision:**  
`OnboardingForm` and `OpportunityClient` both detect HTTP 404 from their API calls and silently fall back to a working demo state (demo plan / fixture opportunity). `GoalTreeSlot` renders `GoalTreePlaceholder` (custom SVG constellation positioned at real pillar coordinates) until `feat/graph` swaps it for the Three.js component.

**Reason:**  
Lets `feat/ui` ship and be demoed in isolation. The UI never breaks when the other branches are behind, and the demo path always works.

**Consequence:**  
When `feat/ai-pipeline` and `feat/graph` merge, no UI code changes are required — `dynamic()` import in `GoalTreeSlot` and the API hitting the live endpoints take over automatically.

---

### 2026-05-23 — Reduced-motion safety net is global, not per-component

**Decision:**  
Added a global `@media (prefers-reduced-motion: reduce)` block in `globals.css` that collapses every CSS animation and transition to ~0ms, in addition to per-component Framer `useReducedMotion()` guards.

**Reason:**  
Per-component guards can miss CSS-only animations (badge dot breathing, scan-mask, scan-line). A global belt-and-suspenders rule ensures the entire surface respects the preference even if a future component forgets to.

**Consequence:**  
Any new CSS animation (`@keyframes ...`) is automatically opted out under reduced motion. Per-component Framer guards still required for `initial` states that would otherwise pop.
