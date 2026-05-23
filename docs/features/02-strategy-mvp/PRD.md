# Feature PRD: Strategy MVP

## Status
In Progress

## Summary
Turn Pathwise from a beautiful demo into a daily-driver personal strategy tool. Three things land together:

1. **A real plan, not a fixture.** Onboarding actually generates a `StrategyPlan` for the user (AI-backed, with a deterministic fallback so the app works without API keys). The plan persists locally so it survives a reload.
2. **Living strategy.** Actions can be marked done, the graph reflects state, the opportunity check feeds back into the plan, and a `Today` focus mode tells the user the one thing to do right now.
3. **New visual identity.** Flip the dark / HUD-glow aesthetic to a **light, mostly-white, grayscale-with-hints-of-color, soft-rounded** language so Pathwise reads as a calm strategist tool instead of a sci-fi console. The graph is still the centerpiece, but it now sits inside the same restrained card UI as the rest of the app.

This is the MVP that makes the hackathon prompt ("solve a personal pain point") honest for me — a scattered student making weekly strategic calls.

## User Problem
Pathwise today is unmistakably a designed product, but it is not a *tool*. If you complete onboarding, you do not get your plan — you get the demo plan. If you reload, you lose state. The most actionable parts of the plan (Cut list, Next 7 days, Risks) are written but never shown. The graph is gorgeous and still. There is no notion of "today."

Strategy means choosing what to do next. The app has to know what you've done, what you've decided, and tell you what to focus on. Without that, it is decoration.

## User Stories

**Onboarding → my own plan**
- As a scattered student, when I submit onboarding, I want a plan that actually addresses *my* goal and my brain dump, so I trust the output enough to follow it.

**Persistence**
- As a daily user, when I come back tomorrow, I want my plan still there with my progress preserved, so the app is a habit not a goldfish.

**Daily focus**
- As an overwhelmed student, I want to see the one thing I should be doing today without thinking, so I can act before I get distracted by the rest of the strategy.

**Action progress**
- As a doer, when I finish an action, I want to mark it done and see the graph reflect it, so the strategy stays current with reality.

**Strategic intelligence surfacing**
- As a user reading my graph, I want the Cut list and Next 7 days items relevant to the pillar I just clicked, so the strategy is on-screen where I'm looking, not buried.

**Opportunity feedback into plan**
- As someone considering a new commitment, when the opportunity check says "yes with conditions," I want those conditions and required cuts to become part of my plan automatically, so the plan stays honest about what I just took on.

**Calm visual tone**
- As a student opening this throughout the week, I want it to feel calm and clean (light, rounded, restrained), not loud and console-like, so I actually want to open it.

## Main User Flows

### Flow A — Real onboarding
1. Landing → **Get my strategy**
2. Onboarding (4 steps, ~3 min) → submit
3. `POST /api/generate` returns a real `StrategyPlan` based on the user's input (AI when available, otherwise a deterministic generator that personalizes the fixture template with the user's `targetGoal`, `degree`, year, commitments, and brain dump).
4. Plan is saved to `localStorage` under a stable `planId`.
5. Redirect to `/dashboard/[planId]`.
6. Reload preserves the same plan.

### Flow B — Daily use
1. Open `/dashboard/[planId]` → light, restrained dashboard with sidebar + graph + HUD.
2. Press `T` → Today focus overlay shows top 3 items from Next 7 days with checkboxes.
3. Check one off → action persisted, Today list updates.
4. Press `T` again or `Esc` to return to graph.
5. Click a pillar → SelectionCard shows actions (each with checkbox), and any Cut list / Risk items tied to that pillar appear in a "What this means this week" section.
6. Mark action complete → graph node fades to muted with a small check mark; pillar status auto-recomputes (all actions done → `Strong`; majority done → `Okay`); HUD bottleneck callout may switch.

