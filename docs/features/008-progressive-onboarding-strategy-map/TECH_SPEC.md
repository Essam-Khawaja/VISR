# Feature Tech Spec: Progressive Onboarding Strategy Map

## Status
Complete

## Related Docs
- Global PRD: `docs/architecture/PRD.md`
- Global Tech Spec: `docs/architecture/TECH_SPEC.md`
- Global Architecture: `docs/architecture/ARCHITECTURE.md`
- Feature PRD: [PRD.md](./PRD.md)
- Supersedes onboarding UX in: [001-landing-and-onboarding](../001-landing-and-onboarding/)
- Graph reuse: [005-strategy-map-visualization](../005-strategy-map-visualization/)
- Generation: [002-strategy-generation-ai](../002-strategy-generation-ai/)

## Technical Summary

Onboarding becomes a **split-view client experience**:

1. **Top:** step wizard + fixed inputs + AI insight strip.
2. **Bottom:** `OnboardingStrategyMap` driven by `OnboardingMapState` (not a full `StrategyPlan` until the end).

Each step transition appends nodes/edges to `OnboardingMapState`, triggers a short animation via existing graph infrastructure (`buildGraphLayout` extended or parallel `buildOnboardingLayout`), and fetches step insight copy from a lightweight API.

Final submit still calls `POST /api/generate` with the accumulated `StudentProfile`, saves via `planStore`, and redirects. Optional: pass `onboardingPreview` metadata in the request so Groq can reference what the user already saw.

## Files Expected to Change

### New
- `docs/features/008-progressive-onboarding-strategy-map/*` (this folder)
- `components/onboarding/OnboardingShell.tsx` - split layout wrapper
- `components/onboarding/OnboardingMapPanel.tsx` - bottom graph host
- `components/onboarding/OnboardingInsightStrip.tsx` - AI copy + loading
- `components/onboarding/steps/StepDestination.tsx` (refactor)
- `components/onboarding/steps/StepCourses.tsx` (rename/refactor from StepAcademic)
- `components/onboarding/steps/StepCommitments.tsx` (refactor)
- `components/onboarding/steps/StepConstraints.tsx` (new, split from commitments)
- `components/onboarding/steps/StepBrainDump.tsx` (refactor)
- `components/onboarding/ChipInput.tsx` - tag/chip list input (fixes comma/space bug)
- `components/onboarding/onboardingMapTypes.ts` - builder state types
- `components/onboarding/useOnboardingMap.ts` - derive layout + apply step deltas
- `components/graph/buildOnboardingLayout.ts` - radial rings for goal / courses / commitments
- `app/api/onboarding/insight/route.ts` - per-step insight + bottleneck preview

### Modified
- `components/onboarding/OnboardingForm.tsx` - orchestration, map state, per-step insight fetch
- `components/onboarding/OnboardingProgress.tsx` - step labels tied to map phases
- `app/onboarding/page.tsx` - full-height layout, no narrow-only column
- `components/graph/GoalTree.tsx` - `displayMode: "onboarding" | "preview" | "full"`
- `components/graph/useGraphScene.ts` - support onboarding node kinds + read-only interaction
- `components/graph/graphTypes.ts` - `OnboardingNodeKind` if needed
- `lib/validate.ts` - `OnboardingInsightRequestSchema`
- `lib/deterministicOnboardingInsight.ts` - fallback copy

### Deprecated / shrink
- `components/onboarding/GenerationLoading.tsx` - may become overlay on map (morph animation) instead of full-page replace

## Components

| Component | Purpose |
|---|---|
| `OnboardingShell` | `flex flex-col h-[100dvh]`; top form scroll, bottom map `min-h-[40vh]` |
| `OnboardingMapPanel` | Hosts dynamic `GoalTree` with `onboardingMap` prop |
| `OnboardingInsightStrip` | Shows `insight` string, skeleton while loading |
| `ChipInput` | Controlled `string[]`; add on Enter/comma; chips removable; **no per-keystroke split** |
| `OnboardingForm` | Step index, profile draft, `onboardingMap`, calls insight API on continue |
| `buildOnboardingLayout` | Maps `OnboardingMapState` → `LayoutNode[]` + `LayoutEdge[]` |

## Data Model

### OnboardingMapState (client-only until generate)

```ts
export type OnboardingNodeKind =
  | "goal"
  | "course"
  | "commitment"
  | "concern"; // optional, brain dump step

export type OnboardingGraphNode = {
  id: string;
  kind: OnboardingNodeKind;
  label: string;
  ring: 0 | 1 | 2; // 0=center, 1=courses, 2=commitments
};

export type OnboardingMapState = {
  goal: { label: string } | null;
  courses: { id: string; label: string }[];
  commitments: { id: string; label: string }[];
  concerns: { id: string; label: string }[]; // optional
  bottleneckPreview: string | null;
  insights: Partial<Record<OnboardingStepId, string>>;
};

export type OnboardingStepId =
  | "destination"
  | "courses"
  | "commitments"
  | "constraints"
  | "brain-dump";
```

### Layout geometry (onboarding rings)

