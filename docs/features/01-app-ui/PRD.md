# Feature PRD: App UI & Design System

## Status
Complete

## Summary
Pathwise’s entire user-facing surface—landing, onboarding, strategy dashboard shell, opportunity check, loading states, shared design system, and the **custom Three.js Goal Tree**. This feature makes the product feel **premium, opinionated, and strategy-first**: the dashboard is a left nav rail plus a **full-viewport** 3D graph; supporting card components remain in the repo for opportunity/onboarding but are not shown on the dashboard route.

**Dashboard (current):** `DashboardSidebar` + `GoalTree` (dynamic import, `ssr: false`). Hover nodes for recommendation detail via `NodePopover`.

## User Problem
Students need to trust Pathwise in seconds. Generic dashboards and chatbot UIs feel like “another productivity app.” They need a interface that:
- Communicates **destination, bottleneck, and route** at a glance
- Feels like a **sharp advisor**, not wellness content
- Looks **intentionally designed** so judges and users take the strategy seriously

## User Stories

**Landing**
- As a visitor, I want to understand what Pathwise does in under 10 seconds, so I know whether to start onboarding or view the demo.

**Onboarding**
- As a scattered student, I want a fast, calm multi-step form (including a brain dump), so I can submit my situation without friction.

**Dashboard**
- As a student with a generated plan, I want to land on a dashboard where the graph dominates and cards answer “what now?”, so I feel clear—not more anxious.

**Opportunity check**
- As a student weighing a new commitment, I want a focused tool with an opinionated result, so I can say yes or no with confidence.

## Main User Flows

### Flow A — Demo (judging)
1. User opens landing → clicks **View demo strategy**
2. Navigates to `/dashboard/[DEMO_PLAN_ID]` (pre-cached plan, no live AI)
3. Dashboard loads: sidebar + full-viewport Goal Tree (camera drift, node spawn)
4. User hovers pillars/actions for recommendations; bottleneck node pulses
5. User opens **Opportunity** from sidebar → enters text → sees fit gauge + recommendation

### Flow B — Full path
1. Landing → **Get my strategy**
2. Onboarding (≤3 minutes) → submit
3. Full-screen generation progress (“Analyzing your goal…”, etc.)
4. Redirect to `/dashboard/[planId]`
5. Same dashboard experience as demo

### Flow C — Opportunity only (from dashboard)
1. From dashboard header/nav → `/opportunity/[planId]`
2. Freeform input → submit → loading gauge → structured result
3. Link back to dashboard

## Requirements

### Must Have — Design system foundation
- [ ] CSS design tokens in `styles/tokens.css` matching global PRD color system (`--bg-base`, `--accent`, etc.)
- [ ] `styles/globals.css` applies dark base, font stacks, antialiasing, focus rings
- [ ] Shared primitives: `Card`, `Badge`, `Button`, `Input`, `Textarea`, `Skeleton`, `NodePopover` (popover styling only; graph wires behavior)
- [ ] Typography: **Inter** for UI/body; display font for hero metrics (Clash Display or Cal Sans via `next/font` or CDN fallback documented in tech spec)
- [ ] Status colors centralized in `lib/statusColors.ts` (consistent with graph)
- [ ] One primary accent (`#4FACFE`); neutrals everywhere else—no rainbow UI

### Must Have — Landing (`/`)
- [ ] Hero: tagline **“You say the what. We tell you the how.”** + one-line value prop (strategy, not tasks)
- [ ] Primary CTA: **Get my strategy** → `/onboarding`
- [ ] Secondary CTA: **View demo strategy** → `/dashboard/[DEMO_PLAN_ID]`
- [ ] Visual tone: dark, minimal, subtle gradient or glow—not stock SaaS illustration
- [ ] No chatbot metaphor (no fake message bubbles)

### Must Have — Onboarding (`/onboarding`)
- [ ] Multi-step shell with progress indicator (4 steps aligned to architecture)
- [ ] Steps: Destination → Academic → Commitments → Brain dump
- [ ] Brain dump: large textarea, placeholder encouraging messy honesty
- [ ] Validation per step (required fields); clear inline errors
- [ ] Final step: submit triggers generation loading (not a blank screen)
- [ ] Completable in **under 3 minutes** (minimal fields, sensible defaults where safe)
- [ ] Mobile: usable at hackathon minimum (desktop-first per global non-goals)

