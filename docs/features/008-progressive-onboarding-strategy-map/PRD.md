# Feature PRD: Progressive Onboarding Strategy Map

## Status
Draft

## Summary

Replace the current “fill a form, then wait, then see your plan” onboarding with a **live strategy-map builder**. After each answer, the student sees the map below update: a center goal node appears first, then course nodes orbit it, then commitments (clubs, jobs, projects) form an outer ring. Short AI copy beside each step explains what Pathwise is inferring (“This looks like a skill-signal bottleneck”) while the graph animates in.

Onboarding’s job is no longer only to collect a `StudentProfile` — it is to **assemble the student’s strategic map in front of them** so they trust the output before they reach the dashboard.

## User Problem

Today onboarding feels like paperwork. The strategy map only exists after a long generate step, so the product’s hero moment is delayed. Students also hit broken list inputs (commas and spaces disappear while typing courses or commitments), which makes the flow feel buggy before they see any value.

Students need to *see* their goal, classes, and commitments become a visual route as they type — the same mental model as the dashboard graph, but built step by step.

## User Story

As an overwhelmed student, I want each onboarding answer to immediately show up on my strategy map, so I understand how Pathwise is modeling my life and I feel confident continuing.

As a hackathon judge, I want onboarding to look like the product (graph-first), not a generic multi-step form.

## Relationship to Existing Features

| Feature | Relationship |
|---|---|
| [001-landing-and-onboarding](../001-landing-and-onboarding/) | **Supersedes** the onboarding UX described there; landing page scope unchanged. |
| [005-strategy-map-visualization](../005-strategy-map-visualization/) | Reuses graph visual language; onboarding uses a slimmer “builder” mode. |
| [002-strategy-generation-ai](../002-strategy-generation-ai/) | Final step still produces full `StrategyPlan`; may use incremental Groq calls per step. |
| [004-dashboard-command-center](../004-dashboard-command-center/) | Destination after onboarding; map should feel continuous from builder → dashboard. |

## Main User Flow

### Layout (every step)

```text
┌─────────────────────────────────────────────────────────────┐
│  Pathwise · Step 2 of 5          [progress bar]             │
├─────────────────────────────────────────────────────────────┤
│  PROMPT CARD (top ~40% viewport, scrollable if needed)       │
│  • Question + short helper copy                             │
│  • Input(s) — chips or plain text, fixed for spaces/commas    │
│  • AI insight strip (1–2 sentences from last step response) │
│  • Back | Continue                                          │
├─────────────────────────────────────────────────────────────┤
│  LIVE STRATEGY MAP (bottom ~60%, min-height 320px)          │
│  • Radial graph, same family as dashboard                     │
│  • Animates new nodes/edges when user continues               │
│  • Read-only during onboarding (no pillar drill-down yet)     │
└─────────────────────────────────────────────────────────────┘
```

### Step-by-step map behavior

| Step | User provides | Map update (immediate on Continue) | AI response (shown in insight strip + optional label on nodes) |
|---|---|---|---|
| **1 — Destination** | `targetGoal`, `degree`, `year`, `university` | **Center node** appears: goal label = `targetGoal`. No pillars yet. Subtle pulse on center. | “Your destination is set. Everything we add next connects back here.” |
| **2 — Classes** | `currentCourses[]`, `workHoursPerWeek` | **Inner ring**: one node per course, curved edges to center. Nodes use academic styling (neutral/slate). Work hours shown as a small badge on the map chrome, not a node. | “These are your fixed academic load — they constrain how much else you can take on.” |
| **3 — Commitments** | `commitments[]` | **Middle ring**: one node per commitment (club, job, project, etc.), edges to center. Distinct color from courses. | “These compete for the same hours as your goal. Pathwise will score them against your route.” |
| **4 — Constraints** | `constraints[]`, optional | No new nodes required for MVP; optional **dashed ring** or small “constraint” chips on the map legend. | “We’ll respect these when recommending cuts and your next 7 days.” |
| **5 — Brain dump** | `brainDump` | **Preview intelligence**: AI may add 1–3 faint “concern” satellite nodes OR highlight the future bottleneck pillar in red on center halo (no full pillar expansion yet). Map does not need final pillars until generate. | “Reading your mess…”, then a one-line bottleneck preview: e.g. “Likely bottleneck: no shipped project.” |
| **6 — Build route** | Submit | Full-screen or overlay progress while `POST /api/generate` runs. Map **morphs**: course/commitment nodes fold into strategic pillars; actions appear on outer ring; alignment/bottleneck from final plan. Redirect to `/dashboard/[planId]`. | Cycling messages tied to map: “Naming bottleneck…”, “Placing pillars…”, etc. |

### Progressive graph mental model

```text
        [ Club B ]     [ Club A ]
              \         /
    [ Course 2 ] — [ GOAL ] — [ Course 1 ]
              /         \
        [ Job ]          [ Side project ]
```

- **Center** = destination (always present after step 1).
- **Ring 1 (inner)** = courses — “what the university assigns you.”
- **Ring 2 (middle)** = commitments — “what you chose to add.”
- **Ring 3 (outer, post-generate only)** = strategic pillars + actions (dashboard graph).

