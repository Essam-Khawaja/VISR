# Dashboard Component: Bottleneck

## Parent feature
[007-main-dashboard](PRD.md)

## What it does
Surfaces the **single biggest constraint** between the student and their goal right now. Not a list of problems — one opinionated bottleneck that weekly tasks and the cut list should serve.

## Examples
- *"No shipped project"*
- *"No internship-relevant experience"*
- *"Missing core skill: system design"*

## UI
**Header (1 line):** `Main bottleneck: {shortLabel}`

**Card (side column):**
- Title: bottleneck label
- Body: 2–3 sentences explaining why this matters for `{primaryGoal}`
- Optional: `linkedNodeId` — ties to graph node for visual emphasis
- CTA: "See this week's tasks" → links to 004

## Data source (MVP)

```ts
type BottleneckSnapshot = {
  label: string;           // short, e.g. "No shipped project"
  explanation: string;   // specific paragraph
  linkedNodeId?: string; // roadmap node to highlight on graph
  detectedAt: string;
};
```

**Generation options (pick one for MVP, see DECISIONS.md):**
1. Rule-based from roadmap: first incomplete `project` or `milestone` node in current year with unsatisfied dependencies
2. Derived from `StrategyPlan.mainBottleneck` if using global strategy generation
3. Hybrid: rules + optional LLM polish on explanation text only

## Inputs
- `UserProfile`, `Roadmap`, task completion rates (005), adaptation priorities (006)

## Rules (MVP heuristic)
| Condition | Bottleneck candidate |
|-----------|---------------------|
| No completed `project` nodes | "No shipped project" |
| Goal category internship + no `milestone` completed | "No career-proof experience" |
| >50% weekly tasks skipped 2 weeks | "Overcommitted — clarity needed" |

## Acceptance criteria
- [ ] Exactly one bottleneck shown (not a ranked list)
- [ ] Explanation mentions student's actual goal text
- [ ] Graph highlights `linkedNodeId` when present
- [ ] Copy is direct, not wellness-tone
