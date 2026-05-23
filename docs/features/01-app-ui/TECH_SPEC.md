# Feature Tech Spec: App UI & Design System

## Status
Draft

## Related Docs
- Global PRD: `docs/architecture/PRD.md`
- Global Tech Spec: `docs/architecture/TECH_SPEC.md`
- Global Architecture: `docs/architecture/ARCHITECTURE.md`
- Data Model: `docs/architecture/DATA_MODEL.md`
- Feature PRD: `docs/features/01-app-ui/PRD.md`
- Goal Tree (parallel): implemented in `feat/graph` — this spec defines the integration contract only

## Technical Summary
Implement Pathwise’s visual layer as a Next.js 14 App Router UI on **Tailwind CSS** + **CSS variables** + **Framer Motion**. Server components fetch `StrategyPlan` by `planId` in page files; client components handle forms, animations, and interactive cards. Shared primitives live under `components/ui/`; feature-specific layouts under `components/dashboard/`, `components/onboarding/`, `components/opportunity/`. Status colors are imported from `lib/statusColors.ts` so dashboard and graph stay aligned.

**Branch:** `feat/dashboard-ui` (merge after `feat/ai-pipeline`, before `feat/graph`)

## Files Expected to Change

### Styles
- `styles/tokens.css` — design tokens (may exist from hour-0; extend if needed)
- `styles/globals.css` — base reset, body background, font variables
- `tailwind.config.ts` — map tokens to Tailwind theme extensions

### App routes
- `app/page.tsx` — landing
- `app/onboarding/page.tsx` — onboarding page wrapper
- `app/dashboard/[planId]/page.tsx` — server fetch + dashboard layout
- `app/opportunity/[planId]/page.tsx` — opportunity tool page

### Components — UI primitives (`components/ui/`)
| File | Purpose |
|------|---------|
| `Card.tsx` | Surface card: `--bg-surface`, border `--border`, optional hover lift |
| `Badge.tsx` | Route status, recommendation, priority, severity |
| `Button.tsx` | Primary (accent), secondary (outline), ghost |
| `Input.tsx` | Text inputs for onboarding |
| `Textarea.tsx` | Brain dump, opportunity input |
| `Skeleton.tsx` | Loading placeholders |
| `NodePopover.tsx` | Styled popover shell (graph positions content) |

### Components — Dashboard (`components/dashboard/`)
| File | Purpose |
|------|---------|
| `DashboardLayout.tsx` | Grid: graph region + card column |
| `StrategyHeader.tsx` | Destination, stage, bottleneck, badge, score slot |
| `AlignmentScore.tsx` | 120px animated counter (client) |
| `BottleneckCard.tsx` | Main bottleneck emphasis |
| `SemesterPriorities.tsx` | Priority list |
| `CutList.tsx` | Cut/defer/keep/double-down |
| `NextSevenDays.tsx` | Weekly actions |
| `RiskCards.tsx` | Risk items by severity |
| `GoalTreeSlot.tsx` | Wrapper: dynamic import `GoalTree` or `GoalTreePlaceholder` |
| `GoalTreePlaceholder.tsx` | Pre-graph fallback using fixture teaser |

### Components — Onboarding (`components/onboarding/`)
| File | Purpose |
|------|---------|
| `OnboardingForm.tsx` | Step state machine, submit handler |
| `OnboardingProgress.tsx` | Step indicator |
| `StepDestination.tsx` | Goal, degree, year, university |
| `StepAcademic.tsx` | Courses, work hours |
| `StepCommitments.tsx` | Commitments, constraints |
| `StepBrainDump.tsx` | Unstructured text |
| `GenerationLoading.tsx` | Full-screen progress overlay |

### Components — Opportunity (`components/opportunity/`)
| File | Purpose |
|------|---------|
| `OpportunityInput.tsx` | Form + submit |
| `FitScoreGauge.tsx` | SVG/canvas circular gauge, 800ms fill |
| `OpportunityResult.tsx` | Full structured result layout |

### Lib
- `lib/statusColors.ts` — per global TECH_SPEC (create if not on branch)
- `lib/types.ts` — consume only; do not duplicate types
- `lib/fixture.ts` — dev/demo data for UI before Supabase wired

## Components — Props & Contracts

### Dashboard page (server)
```typescript
// app/dashboard/[planId]/page.tsx
export default async function DashboardPage({
  params,
}: {
  params: { planId: string };
}) {
  const plan = await fetchStrategyPlan(params.planId);
  if (!plan) notFound();
  return <DashboardLayout plan={plan} planId={params.planId} />;
}
```

### DashboardLayout (client or hybrid)
```typescript
interface DashboardLayoutProps {
  plan: StrategyPlan;
  planId: string;
}
```

### GoalTree integration (boundary with graph feature)
```typescript
// components/dashboard/GoalTreeSlot.tsx
interface GoalTreeSlotProps {
  pillars: StrategicPillar[];
  destination: string;
  mainBottleneck: string;
}

// Dynamic import — ssr: false for Three.js canvas
const GoalTree = dynamic(() => import("@/components/graph/GoalTree"), {
  ssr: false,
  loading: () => <GoalTreePlaceholder variant="loading" />,
});
```

Until `feat/graph` merges, `GoalTreeSlot` renders only `GoalTreePlaceholder`.

### AlignmentScore (client)
```typescript
interface AlignmentScoreProps {
  score: number;
  className?: string;
}
// useMotionValue + animate 0 → score over 1200ms; respect prefers-reduced-motion
```

