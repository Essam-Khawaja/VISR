# Feature Tech Spec: Strategy MVP

## Status
In Progress

## Related Docs
- Feature PRD: [docs/features/02-strategy-mvp/PRD.md](./PRD.md)
- Feature 1 PRD (UI baseline): [docs/features/01-app-ui/PRD.md](../01-app-ui/PRD.md)
- Global PRD: [docs/architecture/PRD.md](../../architecture/PRD.md)
- Data Model: [lib/types.ts](../../../lib/types.ts)

## Technical Summary

Pathwise becomes a real personal tool in five connected slices, all client-side except for two API routes:

1. **Light visual system.** Token palette in `styles/tokens.css` flips to white-base + grayscale + single accent. Radii + soft shadows added. Tailwind theme extended. Every component touched.
2. **Plan store.** A small `lib/planStore.ts` module reads / writes the active plan + action state + commitments + journal in `localStorage` under stable keys.
3. **API routes.** `app/api/generate/route.ts` and `app/api/opportunity/route.ts` accept the relevant payload, call OpenAI (when keyed) with a strict JSON schema prompt, validate the response with Zod, and return `{ plan }` / `{ check }`. Without a key, a deterministic generator builds a personalized plan / opportunity from the input.
4. **Living strategy.** Action checkbox in `SelectionCard` updates store and the graph reads computed status. Cut list / Next 7 / Risk items are filtered into SelectionCard by pillar `category` matching, and into a global Intelligence Dock when no pillar is selected. Opportunity result has an "Apply to my plan" action.
5. **Today mode.** Keyboard shortcut `T` opens a centered overlay with the top 3 high-priority Next 7 items, each with a checkbox.

The 3D graph and the existing `useGraphScene` hook remain — they just consume light-theme materials and read action state from the planStore-backed context.

## Files Expected to Change

### Styles (Phase 1)
- `styles/tokens.css` — full rewrite to light palette + radii + shadows
- `styles/globals.css` — light body bg, focus ring color, selection color, remove dark-only utilities
- `tailwind.config.ts` — extend colors (soft tints), borderRadius, boxShadow

### UI primitives (Phase 1)
- `components/ui/Card.tsx`
- `components/ui/Button.tsx`
- `components/ui/Badge.tsx`
- `components/ui/Input.tsx`
- `components/ui/Textarea.tsx`
- `components/ui/Skeleton.tsx`
- `components/ui/NumberDial.tsx` (palette only)
- `components/signature/*` — `CornerBrackets`, `Reticle`, `RouteLine` either remove from light surfaces or repaint subtle

### Landing / Onboarding / Opportunity (Phase 1)
- `components/landing/LandingHero.tsx`
- `components/onboarding/OnboardingForm.tsx` + steps + `OnboardingProgress.tsx` + `GenerationLoading.tsx`
- `components/opportunity/OpportunityInput.tsx`, `OpportunityResult.tsx`, `FitScoreGauge.tsx`, `RecommendationStamp.tsx`

### Dashboard shell (Phase 1)
- `components/layout/DashboardSidebar.tsx`
- `components/dashboard/DashboardLayout.tsx`

### Graph (Phase 2)
- `components/graph/glowTexture.ts` — softer gradient, lower max alpha
- `components/graph/graphNodes.ts` — MeshBasicMaterial with normal blending, solid colors
- `components/graph/graphEdges.ts` — gray tube, lower opacity, normal blending
- `components/graph/useGraphScene.ts` — pickup of action completion state, recomputed pillar status colors
- `components/graph/StrategyHUD.tsx` — white card surfaces, no brackets
- `components/graph/SelectionCard.tsx` — adds checkbox + "This week" + "Watch out for" sections
- `components/graph/NodePopover.tsx` — light surface

