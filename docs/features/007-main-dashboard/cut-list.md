# Dashboard Component: Cut List

## Parent feature
[007-main-dashboard](PRD.md)

## What it does
Shows what the student should **cut, defer, keep, or double down on** — each item with a reason tied to their goal and current bottleneck. Prevents the roadmap and weekly tasks from competing with a overloaded schedule.

## Categories

| Category | Meaning |
|----------|---------|
| **Cut** | Stop — actively hurts focus or goal progress |
| **Defer** | Valid later — not now |
| **Keep** | Maintain current effort |
| **Double down** | Invest more — high leverage |

## UI
**Card (side column, below bottleneck):**
- Grouped sections or tabs by category
- Each row: `activity` + `reason` (1–2 lines)
- Max 6–8 items total for MVP (readability)

## Data model

```ts
type CutRecommendation = "Cut" | "Defer" | "Keep" | "Double Down";

type CutListItem = {
  id: string;
  activity: string;
  recommendation: CutRecommendation;
  reason: string; // must reference goal and/or bottleneck
};

type CutListSnapshot = {
  items: CutListItem[];
  generatedAt: string;
};
```

Aligns with global `CutItem` in `docs/architecture/DATA_MODEL.md`.

## Inputs
- `UserProfile.commitments` (clubs, jobs, projects from onboarding)
- `Roadmap` nodes marked low priority (006)
- Current `BottleneckSnapshot`
- Skipped weekly tasks (004/005)

## Generation rules (MVP)
| Signal | Typical recommendation |
|--------|------------------------|
| Commitment unrelated to goal tags | Defer or Cut |
| Commitment duplicates roadmap node already in progress | Keep |
| Node pathway with 3+ completions | Double down |
| Activity consuming time + bottleneck unrelated | Cut |
| Low priority roadmap branch + no engagement | Defer |

## Example items
- **Cut:** "Second side project" — *Competes with shipped portfolio piece; your bottleneck is no public project.*
- **Defer:** "Robotics club" — *Relevant but not until Q3; focus internship prep first.*
- **Double down:** "Health tech club" — *Aligns with health tech goal; feeds milestone node X.*

## Acceptance criteria
- [ ] At least one item per category in demo data (or empty category hidden)
- [ ] Every `reason` references goal or bottleneck by name
- [ ] List updates when bottleneck changes (regenerate on adaptation run)
- [ ] Not generic advice ("manage time better")
