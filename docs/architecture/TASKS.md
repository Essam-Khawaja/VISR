# TASKS: Pathwise
## 24-Hour Hackathon Build Plan

---

## Hour 0 — Pre-Build (Everyone, ~60 minutes)

These tasks must be done before anyone branches. Do them together.

- [ ] Initialize Next.js 14 project with TypeScript and Tailwind
- [ ] Install all dependencies from TECH_SPEC.md
- [ ] Create `/lib/types.ts` from DATA_MODEL.md
- [ ] Create `/lib/fixture.ts` from DATA_MODEL.md
- [ ] Create `/styles/tokens.css` with all CSS variables from PRD.md color system
- [ ] Set up Supabase project, run SQL schema from DATA_MODEL.md
- [ ] Create `.env.local` with all environment variables
- [ ] Pre-generate demo scenario and save to Supabase with DEMO_PLAN_ID
- [ ] Create three branches: `feat/graph`, `feat/ai-pipeline`, `feat/dashboard-ui`
- [ ] Each person pulls their branch and confirms fixture JSON imports correctly

**This hour is non-negotiable. Do not skip it.**

---

## Person 1 — Goal Tree (Three.js)
**Branch:** `feat/graph`
**Depends on:** fixture JSON from hour 0

### Phase 1 (Hours 1-4): Graph renders, nodes visible

- [ ] Create `/components/graph/GoalTree.tsx` — canvas component shell
- [ ] Create `/components/graph/useGraphScene.ts` — Three.js scene, camera, renderer, lights setup
- [ ] Parse fixture pillars and actions into node data structure
- [ ] Implement radial layout algorithm:
  - Goal node at center (0, 0, 0)
  - Pillar nodes at radius 3 on a circle, evenly spaced by angle
  - Action nodes at radius 5.5 clustered around their parent pillar angle ±30°
- [ ] Render nodes as `SphereGeometry` with `MeshStandardMaterial`
- [ ] Apply status colors to node materials using `nodeStatusColor` from TECH_SPEC.md
- [ ] Commit: "feat(graph): basic radial layout renders from fixture data"

### Phase 2 (Hours 4-8): Edges, camera, basic animation

- [ ] Create `/components/graph/graphEdges.ts`
- [ ] Implement edges as `TubeGeometry` following `CatmullRomCurve3` paths between nodes
- [ ] Add animated gradient shader to edges (or use `MeshBasicMaterial` with opacity animation as fallback)
- [ ] Add slow scene rotation: `scene.rotation.y += 0.003` in animation loop
- [ ] Add cinematic camera drift on load: camera starts at z=14, eases to z=9 over 3 seconds using lerp
- [ ] Commit: "feat(graph): edges rendered, camera drift animation, scene rotation"

### Phase 3 (Hours 8-12): Bottleneck pulse, hover, glow

- [ ] Identify bottleneck node from `mainBottleneck` prop (match by pillar status "Weak" or "Missing")
- [ ] Implement sin-wave breathing glow on bottleneck node:
  ```javascript
  // In animation loop
  const t = Date.now() / 1000;
  bottleneckMesh.material.emissiveIntensity = 0.3 + 0.3 * Math.sin(t * Math.PI);
  ```
- [ ] Add `PointLight` at bottleneck node position with red color and pulsing intensity
- [ ] Implement raycasting for hover detection
- [ ] On hover: scale node up to 1.3x, pause scene rotation, show popover
- [ ] Create `/components/graph/NodePopover` — positioned HTML element over canvas showing node name, status, recommendation
- [ ] Commit: "feat(graph): bottleneck pulse, hover detection, node popover"

### Phase 4 (Hours 12-16): Polish and integration

- [ ] Add node spawn animation on initial load: nodes scale from 0 to 1 with stagger
- [ ] Add goal node glow halo (large transparent sphere with additive blending)
- [ ] Tune all colors to match design tokens exactly
- [ ] Test with real StrategyPlan data (swap fixture for API response)
- [ ] Wrap component in Framer Motion `motion.div` for fade-in on dashboard load
- [ ] Handle resize: canvas resizes with container using ResizeObserver
- [ ] Commit: "feat(graph): polish complete, ready for merge"

### Fallback (if Three.js is behind at hour 12)
If the 3D version is not polished by hour 12, switch to a custom SVG radial graph:
- Use D3 force simulation for layout
- SVG circles with status fill colors
- Animated SVG paths for edges
- CSS animations for the bottleneck pulse
- Still custom, still impressive, faster to ship