### Persistence + APIs (Phases 3–4)
- `lib/planStore.ts` (new)
- `lib/fetchPlan.ts` — read localStorage on dashboard hydrate path
- `lib/aiClient.ts` (new, server-only) — small OpenAI wrapper used by both routes
- `lib/deterministicPlan.ts` (new) — fallback generator
- `lib/deterministicOpportunity.ts` (new) — fallback scorer
- `lib/prompts.ts` (new) — prompt templates + JSON schemas
- `lib/validate.ts` (new, Zod schemas)
- `app/api/generate/route.ts` (new)
- `app/api/opportunity/route.ts` (new)
- `components/onboarding/OnboardingForm.tsx` — call the real endpoint, save to store
- `components/opportunity/OpportunityClient.tsx` — call the real endpoint, "Apply to my plan"

### Today mode (Phase 5)
- `components/dashboard/TodayOverlay.tsx` (new)
- `components/graph/GoalTree.tsx` — register `T` shortcut, mount overlay
- `components/layout/DashboardSidebar.tsx` — Today button

### Intelligence Dock (Phase 4)
- `components/dashboard/IntelligenceDock.tsx` (new)
- `components/graph/GoalTree.tsx` — toggle button + mount

## Components

| Component | Purpose |
|---|---|
| `Card` | Rounded white surface (`rounded-2xl`, soft shadow), no corner brackets |
| `Button`, `LinkButton` | Primary (pill, accent fill), secondary (rounded-xl outline), ghost |
| `Badge` | Status pill: dot + label on soft-color background |
| `Input`, `Textarea` | Tall rounded inputs with hairline border |
| `Skeleton` | Light gray block, slow shimmer |
| `NumberDial` | Counts up; light theme colors |
| `LandingHero` | White hero, single accent CTA |
| `OnboardingForm` | Calls `/api/generate` on submit |
| `GenerationLoading` | Light-theme full-screen progress; real messages from API or fallback |
| `DashboardSidebar` | White surface, soft active state, Today shortcut |
| `StrategyHUD` | White surface overlays with shadow |
| `SelectionCard` | Adds action checkbox + contextual cut / next7 / risk sections |
| `IntelligenceDock` | Bottom dock for global Next 7 days view (collapsed by default) |
| `TodayOverlay` | Modal-style centered card on `T` |
| `OpportunityClient` | Calls real endpoint; "Apply to my plan" applies result locally |

## Data Model

Extends but does not break `StrategyPlan` from [lib/types.ts](../../../lib/types.ts).

```ts
// lib/planStore.ts
export type ActionState = "open" | "done" | "skipped";

export type JournalEntry = {
  id: string;
  createdAt: string;
  text: string;
};

export type Commitment = {
  id: string;
  source: "opportunity" | "manual";
  title: string;
  condition?: string;
  createdAt: string;
};

export type StoredPlan = {
  plan: StrategyPlan;
  /** Action completion overlay: actionId -> state */
  actionStates: Record<string, ActionState>;
  /** Cuts the user explicitly applied (from opportunity flow). */
  appliedCuts: string[];
  commitments: Commitment[];
  journal: JournalEntry[];
  opportunityHistory: OpportunityCheck[];
  lastReviewedAt: string;
};
```

Stored under `localStorage["pathwise.plan." + planId]` (string JSON).

A small index `localStorage["pathwise.plans"]` keeps a list of created plan ids (for the "make it mine" CTA on demo and future plan picker).

## API / Server Logic

### `POST /api/generate`

**Request**
```ts
type GenerateRequest = {
  profile: Omit<StudentProfile, "id" | "createdAt">;
};
```

**Response**
```ts
type GenerateResponse =
  | { ok: true; planId: string; plan: StrategyPlan }
  | { ok: false; error: string };
```

**Logic**
1. Validate request with Zod.
2. If `OPENAI_API_KEY` is set: build prompt from `lib/prompts.ts:strategyPrompt(profile)`, call OpenAI Chat Completions with `response_format: { type: "json_object" }`, validate with `StrategyPlanSchema`. On Zod failure, fall through to deterministic generator.
3. Without a key or on failure: `buildDeterministicPlan(profile)` — picks `destination` from `profile.targetGoal`, picks `currentStage`, picks `mainBottleneck` by scanning brain dump for keywords ("no project", "scattered", "leetcode", etc.), assembles 5 strategic pillars from a small template library keyed by goal type (software / med / finance / startup / generic), copies recommendations from templates, fills `cutList` / `nextSevenDays` / `risks`.
4. Generate `planId = "plan-" + crypto.randomUUID()`. Return.