### Flow C — Opportunity feeds the plan
1. Sidebar → Opportunity check.
2. Submit freeform commitment text.
3. `POST /api/opportunity` returns `OpportunityCheck` scored against the active plan (read from local store).
4. Result page shows fit score + recommendation + sections, with a new **"Apply to my plan"** button.
5. On apply: `cutsRequired` items append to plan `cutList`, `conditions` append to a new `commitments[]` field, recommendation goes into plan `journal[]`. Banner: "Applied. Open your dashboard to see the updated route."

### Flow D — Demo path (judges)
1. Landing → **View demo strategy**
2. `/dashboard/demo-cs-student-001` always returns the fixture plan (Read-only badge in HUD: "Demo plan — start your own").
3. All interactivity (hover, click, Today mode) still works against demo data, but completing actions does not persist (demo is non-mutable).
4. Single CTA visible on demo: "Make it mine →" → `/onboarding`.

## Requirements

### Phase 1 — Light visual system (must)
- [ ] New light token palette in `styles/tokens.css` (white base, grayscale chrome, single accent, soft status tints)
- [ ] Rounded design language: `--radius-sm 8px`, `--radius-md 12px`, `--radius-lg 16px`, `--radius-xl 24px`
- [ ] Soft elevation: `--shadow-sm`, `--shadow-md`, `--shadow-lg` (very subtle, 4–10% black)
- [ ] Tailwind theme extended with new tokens (radii, shadow, soft tints)
- [ ] `globals.css` body bg becomes `--bg-base` (light), text becomes `--text-primary` (near-black)
- [ ] All UI primitives (`Card`, `Button`, `Badge`, `Input`, `Textarea`, `Skeleton`, `NumberDial`) updated for light theme + rounded
- [ ] Sidebar: white surface, subtle right border, active nav item is light blue tint with darker text (no glow bar)
- [ ] Landing: clean white hero, single accent CTA, restrained type
- [ ] Onboarding: white surface, soft borders, big inputs with rounded corners, progress is a thin slate-200 bar with accent fill

### Phase 2 — Graph in light theme (must)
- [ ] Three.js renderer clear color stays transparent over `--bg-base`
- [ ] Node materials use `MeshBasicMaterial` with normal blending, no additive — solid colored discs
- [ ] Edge tubes use a low-opacity gray (`--text-tertiary`), normal blending
- [ ] Bottleneck pulse becomes a subtle radius growth + soft drop-shadow halo (CSS `box-shadow` on a sibling div, *or* a transparent outer sphere with normal blending)
- [ ] Selected pillar still grows + highlights, but via opacity + scale, no glow
- [ ] Hover ring becomes a soft outline halo (sprite with normal blending and warm-gray edge)
- [ ] HUD overlays adopt new tokens: white surfaces, soft shadows, rounded corners; no `CornerBrackets` chrome on light surfaces (replace with `border + rounded`)

### Phase 3 — Real plan + persistence (must)
- [ ] `lib/planStore.ts` — localStorage save/load/update for `StoredPlan` (plan + actionStates + journal[] + commitments[] + opportunityHistory[])
- [ ] `lib/fetchPlan.ts` — when running client-side path or via a small loader, read from `planStore` first; demo planId still returns fixture
- [ ] `POST /api/generate` returns `{ planId, plan }`:
  - With `OPENAI_API_KEY` (or `ANTHROPIC_API_KEY`): real generation with Zod-validated JSON response
  - Without keys: deterministic generator that personalizes the fixture using `targetGoal`, `degree`, `year`, `commitments`, `brainDump`
- [ ] OnboardingForm calls `/api/generate`, saves plan to `planStore`, redirects to `/dashboard/{planId}`
- [ ] Generation loading shows real progress messages (no artificial delay when fallback)
- [ ] Reload-survives: dashboard reads from store on mount and renders