### Must Have — Strategy generation loading
- [ ] Full-screen overlay with stepped messages:
  - “Analyzing your goal…”
  - “Identifying bottleneck…”
  - “Building your route…”
- [ ] Subtle motion (pulse or progress), matches brand colors
- [ ] On success: redirect to dashboard; on error: recoverable message + retry

### Must Have — Dashboard layout (`/dashboard/[planId]`)
- [x] **Full viewport** Goal Tree (remaining width after sidebar); `h-screen` shell, no card grid
- [x] **DashboardSidebar**: Home, Strategy (active), Opportunity — navigation only (72px icon rail mobile, ~220px labeled desktop)
- [x] **Three.js Goal Tree** with Obsidian-style glow orbs (solid core + additive halo sprite) and curved edges
- [x] **Progressive disclosure**: default view shows goal + pillars only; click a pillar to reveal its actions, dim others, and zoom the camera toward it; click goal / empty / `Esc` to reset
- [x] **Navigation**: drag empty space to pan, scroll wheel to zoom (clamped); per-node idle bob
- [x] Raycast hover: scale **1.35×**, cursor pointer, `NodePopover` (suppressed when a sticky selection is active)
- [x] Bottleneck node: pulsing glow opacity
- [x] **Strategy HUD overlays** layered on canvas:
  - Top-left: route status pill + current stage
  - Top-right: bottleneck callout (`CornerBrackets`) with `FOCUS THE GRAPH` button
  - Bottom-left: alignment score inside `Reticle` with count-up `NumberDial`
  - Bottom-right: link to `/opportunity/[planId]`
- [x] **SelectionCard** (bottom-center): pillar/action detail with reason or recommendation; pillar selection shows actions list with drill-in; action selection shows breadcrumb back to its pillar; close button + `Esc`
- [x] `prefers-reduced-motion`: lerps snap, count-up renders final value, no bob
- [x] Dashboard understandable in **10 seconds** (route status + alignment + bottleneck + visible pillars)
- [x] Does **not** feel like a generic admin template or chat UI

**Deferred on dashboard route (components kept):** bento cards (cut list, next 7 days, risks, semester priorities) — accessible via plan data and future detail surfaces.

### Must Have — Dashboard data & states
- [ ] Initial load: skeleton placeholders on cards; graph area shows branded loading state until `GoalTree` mounts
- [ ] Cards: staggered fade-in, **40ms** stagger, **300ms** `ease-out` (Framer Motion)
- [ ] Card hover: `translateY(-2px)`, **150ms**
- [ ] Empty/error if plan missing: clear copy + link to onboarding or demo
- [ ] Works against `lib/fixture.ts` before graph branch merges (placeholder or static preview in tree slot)

### Must Have — Cut list UI
- [ ] Grouped or labeled by recommendation type
- [ ] Every row shows **activity + reason**; reason ties to goal/bottleneck tone (display only; content from AI)
- [ ] Color coding per `cutRecommendationColor`

### Must Have — Next 7 days UI
- [ ] Numbered or ordered list; priority chip (High/Medium/Low)
- [ ] Copy feels actionable (rendered as-is from plan)

### Must Have — Opportunity check (`/opportunity/[planId]`)
- [ ] Freeform textarea + submit
- [ ] Loading: gauge animates to 0 then fills to score (**800ms**)
- [ ] Result: fit score (0–100), recommendation badge (Say Yes / Say No / Defer / Say Yes With Conditions)
- [ ] Sections: reasoning, why it fits, tradeoffs, conditions, cuts required
- [ ] Tone: opinionated presentation (bold recommendation, not hedged layout)
- [ ] Back to dashboard link

### Must Have — Motion & accessibility baseline
- [ ] Framer Motion for all non-canvas UI animation
- [ ] `prefers-reduced-motion`: disable or shorten counters and stagger
- [ ] Focus visible on interactive elements; semantic headings on each page