```text
Ring 0  radius 0     - goal (1 node)
Ring 1  radius R1    - courses (evenly spaced angles)
Ring 2  radius R2    - commitments (evenly spaced angles, offset angle)
Ring 3  (post-generate only) - standard pillar layout from StrategyPlan
```

Reuse constants pattern from `graphLayout.ts` (`PILLAR_RADIUS`, etc.) with onboarding-specific radii:

```ts
const ONBOARDING_GOAL_RADIUS = 0.5;
const ONBOARDING_COURSE_RADIUS = 2.8;
const ONBOARDING_COMMITMENT_RADIUS = 4.2;
```

### Session draft (existing + extended)

```ts
// sessionStorage key: pathwise-onboarding-draft-v2
{
  profile: OnboardingFormData;
  map: OnboardingMapState;
  step: number;
}
```

## API / Server Logic

### `POST /api/onboarding/insight`

**Request**
```ts
type OnboardingInsightRequest = {
  step: OnboardingStepId;
  profile: Partial<OnboardingFormData>; // cumulative fields so far
  map: OnboardingMapState; // optional, for context
};
```

**Response**
```ts
type OnboardingInsightResponse =
  | {
      ok: true;
      insight: string;
      bottleneckPreview?: string; // only for brain-dump step
      concernLabels?: string[]; // optional satellite nodes
    }
  | { ok: false; error: string };
```

**Logic**
1. Validate with Zod.
2. If `GROQ_API_KEY`: short prompt (max 120 tokens) - advisor tone, reference `targetGoal` and counts of courses/commitments.
3. Else: `buildDeterministicOnboardingInsight(step, profile)`.
4. Brain dump: run keyword scan (reuse `detectBottleneck` patterns from `deterministicPlan.ts`) for `bottleneckPreview`.

### `POST /api/generate` (existing)

No schema break required. Optional additive field:

```ts
{ profile: OnboardingFormData; onboardingPreview?: OnboardingMapState }
```

Groq may use preview for consistency; deterministic generator already uses profile text.

## State Management

| State | Where | Notes |
|---|---|---|
| `step` | `OnboardingForm` | 0..4 |
| `profile` | `OnboardingForm` | `OnboardingFormData` |
| `map` | `OnboardingForm` | Updated on each Continue |
| `insight` | per step | Fetched async; show skeleton |
| `insightLoading` | per step | Disable Continue while loading (optional) |
| `submitting` | submit | Overlay on map + morph messages |

### Step transition sequence

```text
User clicks Continue
  → validate step
  → applyMapDelta(step, profile)     // sync, immediate graph update
  → fetchInsight(step, profile, map) // async
  → setStep(step + 1)
  → persist sessionStorage draft
```

### Input fix (ChipInput)

**Root cause (current bug):** `StepAcademic` and `StepCommitments` use:

```ts
value={items.join(", ")}
onChange={(e) => onChange({ items: toList(e.target.value) })}
```

Splitting on every keystroke strips trailing commas and prevents natural typing.

**Fix:** `ChipInput` keeps `draftText: string` separate from `items: string[]`:

```ts
// Add chip on Enter, comma (keydown), or blur
// items displayed as chips below input
// course names preserve internal spaces: "Linear Algebra"
```

## Graph Integration

### `displayMode: "onboarding"`

| Mode | HUD | Selection | Pan/zoom | Labels |
|---|---|---|---|---|
| `onboarding` | Hidden | Disabled | Enabled | Goal + course + commitment labels |
| `preview` | Hidden | Disabled | Limited | Dashboard card embed |
| `full` | Shown | Enabled | Enabled | Dashboard |

### Morph to full plan (submit success)

Option A (MVP): Hard swap - onboarding layout replaced by `buildGraphLayout(plan)` after redirect.

Option B (nice): 1.5s tween: course/commitment nodes fade; pillar nodes fade in at outer ring - can be post-MVP.

## Validation

### Client (per step)
| Step | Rules |
|---|---|
| destination | `targetGoal` ≥ 3 chars; university, year, degree required |
| courses | ≥ 1 course chip; `workHoursPerWeek` 0–80 |
| commitments | optional; if empty, confirm dialog |
| constraints | optional |
| brain-dump | ≥ 20 chars |

### Server (`/api/onboarding/insight`)
- `step` enum required
- `profile.targetGoal` required when step !== destination

## Testing / Verification

- [ ] Type `Linear Algebra` as one course - chip shows full string with space
- [ ] Type `Algorithms, Databases` with comma - two chips or one chip depending on chip rules (document: comma on blur adds chip)
- [ ] Step 1 → center node only
- [ ] Step 2 → N course nodes
- [ ] Step 3 → M commitment nodes, distinct styling
- [ ] Insight appears within 3s (or fallback instant)
- [ ] Generate → dashboard graph shows pillars
- [ ] `prefers-reduced-motion`: nodes appear without draw animation
- [ ] `npm run typecheck && npm run lint && npm run build`

## Performance

- One insight API call per Continue (max 4 before submit) - acceptable.
- Map layout is O(n) on node count; typical n &lt; 20.
- Do not call insight API on every `oninput` event.

## Security

- Never send `GROQ_API_KEY` to client.
- Sanitize labels for HTML overlays (React text nodes only).
- Max 15 courses, 20 commitments server-side validation.