### CutList
```typescript
interface CutListProps {
  items: CutItem[];
}
// Group visually by recommendation; icon or left border via cutRecommendationColor
```

### FitScoreGauge (client)
```typescript
interface FitScoreGaugeProps {
  score: number;
  recommendation: Recommendation;
}
// Animate stroke-dashoffset 0 → score% over 800ms
```

## Data Model
No new persisted types. UI consumes:

- `StudentProfile` — onboarding form → POST `/api/generate`
- `StrategyPlan` — dashboard
- `OpportunityCheck` — opportunity result

Form state shape for onboarding (client, before submit):

```typescript
type OnboardingFormData = Omit<StudentProfile, "id" | "createdAt">;
```

Optional: persist draft to `sessionStorage` key `pathwise-onboarding-draft` on step change.

## API / Server Logic
This feature **calls** APIs but does not implement them:

| Action | Endpoint | UI responsibility |
|--------|----------|-------------------|
| Generate strategy | `POST /api/generate` | Show `GenerationLoading`, then `router.push(/dashboard/${planId})` |
| Load plan | Server-side Supabase in `page.tsx` | Pass plan to layout |
| Opportunity | `POST /api/opportunity` | Loading on gauge; render `OpportunityResult` |

Fetch helper (shared pattern):

```typescript
// lib/fetchPlan.ts (optional small helper)
export async function fetchStrategyPlan(planId: string): Promise<StrategyPlan | null> {
  // supabase.from("strategy_plans").select().eq("id", planId).single()
}
```

## State Management

| Surface | State |
|---------|--------|
| Onboarding | `useState` step index + form fields; single submit |
| Generation loading | `useState<"idle" \| "loading" \| "error">` + error message |
| Dashboard cards | Server-rendered props; Framer `initial/animate` only |
| AlignmentScore | Local mount animation once |
| Opportunity | `useState` input, result, loading, error |
| planId | URL param; demo uses `process.env.NEXT_PUBLIC_DEMO_PLAN_ID` or `DEMO_PLAN_ID` |

No global store (Redux/Zustand).

## Styling Implementation

### tokens.css (canonical)
Mirror global PRD §6. Example:

```css
:root {
  --bg-base: #080c14;
  --bg-surface: #0d1424;
  --bg-elevated: #111827;
  --border: #1a2640;
  --accent: #4facfe;
  --accent-glow: #4facfe33;
  --danger: #ff4d6d;
  --danger-glow: #ff4d6d33;
  --success: #00f5a0;
  --warning: #ffb547;
  --muted: #3d4f6b;
  --text-primary: #f0f4ff;
  --text-secondary: #6b7fa3;
}
```

### Tailwind extension
```typescript
// tailwind.config.ts — theme.extend.colors
colors: {
  base: "var(--bg-base)",
  surface: "var(--bg-surface)",
  accent: "var(--accent)",
  // ...
}
```

### Fonts
```typescript
// app/layout.tsx
import { Inter } from "next/font/google";
// Display: localFont from /public/fonts/ClashDisplay-Variable.woff2
// Fallback stack: "Cal Sans", system-ui
```

### Motion constants
```typescript
// lib/motion.ts
export const cardStagger = 0.04; // 40ms
export const cardTransition = { duration: 0.3, ease: "easeOut" };
export const cardHover = { y: -2, transition: { duration: 0.15 } };
export const scoreCountDuration = 1.2;
export const gaugeFillDuration = 0.8;
```

## Validation

### Onboarding (client, before API)
| Step | Rules |
|------|--------|
| Destination | `targetGoal`, `university`, `degree`, `year` required |
| Academic | `currentCourses.length >= 1`, `workHoursPerWeek` 0–80 |
| Commitments | `commitments` array allowed empty; `constraints` optional |
| Brain dump | `brainDump` min 20 chars (encourage signal) |

Display errors inline under fields; block Next until valid.

### Opportunity
- `opportunityText` min 10 chars, max 2000
- Disable submit while loading

## Loading / Empty / Error UI

| Operation | Component |
|-----------|-----------|
| Strategy generation | `GenerationLoading` full-screen |
| Dashboard fetch | `Skeleton` in each card; `GoalTreePlaceholder` in tree slot |
| Opportunity check | `FitScoreGauge` at 0 + pulsing label “Evaluating…” |
| Missing plan | Custom not-found panel with CTAs |
| API error | Red border alert on card + retry button |

## Performance
- Dynamic import `GoalTree` with `ssr: false` to avoid SSR/WebGL issues
- Dashboard page: server component fetches plan once
- Framer Motion: `layout` sparingly; prefer `opacity`/`y` only
- Images: none required for MVP; avoid heavy assets on landing

## Integration Checklist (other branches)
- [ ] `feat/ai-pipeline`: `/api/generate` returns `{ planId }`; types stable
- [ ] `feat/graph`: `GoalTree` exports default with `GoalTreeProps` from global TECH_SPEC
- [ ] `main`: `fixture.ts` + `tokens.css` committed at hour 0

## Testing / Verification
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Landing → demo dashboard with `DEMO_PLAN_ID`
- [ ] Onboarding submit → loading → dashboard (staging or mock API)
- [ ] Opportunity flow with demo plan
- [ ] Toggle `prefers-reduced-motion` in OS — animations respect it
- [ ] Visual pass: alignment score ~120px, route badge 11px uppercase, dark surfaces only