### Nice to Have
- [ ] Landing: subtle animated background (CSS only, performant)
- [ ] Onboarding: step transition slide/fade between steps
- [ ] Dashboard: bottleneck card subtle pulse on first visit (CSS, not competing with graph)
- [ ] Opportunity: print-friendly result summary
- [ ] Keyboard shortcut to submit opportunity form (Cmd+Enter)

## Out of Scope
- Three.js scene, nodes, edges, camera drift, hover lift (Goal Tree feature)
- Claude prompts, API routes, Zod validation (AI pipeline feature)
- Auth, user accounts, settings page
- Mobile-specific layouts beyond basic responsiveness
- Calendar, course registration, social features
- Building a component library beyond what Pathwise needs (no Storybook requirement)
- Light mode theme

## UX Notes

### Philosophy (from global PRD)
- Dashboard-first, not chatbot-first
- Opinionated, not vague
- Visual, not text-heavy
- **The graph is the product**—UI defers to it
- Premium and restrained, not loud

### Page-by-page layout

**Landing**
- Full viewport dark (`--bg-base`)
- Centered hero; CTAs stacked on mobile, inline on desktop
- Optional faint grid or radial glow behind hero (opacity &lt; 15%)

**Onboarding**
- Narrow centered column (max ~560px)
- Step title + short helper line
- Progress: dots or segmented bar using `--accent`
- Brain dump step: minimum 6 rows textarea, character count optional

**Dashboard**
```
┌─────────────────────────────────────────────────────────────┐
│  Destination · Stage · Bottleneck summary    [Route]  [64%] │
├──────────────────────────────┬──────────────────────────────┤
│                              │  Bottleneck (detail)         │
│      GOAL TREE (~60%)        │  Semester priorities         │
│                              │  Cut list                    │
│                              │  Next 7 days                 │
│                              │  Risks                       │
└──────────────────────────────┴──────────────────────────────┘
```
- On viewports &lt; 1024px: graph full width on top, cards stack below (graph still visually first)

**Opportunity**
- Single column, max ~720px
- Input card → result card with gauge as visual anchor at top

### Copy tone
Sound like a sharp advisor.

- Avoid: “You might want to consider exploring…”
- Prefer: “Your bottleneck is no shipped project. Everything else is noise until that changes.”

Static UI chrome (labels, empty states) follows this tone; plan content comes from AI.

### Edge cases
| Case | Behavior |
|------|----------|
| Invalid `planId` | 404-style in-app message; link to demo + onboarding |
| Generate API fails | Error on loading screen; preserve form data in sessionStorage if possible |
| Slow network on dashboard | Skeletons until data resolves |
| Graph branch not merged | `GoalTreePlaceholder` in tree slot: dark panel + “Building your route map…” + fixture summary teaser |
| Demo plan | No generation loading; instant dashboard |

## Success Criteria
This feature is complete when:
- [ ] Landing → demo dashboard works with fixture/demo `planId` with no console errors
- [ ] Onboarding UI submits to `/api/generate` (integration with AI pipeline)
- [ ] Dashboard shows all plan fields with correct hierarchy and motion
- [ ] Alignment score animates; route badge and status colors match spec
- [ ] Cut list and next 7 days match demo scenario presentation quality
- [ ] Opportunity page renders full result with gauge animation
- [ ] Loading, empty, and error states exist for every async surface
- [ ] Judges understand the product in **under 60 seconds** from UI alone
- [ ] UI does not resemble a chatbot or generic Tailwind dashboard template
- [ ] `npm run typecheck`, `lint`, and `build` pass

## Alignment with Global PRD
| Global feature | This feature delivers |
|----------------|----------------------|
| Onboarding | Full form UI + progress + brain dump |
| Strategy Dashboard | Layout, header, all cards, loading |
| Goal Tree | Slot, integration props, placeholder until graph merges |
| Cut List / Next 7 Days | Card components on dashboard |
| Opportunity Check | Full page UI |
| Design Direction | Tokens, typography, motion, tone |
