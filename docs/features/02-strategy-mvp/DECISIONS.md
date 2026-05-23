# Feature Decisions: Strategy MVP

## Decision Log

### 2026-05-23 — One combined feature folder (not five sub-features)

**Decision:**  
All MVP work — light theme, persistence, AI pipeline, living strategy, Today mode — lives in a single feature folder `docs/features/02-strategy-mvp/`.

**Reason:**  
The slices are deeply coupled: living strategy needs the plan store, the plan store needs the API routes, all of them only feel coherent inside the new light visual system. Splitting into five folders would have made cross-references painful for a one-person hackathon.

**Alternatives Considered:**  
- Five folders (`02-light-theme`, `03-ai-pipeline`, `04-persistence`, `05-living-strategy`, `06-today-mode`) — rejected as bookkeeping overhead.

**Consequence:**  
PRD lists requirements by phase; TASKS.md phases the work; future post-hackathon refactors can split if needed.

---

### 2026-05-23 — Flip to light theme (mostly white, grayscale chrome, single accent)

**Decision:**  
Pathwise commits to a light visual identity. New token palette in `tokens.css`:
- White `--bg-surface`, light gray `--bg-base`, slate-200 `--bg-elevated`
- Slate-200/300 borders; slate-900 / slate-600 / slate-400 text tiers
- Single accent `#2563eb` (deeper blue than the dark-theme `#4facfe` so it carries on white)
- Status colors mapped to `success #059669`, `warning #d97706`, `danger #dc2626` with `*-soft` light tints (`#d1fae5` / `#fef3c7` / `#fee2e2`) for pill backgrounds
- Rounded radii `--radius-sm/md/lg/xl = 8/12/16/24`
- Soft shadows `--shadow-sm/md/lg` at 4–8% black

**Reason:**  
The dark HUD aesthetic reads as sci-fi console. The user (and the personal use case) needs a calm, daily-driver feel — closer to Linear / Notion / Apple Maps than a Bloomberg terminal. Inspiration was synthesized from modern light SaaS dashboards (FluxCRM, Tolab Edu) but with a more editorial type voice and zero stat-grid clutter.

**Alternatives Considered:**  
- Dual theme with toggle — rejected; doubles surface-area for hackathon scope.
- Keep dark + add a light "print" mode — rejected; theming-by-shadow is fragile.
- Dark with rounded — rejected; the user wants white.

**Consequence:**  
Every component touched. Signature components from the dark identity (`CornerBrackets`, `Reticle`, `Grain`, `ScanLine`, `GlowFollow`) are removed from the light surfaces or kept only as faint accent on the landing/demo splash. The graph drops additive blending entirely.

---

### 2026-05-23 — Graph drops additive blending; nodes are solid discs

**Decision:**  
Three.js node materials become `MeshBasicMaterial` with normal blending; the glow sprite becomes a soft outer ring (still normal-blended). Edges become slate-300 tubes with normal blending and ~0.6 opacity. Bottleneck pulse becomes a small scale wobble + soft outer ring, not a flash.

**Reason:**  
Additive blending on a light background washes white. The Obsidian "glowing orbs" mood is impossible on white without looking sickly. The light theme metaphor is closer to a clean mind-map / whiteboard diagram, which is the right mental model for "this is my strategy."

**Consequence:**  
We lose some of the visceral "wow" from the dark version. We gain calm, legibility, and consistency with the rest of the app. The selection/zoom interaction does most of the wow lifting now.

---

### 2026-05-23 — Persistence via `localStorage`, not Supabase

**Decision:**  
`lib/planStore.ts` saves `StoredPlan` (plan + actionStates + commitments + journal + opportunityHistory + lastReviewedAt) under `localStorage["pathwise.plan." + planId]`. A small index `localStorage["pathwise.plans"]` lists user-created plan ids.

**Reason:**  
For a one-user, one-device hackathon the felt-persistence of localStorage is identical to a database for 95% of the value at 2% of the integration cost. Auth, RLS, schemas, and connection strings are all out of scope.