---

## Person 2 — AI Pipeline
**Branch:** `feat/ai-pipeline`
**Depends on:** fixture JSON from hour 0

### Phase 1 (Hours 1-4): Types, validation, Supabase

- [ ] Create `/lib/claude.ts` from API_SPEC.md
- [ ] Create `/lib/prompts.ts` from API_SPEC.md
- [ ] Create `/lib/validation.ts` from TECH_SPEC.md (Zod schemas)
- [ ] Create `/lib/supabase.ts` from TECH_SPEC.md
- [ ] Test Supabase connection: insert and read a test row
- [ ] Test Claude API: call with a simple prompt, confirm response
- [ ] Commit: "feat(pipeline): lib setup, Claude and Supabase connections verified"

### Phase 2 (Hours 4-8): Generate endpoint

- [ ] Create `/app/api/generate/route.ts` from API_SPEC.md
- [ ] Test with a real profile submission via Postman or curl
- [ ] Verify JSON output matches Zod schema
- [ ] Verify data saves to Supabase correctly
- [ ] Log any schema mismatches and fix prompt if needed
- [ ] Commit: "feat(pipeline): /api/generate working end-to-end"

### Phase 3 (Hours 8-12): Opportunity check endpoint

- [ ] Create `/app/api/opportunity/route.ts` from API_SPEC.md
- [ ] Test with demo plan ID and a sample opportunity string
- [ ] Verify Zod validation passes
- [ ] Verify save to opportunity_checks table
- [ ] Commit: "feat(pipeline): /api/opportunity working end-to-end"

### Phase 4 (Hours 12-16): Onboarding form submission + integration

- [ ] Create `/app/onboarding/page.tsx` — multi-step form
- [ ] Create step components: `StepDestination`, `StepAcademic`, `StepCommitments`, `StepBrainDump`
- [ ] Wire form submit to `POST /api/generate`
- [ ] On success: redirect to `/dashboard/[planId]`
- [ ] Add loading state during generation with step-by-step progress messages:
  - "Analyzing your goal..."
  - "Mapping your strategic pillars..."
  - "Identifying your bottleneck..."
  - "Building your route..."
- [ ] Commit: "feat(pipeline): onboarding form submission, loading state, redirect"

---

## Person 3 — Dashboard UI
**Branch:** `feat/dashboard-ui`
**Depends on:** fixture JSON from hour 0

### Phase 1 (Hours 1-4): Design system + layout shell

- [ ] Apply `/styles/tokens.css` CSS variables to `globals.css`
- [ ] Configure Tailwind to use CSS variable tokens
- [ ] Install and configure Clash Display or Cal Sans font (or fallback to Space Grotesk)
- [ ] Create base UI components:
  - `/components/ui/Card.tsx` — `bg-surface`, `border`, `rounded-xl`, `p-6`
  - `/components/ui/Badge.tsx` — status-colored pill with `routeStatusColor` mapping
- [ ] Create `/app/dashboard/[planId]/page.tsx` shell with grid layout
- [ ] Layout: graph takes left 60%, cards stack on right 40%
- [ ] Bottom row: Cut List, Next 7 Days, Risks in thirds
- [ ] Populate with fixture data hardcoded — no props yet
- [ ] Commit: "feat(ui): design system, layout shell, hardcoded fixture data"

### Phase 2 (Hours 4-8): Strategy header + key cards

- [ ] Create `/components/dashboard/StrategyHeader.tsx`:
  - Destination in display font, large
  - Current stage as label
  - Route status as colored badge
  - Bottleneck in a callout line — `text-danger font-semibold`
- [ ] Create `/components/dashboard/AlignmentScore.tsx`:
  - Score displayed at `text-[120px]` in Clash Display
  - Framer Motion counter from 0 to score value over 1200ms on mount
  - Label "Alignment Score" in `text-secondary text-xs tracking-widest uppercase`
- [ ] Create `/components/dashboard/BottleneckCard.tsx`:
  - Red left border accent
  - Title "Your Bottleneck" in warning style
  - Main bottleneck text prominent
- [ ] Wire all components to accept real props (matching TypeScript types)
- [ ] Commit: "feat(ui): strategy header, alignment score, bottleneck card"

### Phase 3 (Hours 8-12): Cut list, next 7 days, risks, opportunity check UI

