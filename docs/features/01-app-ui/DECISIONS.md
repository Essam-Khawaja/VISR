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
`AlignmentScore` and `FitScoreGauge` read Framer’s `useReducedMotion` hook.