### Phase 4 — Living strategy (must)
- [ ] Action checkbox in SelectionCard: marks done, persists `actionStates[actionId] = "done" | "open" | "skipped"`
- [ ] Graph reflects completion: done action becomes muted color + check glyph; pillar status recomputes
- [ ] Cut list and Next 7 days items relevant to the selected pillar appear in SelectionCard under a "This week" section (filter by pillar via category match — `Skill Signal`, `Recruiting`, etc.)
- [ ] Risk items relevant to the pillar appear in SelectionCard under "Watch out for"
- [ ] If no pillar selected: SelectionCard hidden, but a small **Intelligence Dock** opens via a bottom-edge button — shows full Next 7 days list with checkboxes
- [ ] `POST /api/opportunity` real (or deterministic): returns `OpportunityCheck` scored against the active stored plan
- [ ] OpportunityResult: "Apply to my plan" button appends cuts + conditions + result into plan; toast confirmation; updates `planStore`

### Phase 5 — Today mode (must)
- [ ] Global `T` keyboard shortcut on dashboard opens Today overlay (semi-transparent backdrop, white centered card)
- [ ] Today card shows: top 3 high-priority Next 7 days items, each with checkbox; current date label; "Open full plan" link to close
- [ ] `Esc` closes; `T` toggles
- [ ] On mobile: a "Today" button in the sidebar opens the same overlay
- [ ] Shortcut hint visible somewhere subtle ("Press T for today")

### Nice to Have
- [ ] Journal entry input (sidebar bottom: tiny "+ add update" textarea) — stores to `journal[]`, no AI regen yet
- [ ] Stale-bottleneck pulse if `mainBottleneck` unchanged for 7+ days
- [ ] Export plain-text plan summary (clipboard) from HUD button
- [ ] "Make it mine" floating banner on demo plan
- [ ] Sidebar shows mini count of completed actions ("3/12 done this week")

## Out of Scope
- Auth / multi-user accounts
- Supabase or any remote database
- iCal/Google Calendar integration
- AI regeneration when journal updates (one-shot generation only)
- Light/dark mode toggle (the app commits to light)
- Mobile-first layouts beyond basic responsiveness
- Streaming AI responses (single JSON response is fine for hackathon)

## UX Notes

### Visual direction (light + grayscale + hints of color + rounded)

**Inspiration synthesis:** The clean, breathable card layouts and rounded surfaces from modern SaaS dashboards (FluxCRM, Tolab Edu), but with a more restrained editorial type voice. Not a finance-y stat-grid; not a wellness app. Think *Linear* but warmer — flat white surfaces, soft separators, one accent color used sparingly, status colors only on pills and dots.

**Token palette (canonical):**

```css
--bg-base: #f7f8fa;       /* page background, very light gray */
--bg-surface: #ffffff;    /* cards, sidebar, overlays */
--bg-elevated: #f1f3f6;   /* hover / pressed surfaces */
--border: #e5e7eb;        /* default 1px hairline */
--border-strong: #d1d5db; /* focus / hover */

--text-primary: #0f172a;   /* near-black, slate-900 */
--text-secondary: #475569; /* slate-600 */
--text-tertiary: #94a3b8;  /* slate-400 (helper / placeholder) */

--accent: #2563eb;         /* slate blue, single brand accent */
--accent-soft: #dbeafe;    /* light blue tint background */
--accent-glow: #2563eb22;  /* very low alpha for soft glow */

--success: #059669;
--success-soft: #d1fae5;
--warning: #d97706;
--warning-soft: #fef3c7;
--danger: #dc2626;
--danger-soft: #fee2e2;
--muted: #cbd5e1;          /* slate-300 (cut / dimmed) */

--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;

--shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04);
--shadow-md: 0 4px 12px rgba(15, 23, 42, 0.06);
--shadow-lg: 0 12px 32px rgba(15, 23, 42, 0.08);
```

**Type rules:**
- Body / UI: Inter, regular and medium. Stops competing with display.
- Display (hero numbers, alignment score, pillar names): Clash Display / Cal Sans fallback.
- Eyebrows / labels: 10–11px, uppercase, tracking-[0.12em] (less spaced than before), `text-tertiary`.
- No more all-caps for body copy.