- [ ] Create `/components/dashboard/CutList.tsx`:
  - Group items by recommendation (Cut, Defer, Keep, Double Down)
  - Color-coded left border per recommendation type
  - Item reason in `text-secondary text-sm`
  - "Cut" items have subtle text-muted strikethrough animation on mount
- [ ] Create `/components/dashboard/NextSevenDays.tsx`:
  - Numbered list (01, 02, 03...)
  - Number in accent color
  - Priority badge on each item
  - Staggered fade-in animation
- [ ] Create `/components/dashboard/RiskCards.tsx`:
  - Severity badge (High = danger, Medium = warning, Low = muted)
  - Compact horizontal card layout
- [ ] Create `/app/opportunity/[planId]/page.tsx`:
  - Freeform textarea for opportunity input
  - Submit button calls `/api/opportunity`
  - Loading state with circular gauge animating to 0
- [ ] Create `/components/opportunity/FitScoreGauge.tsx`:
  - SVG circular progress gauge
  - Fills from 0 to fitScore on render over 800ms
  - Score number centered, large
  - Color transitions with score (green > 70, amber 40-70, red < 40)
- [ ] Create `/components/opportunity/OpportunityResult.tsx`:
  - Recommendation badge prominent at top
  - Why it fits as bullet list
  - Tradeoffs section
  - Conditions section (if applicable)
  - What to cut section
- [ ] Commit: "feat(ui): cut list, next 7 days, risks, opportunity check UI"

### Phase 4 (Hours 12-16): Animation pass + integration

- [ ] Wrap all dashboard cards in `motion.div` with staggered `initial/animate` fade-in
- [ ] Add `GoalTree` component placeholder div (50% height, full width) — Person 1 will replace with real component
- [ ] Wire all components to accept props from real fetched data
- [ ] Create `/app/dashboard/[planId]/page.tsx` server component that fetches from Supabase
- [ ] Test with real planId from API (use demo plan ID first)
- [ ] Landing page `/app/page.tsx`:
  - Hero: "You say the what. We tell the how."
  - Brief problem statement (3 sentences max)
  - "Build My Route" CTA button → `/onboarding`
  - Dark, minimal, the graph visualization as background element
- [ ] Commit: "feat(ui): animation pass, server-side data, landing page"

---

## Integration Phase (Hours 16-20, All Three)

- [ ] Merge `feat/ai-pipeline` to main first
- [ ] Merge `feat/dashboard-ui` to main
- [ ] Merge `feat/graph` to main — replace placeholder div with real GoalTree
- [ ] End-to-end test: onboarding → generate → dashboard → opportunity check
- [ ] Test with demo plan ID directly: `/dashboard/demo-cs-student-001`
- [ ] Fix any prop mismatches or data shape issues
- [ ] Confirm all Framer Motion animations trigger correctly
- [ ] Confirm GoalTree renders and animates with real pillar data
- [ ] Commit: "feat: full integration complete"

---

## Polish Phase (Hours 20-23)

- [ ] Typography pass: check all font sizes, weights, spacing
- [ ] Color pass: check all status colors render correctly
- [ ] Mobile sanity check (not a target but shouldn't be broken)
- [ ] Error states: what happens if API fails?
- [ ] Console errors: clear all warnings
- [ ] Test the exact demo flow 3 times end-to-end
- [ ] Freeze code — no new features after hour 22

---

## Demo Prep (Hour 23-24)

- [ ] Confirm demo plan ID loads instantly
- [ ] Confirm opportunity check works live ("Should I join the robotics club?")
- [ ] Confirm the demo URL is bookmarked and works
- [ ] Write the 60-second verbal pitch:
  1. "Last semester I was doing X, Y, Z simultaneously and had no idea what to cut." (10 seconds)
  2. Show dashboard loading. "This is Pathwise. Within 10 seconds you know your bottleneck." (15 seconds)
  3. Point to Goal Tree. "This is a model of your strategic situation, not a to-do list." (10 seconds)
  4. Show cut list. "It tells you what to stop doing." (5 seconds)
  5. Open opportunity check, type "Should I join the robotics club?" live. (20 seconds)
- [ ] Practice the pitch twice

---

## Hard Rules

1. No new features after hour 22. Polish only.
2. The demo scenario is never generated live during judging. It is pre-cached.
3. If Person 1's Three.js graph is not ready by hour 16, ship the SVG fallback. A polished 2D graph beats an unfinished 3D one.
4. The opportunity check must work live during the demo. This is the only live AI call.
5. If anything breaks during integration, revert to the last working commit and fix forward. Never debug in main.