Client then `planStore.save(planId, plan)` and routes to `/dashboard/${planId}`.

### `POST /api/opportunity`

**Request**
```ts
type OpportunityRequest = {
  planId: string;
  plan: StrategyPlan; // sent from client localStorage
  opportunityText: string;
};
```

**Response**
```ts
type OpportunityResponse =
  | { ok: true; check: OpportunityCheck }
  | { ok: false; error: string };
```

**Logic**
1. Validate.
2. If key available: prompt with the user's `mainBottleneck`, current pillars, and the new opportunity text; ask for fit score (0–100), recommendation, why-it-fits / tradeoffs / conditions / cuts-required.
3. Else `buildDeterministicOpportunity(plan, opportunityText)` — keyword classify (research / club / job / project / other), pull tradeoffs and recommended cuts based on `cutList` keywords + `mainBottleneck`. Always returns a `recommendation` (never "I don't know").

The `OpportunityCheck` is returned to the client; client decides whether to "Apply to my plan" (which appends locally).

## State Management

| Surface | State |
|---|---|
| Onboarding | `useState` (existing) + sessionStorage draft (existing). On submit, planStore.save then router.push. |
| Dashboard | Plan loaded server-side for demo; client-side hydrated from `planStore` for user plans. A small `usePlanContext` (or prop drilling) exposes `plan` + `actionStates` + `markAction(id, state)`. |
| SelectionCard | Reads action state from context; checkbox toggles via context method. |
| Today overlay | Local boolean state in `GoalTree`; reads top 3 from `plan.nextSevenDays`. |
| Opportunity | Existing client; on result, exposes "Apply" CTA that calls `planStore.applyOpportunity(planId, check)`. |

## Validation

### `/api/generate`
- `profile.targetGoal` length 3–280
- `profile.year` non-empty
- `profile.brainDump` length 10–4000
- `profile.workHoursPerWeek` 0–80

### `/api/opportunity`
- `opportunityText` length 10–2000
- `plan.id` non-empty (sanity)

Both routes use Zod and return 400 with `{ ok: false, error }` on validation failure.

## Performance
- API routes use Node runtime (`export const runtime = "nodejs"`).
- OpenAI request is non-streaming JSON; <3s typical.
- localStorage reads are synchronous and cheap; debounce 100ms on action toggles via simple setTimeout to avoid thrash from rapid checkboxing.
- Graph stays single-canvas; on action state change, materials are updated in place (no remount).

## Performance budget
- Onboarding submit → dashboard interactive: < 5s when AI path; instant when fallback path.
- Action toggle → graph visible change: < 100ms.
- Today mode open: 1 frame.

## Loading / Empty / Error UI
| Operation | Component |
|---|---|
| `/api/generate` | `GenerationLoading` stays mounted until response or 12s timeout, then error card |
| Generate error | Light error card: "Could not generate. Try again or use the demo plan." |
| `/api/opportunity` | Existing `FitScoreGauge` pulse |
| Plan missing from store | Light card with two CTAs: "Start onboarding" / "Open demo" |

## Performance & accessibility
- All new components keep `prefers-reduced-motion` guards.
- Today overlay is a `role="dialog"` with focus trap.
- Action checkboxes are real `<button role="checkbox" aria-checked>` for keyboard support.

## Testing / Verification
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Manual: onboarding submit produces a plan keyed to inputs; reload preserves
- [ ] Manual: action checkbox persists, graph updates, pillar recomputes
- [ ] Manual: `T` opens Today overlay; check item persists
- [ ] Manual: Opportunity → Apply mutates stored plan
- [ ] Manual: Demo planId still returns fixture and renders correctly