**Surfaces:**
- Cards: `bg-surface`, `border border-border`, `rounded-2xl` (16px), `shadow-sm`. Hover: `shadow-md` + `border-strong`.
- Inputs: `rounded-xl`, taller (h-12), generous left/right padding, no underlines.
- Buttons: `rounded-full` for primary (pill), `rounded-xl` for secondary. Primary = accent fill + white text; Secondary = white fill + `border-strong`; Ghost = transparent + `text-secondary`.
- Status pills: 1.5x1.5 dot + status text, status color, on `*-soft` background, `rounded-full`.
- Removed: CornerBrackets, Reticle, Grain, ScanLine (or kept only on demo splash). They are part of the dark-HUD identity; light theme is calmer.

**Layout:**
- Dashboard: still sidebar + graph + HUD. Sidebar = white with right hairline. HUD overlays sit inside soft white cards with `shadow-md`. SelectionCard = bottom-center, white, `rounded-2xl`, generous padding.
- Landing: centered hero, ~720px content width, single accent CTA, no signature chrome.
- Onboarding: max 560px, white surface card with `rounded-2xl`, progress = slim bar at top.
- Opportunity: max 760px, white cards stacked, gauge top-aligned with result.

**Graph aesthetic:**
- Background: `--bg-base` showing through the canvas.
- Nodes: solid colored disc (status color for actions, accent for goal, slate-700 for pillars).
- Edges: 1.5–2px slate-300 curves, slightly thicker for goal→pillar.
- Hover: faint outer ring (drop-shadow style via an extra transparent sphere with normal blending, color `--accent-glow`).
- Bottleneck: gentle scale pulse (no flashing red) + a small "BOTTLENECK" pill label below the node.
- Labels: dark text on light bg, with a 6px tinted shadow for legibility against canvas.

### State details

| State | Visual |
|---|---|
| Default dashboard | Sidebar + graph + HUD overlays, nothing selected |
| Hover node | Outer ring + cursor pointer; popover for actions only |
| Selected pillar | Pillar enlarges, others fade to 0.35, actions reveal, camera zooms; SelectionCard with "This week" + "Watch out for" |
| Selected action | Action enlarges, siblings dim to 0.55; SelectionCard with recommendation + checkbox |
| Today mode | Backdrop blur + centered white card with top 3 items |
| Action completed | Node fades to `--muted`, small check glyph inside, edge thins |
| Empty plan (post-onboarding while loading) | Skeleton sidebar + graph loading state + skeleton HUD |
| API error on generate | Error card with "Try again" + "Use demo plan instead" |

### Copy tone (unchanged)
Direct, opinionated, no hedging. The visual mood softens; the voice stays sharp.

## Success Criteria

This feature is complete when:

- [ ] Submitting onboarding produces a plan that reflects the user's `targetGoal` and `brainDump`, not the hard-coded fixture
- [ ] Reloading `/dashboard/[planId]` after onboarding shows the same plan and the same action-completion state
- [ ] Pressing `T` on the dashboard opens a Today overlay with 3 actionable items, and checking one persists
- [ ] Clicking a pillar reveals its Next 7 / Cut / Risk items contextually inside SelectionCard
- [ ] Marking an action done updates the graph (node color + pillar status) and persists across reloads
- [ ] Applying an Opportunity result appends cuts + conditions to the plan and the dashboard reflects them on next visit
- [ ] The entire app reads as a light, restrained, rounded product — no dark surfaces remain
- [ ] `npm run typecheck && npm run lint && npm run build` all pass
- [ ] Demo path (`/dashboard/demo-cs-student-001`) still works and clearly marks itself as demo

## Alignment with Global PRD
| Global feature | This feature delivers |
|---|---|
| Onboarding → strategy generation | Real `/api/generate` with deterministic fallback |
| Strategy dashboard | Light theme + Today + intelligence surfacing + action progress |
| Goal Tree | Rendered in new visual idiom; behavior unchanged |
| Cut List / Next 7 Days | Surfaced contextually in SelectionCard + global dock |
| Opportunity Check | Feeds back into stored plan |
| Persistence | localStorage (Supabase deferred) |
| Design Direction | Tokens, type, motion, tone — all rewritten for light theme |