**Alternatives Considered:**  
- Supabase free tier — rejected; setup tax with no demo benefit.
- IndexedDB — rejected; overkill for ~10KB of JSON.

**Consequence:**  
Cross-device sync is impossible. That's fine. Switching to Supabase later means swapping out `planStore` internals; the surface API stays the same.

---

### 2026-05-23 — AI pipeline: OpenAI optional, deterministic fallback mandatory

**Decision:**  
Both `/api/generate` and `/api/opportunity` run with or without an `OPENAI_API_KEY`. When the key is missing or the model returns invalid JSON, a deterministic generator builds a personalized plan / scored opportunity from the input — keyword classification on the brain dump, template strategic pillars by goal type, copied-and-adjusted recommendations.

**Reason:**  
The hackathon prompt demands the app *works*. A demo that bricks because an API key is missing is not a demo. The deterministic generator also makes the dev loop faster (no API hits while iterating UI) and ensures the demo never spends tokens during judging.

**Alternatives Considered:**  
- AI-only with hard requirement — rejected; brittle.
- Two parallel APIs (Anthropic + OpenAI) — rejected; one is enough for MVP.
- Pure deterministic, no AI — rejected; the AI path lifts the perceived quality enough to be worth the optional implementation.

**Consequence:**  
`lib/aiClient.ts` is a thin wrapper. Zod schemas in `lib/validate.ts` are the contract — both paths must produce schema-valid output. Failure to validate falls through to deterministic without throwing.

---

### 2026-05-23 — Living strategy via in-memory + persisted action state

**Decision:**  
A `PlanContext` wraps the dashboard with `{ plan, actionStates, markAction, applyOpportunity, addJournal }`. Action state is `Record<actionId, "open" | "done" | "skipped">`. The graph reads computed status from `actionStates` to recolor nodes and recompute pillar status on the fly (no mutation of the original plan tree).

**Reason:**  
Keeping action state in an overlay map preserves the AI-generated plan as the canonical source while giving the user a fast undo/reset path ("clear progress"). Pillar status becomes a function of `pillar.status + actionStates of its actions`.

**Consequence:**  
The graph re-renders materials on context change; lerps still apply for smoothness. Storage writes are debounced to avoid thrash from rapid checkboxing.

---

### 2026-05-23 — Today mode is a modal overlay, not a route

**Decision:**  
Pressing `T` on the dashboard opens `TodayOverlay` — a `role="dialog"` centered card with the top 3 high-priority items from `nextSevenDays`. `Esc` or `T` again closes. No URL change.

**Reason:**  
Today is a focus aid layered over the strategy, not a distinct page. Keeping it as an overlay preserves the graph's mental persistence and lets the user toggle between strategy view and execution view in one keystroke.

**Consequence:**  
The Today button in the sidebar opens the same overlay (no SPA navigation cost on mobile). Future expansion can route to `/today` if needed; current scope keeps it modal.

---

### 2026-05-23 — Pillar status recompute deferred

**Decision:**  
Action completion updates graph node colors and persists `actionStates`, but does not recompute pillar `status` fields on the plan object (e.g. all actions done → `Strong`).

**Reason:**  
MVP timebox; visual feedback on actions is sufficient for demo. Recomputing pillar status requires a derived-status layer across graph + SelectionCard.

**Alternatives Considered:**  
- Live recompute on every checkbox toggle — rejected for scope.

**Consequence:**  
Pillar badges in SelectionCard still show AI-generated status until a follow-up task lands.

---

### 2026-05-23 — "Apply to my plan" mutates locally, not via API

**Decision:**  
When the user clicks Apply on an `OpportunityCheck` result, the result's `cutsRequired` and `conditions` are merged into the stored plan client-side (`planStore.applyOpportunity`). No additional server round-trip.

**Reason:**  
The API only knows how to evaluate. Applying is the user's decision, and it's a local state mutation. Keeping it local avoids replaying server prompts for what amounts to "add these items to a list."

**Consequence:**  
The plan keeps growing in `commitments[]` and `cutList[]` over time. Future "reset week" UI is plausible but out of scope.