The student should describe this as: *“I set my goal in the middle, hung my classes on it, then my clubs around that.”*

## Requirements

### Must Have

#### UX / layout
- [ ] Split onboarding: prompt card above, live strategy map below (sticky map on desktop; map visible without scrolling on common laptop heights where possible).
- [ ] Five steps aligned to map-building (destination → classes → commitments → constraints → brain dump) plus final build.
- [ ] Progress indicator shows step name and map-building hint (e.g. “Adding your classes to the map”).
- [ ] After each **Continue**, map animates new nodes (fade/scale in, curved edges draw over ~400–600ms).
- [ ] AI insight strip updates after each step with 1–2 sentences (Groq or deterministic fallback).
- [ ] Final submit calls existing `POST /api/generate`, saves plan, redirects to dashboard; map state carries forward visually where feasible.

#### Map content rules
- [ ] Step 1 creates exactly one center node from `targetGoal`.
- [ ] Step 2 creates one node per course; minimum 1 course to continue.
- [ ] Step 3 creates one node per commitment; commitments optional but encouraged (empty allowed with confirm).
- [ ] Course nodes and commitment nodes are visually distinct (color, size, or ring).
- [ ] All nodes connect to center with curved edges (same aesthetic as dashboard graph).

#### Input fixes (known bugs)
- [ ] **Courses and commitments must accept spaces and commas while typing** (e.g. “Linear Algebra”, “Algorithms, Databases” without characters vanishing).
- [ ] Replace “split on every keystroke + join” pattern with either:
  - chip/tag input (Enter or comma adds item; chip shows full string), or
  - raw string in local state until blur/Continue, then parse.
- [ ] Plain text fields (`targetGoal`, `university`, `brainDump`) must allow normal spaces and punctuation.

#### AI integration
- [ ] Per-step insight text: optional `POST /api/onboarding/insight` (or extend generate pipeline) returning `{ insight: string, mapHints?: ... }`.
- [ ] Without API key: deterministic insights from keywords in the step input.
- [ ] Brain dump step returns a **bottleneck preview string** displayed on the map chrome and in the insight strip.

#### Continuity
- [ ] Onboarding map and dashboard graph share the same Three.js module / layout builder where possible (`displayMode: "onboarding"`).
- [ ] Demo path unchanged: landing → demo dashboard without forced onboarding.

### Nice to Have
- [ ] Edit previous step: going Back removes or dims nodes from later rings.
- [ ] Click a course/commitment node to edit label inline.
- [ ] Stream Groq tokens into the insight strip on brain dump step.
- [ ] Session restore: reload `/onboarding` restores draft + partial map from `sessionStorage`.
- [ ] Reduce motion: instant node placement, no edge draw animation.

### Out of Scope
- Full pillar/action editing during onboarding (deferred to dashboard click-to-expand).
- Opportunity checker during onboarding.
- Auth / accounts.
- Real-time map updates on every keystroke (only on **Continue** for MVP — avoids API spam).
- Replacing final `StrategyPlan` schema with a permanently different graph model (onboarding graph is a **phase**, then converts to standard plan).
- Transcript upload or course catalog autocomplete.

## UX Notes

### Visual tone
Match light command-center theme ([004-dashboard-command-center](../004-dashboard-command-center/)): white surfaces, soft borders, accent blue on the **goal** node only until bottleneck preview turns danger/red on step 5.

### Copy tone
Sharp advisor, same as global PRD. Examples:
- Step 1: “What are you actually trying to achieve this semester? Be specific — we’ll put it at the center of your map.”
- Step 2: “What classes are you in? Each one becomes a node tied to your goal.”
- Step 3: “What else is on your plate? Clubs, jobs, projects — each one gets a node.”

### Empty / error states
| State | Behavior |
|---|---|
| Step 2 with no courses | Block Continue; inline error “Add at least one course.” |
| Generate fails | Keep partial map visible; error card with Retry + Open demo |
| Graph WebGL fails | 2D SVG fallback showing same rings |
| API insight fails | Show generic deterministic insight; still update map |

### Accessibility
- Map region: `aria-label="Strategy map preview, updating as you answer"`.
- Insight strip: `aria-live="polite"`.
- Chip inputs: keyboard-add with Enter, Backspace removes last chip.

## Success Criteria

This feature is complete when:

- [ ] A student can complete onboarding without losing spaces or commas in course/commitment inputs.
- [ ] After step 1, a labeled center goal node is visible on the map.
- [ ] After step 2, course nodes appear on an inner ring connected to the goal.
- [ ] After step 3, commitment nodes appear on a middle ring connected to the goal.
- [ ] After each continue, an AI insight sentence appears (Groq or fallback).
- [ ] Submit produces a full plan and lands on the dashboard with a graph that feels like the same map “leveled up.”
- [ ] Hackathon demo: judge sees the map grow three times before the final generate — under 90 seconds.

## Open Questions (resolve in DECISIONS before build)

1. Per-step API vs single generate at end for insights only?
2. Should constraints appear as nodes or legend-only for MVP?
3. Does brain dump add satellite nodes or only bottleneck halo?
