# Feature Tech Spec: UI Restructure and Strategy Brief

## Status
In Progress

## Related Docs
- Global PRD: `docs/architecture/PRD.md`
- Global Architecture: `docs/architecture/ARCHITECTURE.md`
- Feature PRD: `docs/features/014-ui-restructure-and-strategy-brief/PRD.md`

## Technical Summary
A focused UI pass across five pages plus a new Strategy Brief side panel on the Strategy Web. The brief is a pure client-side overlay derived from the existing `StrategyPlan` available via `PlanProvider` — no new API, no new tables, no schema changes. Each other page change is a small visual/structural edit to existing components.

## Files Expected to Change

Home / branding
- `app/page.tsx` — tagline, descriptions, label rename, remove "Open" pill.

Flowgram (StraighterNoodles `/1`)
- `components/1/import/ICSImportButton.tsx` — render trigger as a stand-alone button with a portal-style modal (already partially there; remove inline padding/border that makes it feel embedded; ensure it overlays over the whole header row).
- `components/1/timeline/TimelineConnector.tsx` — darker text for the gap duration.
- `components/1/timeline/TimelineEvent.tsx` — darker outline on the "mark complete" circular toggle when unchecked.
- `components/1/reschedule/EndOfDayReschedule.tsx` — make the Reschedule modal cover the full viewport with backdrop blur (no unblurred area at the top of the page).
- `components/1/checklist/ChecklistItem.tsx` — update tag color tokens: one-time → purple, weather → yellow. Keep manual/custom distinct.

Week View (`/1/week`)
- `app/1/week/page.tsx` — widen the daily column on desktop (smaller grid, vertical stack on smaller widths) so titles don't need scrolling/rotation. Show location underneath the time on a separate small line.
- (Optional) `components/1/ui/ScrollingText.tsx` — keep but only used when truly overflowing.

Opportunity Validation
- `components/2/opportunity/OpportunityInput.tsx` — remove the "Opportunity check" eyebrow above "Worth saying yes to?".
- `components/2/opportunity/OpportunityResult.tsx` and/or `components/2/opportunity/RecommendationStamp.tsx` — bump verdict size and visual weight so it doesn't blend with section badges/pills.

Assessments (`/2/onboarding`)
- `components/2/onboarding/OnboardingShell.tsx` — switch from top/bottom split to left/right split on desktop. Mobile falls back to stacked.

Strategy Web (`/2/dashboard/...`)
- `components/2/graph/orbital/OrbitalDashboardSidebar.tsx` — add "Strategy Brief" button alongside Today focus and Opportunity checker.
- `components/2/graph/orbital/OrbitalDashboard.tsx` — wire button to open the brief.
- `components/2/dashboard/DashboardLayout.tsx` — host the new brief overlay alongside `TodayOverlay`.
- New: `components/2/dashboard/StrategyBriefPanel.tsx` — drawer/modal with the six sections derived from the current `StrategyPlan` and `OrbitalNodeData`.

Docs
- `docs/features/014-ui-restructure-and-strategy-brief/` (PRD, TECH_SPEC, TASKS, DECISIONS).

## Components

| Component | Purpose |
|---|---|
| `StrategyBriefPanel` | Right-side drawer that explains the current strategy plan. Reads from `usePlan()` (no props beyond `open` and `onClose`). |
| `OrbitalDashboardSidebar` | Existing sidebar; gains a "Strategy Brief" button next to existing buttons. |
| `OrbitalDashboard` | Existing dashboard; receives `onBriefClick` and passes it through. |
| `DashboardLayout` | Existing layout; mounts the brief overlay (mirrors `TodayOverlay`). |

## Data Model
No schema changes. The Strategy Brief derives its content from existing types:

```ts
import type { StrategyPlan, StrategicPillar, CutItem, RiskItem } from "@/lib/2/types";

type StrategyBriefData = {
  destination: string;          // plan.destination
  alignmentScore: number;       // plan.alignmentScore
  bottleneck: string;           // plan.mainBottleneck
  bottleneckPillarId?: string;  // weakest pillar in plan.strategicPillars
  priorities: Array<{ pillarId: string; pillarName: string; action: string; color: string }>;
  cutList: CutItem[];           // grouped by recommendation
  risks: RiskItem[];            // capped at 3
};
```

`bottleneckPillarId` is computed by selecting the pillar with status `Missing` or `Weak` (preferring `Missing`).

Priorities mapping: take the first action of each non-Strong pillar, capped at 5. Falls back to the first action of any pillar when there are fewer than 5 weak ones.

Pillar colors reuse `FIGMA_PILLAR_COLORS` from `lib/2/orbitalMap.ts` (network gets `NETWORK_NODE_FILL`).

## API / Server Logic
None. Strategy Brief reads from `usePlan()` and the colors module.

## State Management
- `DashboardLayout` adds `briefOpen` local state and a toggler, mirroring `todayOpen`.
- `StrategyBriefPanel` is a presentational client component that calls `usePlanOptional()` and renders nothing when no plan is loaded.
- Esc closes the panel (same pattern as `TodayOverlay`).

## Validation
- Strategy Brief: handle missing pillars (don't crash when `strategicPillars` is empty). Show a calm empty state per section.
- Week View: location may be undefined; only render when present.
- Tag color changes must remain accessible (sufficient contrast on the cream background).

## Testing / Verification
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Manual: home → strategy web → brief → opportunity → assessments → flowgram → week view, on desktop viewport.
