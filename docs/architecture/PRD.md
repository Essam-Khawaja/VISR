# PRD: Pathwise

## Product Positioning

**Project name:** Pathwise

**Tagline:** You say the what. We tell the how.

Pathwise is a strategy dashboard for overwhelmed university students. It takes a messy student situation, identifies the strategic bottleneck, builds a visual Strategy Map, recommends what to cut or defer, generates a 7-day action route, and evaluates new opportunities against the current strategy.

Most productivity apps ask, "What tasks do you have?"

Pathwise asks, "What are you trying to achieve, what is blocking you, what should you cut, and what should you do in the next 7 days?"

---

## Target User

The primary user is an ambitious university student who feels scattered.

Canonical demo user:

> A second-year CS student at the University of Calgary wants a software engineering internship. They are taking five courses including algorithms and databases, working 12 hours a week, helping run a student club, thinking of joining another club, working on two unfinished side projects, attending networking events, considering research outreach, and feeling behind. Their GitHub is basically empty and they have not started LeetCode.

This student does not need another to-do list. They need a strategy.

---

## What Pathwise Is Not

- Not a to-do app
- Not a chatbot
- Not a course planner
- Not a calendar app
- Not an academic advisor replacement
- Not motivational content

Pathwise is a premium student command center. It helps students stop doing the wrong things.

---

## MVP Core Loop

1. Student completes onboarding.
2. App generates or loads a strategy plan.
3. Student lands on dashboard.
4. Dashboard shows destination, bottleneck, alignment score, Strategy Map, cut list, risks, and next 7 days.
5. Student enters a new opportunity.
6. App evaluates whether the opportunity fits their current strategy.
7. App explains the tradeoff and what must be cut if the student says yes.

The demo must make judges understand this in under 60 seconds:

> I was scattered. Pathwise found my bottleneck, told me what to cut, and gave me the next 7 days.

---

## Core Features

### 1. Landing Page

Hero:

- Headline: "Stop organizing chaos. Find the route."
- Subheading: "Pathwise turns a messy student life into a clear bottleneck, cut list, and 7-day strategy."
- Primary CTA: "Build My Route"
- Secondary CTA: "View Demo"

Sections:

- The problem: Students do not need another task list. They need to know what actually matters.
- What Pathwise gives you: Main bottleneck, Strategy Map, Cut list, Next 7 days, Opportunity Check.
- Demo preview: Destination, Bottleneck, Alignment 64%.

Acceptance criteria:

- `/` loads quickly.
- CTA routes to `/onboarding`.
- Demo CTA routes to `/dashboard/demo-cs-student-001` or `/demo`.

### 2. Onboarding

The onboarding should feel like building a student command center, not filling out a boring form.

Steps:

1. "What are you trying to achieve this semester?"
   - `targetGoal`
2. "Tell us your academic context."
   - `degree`
   - `year`
   - `university`
   - `courses`
3. "What is currently on your plate?"
   - `commitments`
4. "What constraints should Pathwise respect?"
   - `workHoursPerWeek`
   - `constraints`
5. "Brain dump everything that feels messy."
   - `brainDump`

Submit button: "Build My Route"

Loading steps:

- "Reading your situation..."
- "Finding your bottleneck..."
- "Building your strategy map..."
- "Choosing what to cut..."
- "Creating your 7-day route..."

Acceptance criteria:

- Produces a valid `StudentProfile` payload.
- Calls `POST /api/generate`.
- Redirects to `/dashboard/[planId]`.
- Shows no blank loading state.

### 3. Strategy Generation

Takes a `StudentProfile`, calls Grok with a strict JSON-output prompt, validates the result with Zod, and saves it to Supabase.

Grok must:

- Identify one specific main bottleneck.
- Avoid generic advice.
- Tie every recommendation to the student's stated goal.
- Be opinionated.
- Recommend what to cut, defer, keep, and double down on.
- Include 3 to 7 concrete actions for the next 7 days.
- Include risks.
- Include at least 4 strategic pillars.
- Use exact enum values.

Acceptance criteria:

- Returns valid `StrategyPlan` JSON.
- Retries once with a correction prompt if validation fails.
- Saves profile and plan.
- Returns `{ planId, studentId }`.
- Returns a structured error response if generation fails.

### 4. Dashboard

The dashboard is the main product. The student must understand their strategic situation in 10 seconds.

Top header:

- Destination
- Current Stage
- Main Bottleneck
- Route Status badge
- Alignment Score as a large animated number

Main content:

- Strategy Map as the visual priority
- Cut List
- Next Seven Days
- Risks
- Semester Priorities
- Opportunity Checker

Acceptance criteria:

- `/dashboard/[planId]` loads a saved plan.
- `/dashboard/demo-cs-student-001` loads static demo data instantly.
- Bottleneck is visually obvious.
- No chatbot-like interface.
- No generic SaaS template feel.

### 5. Strategy Map

Hero visualization for the strategy plan.

Preferred implementation: Three.js radial graph.

- Center node is the destination.
- Pillar nodes orbit around center.
- Action nodes cluster around each pillar.
- Lines connect center to pillars and pillars to actions.
- Bottleneck-related node pulses red.
- Node colors represent status.
- Hovering a node shows name, status, and recommendation.
- Very slow rotation or cinematic drift.

Fallback implementation: polished 2D radial graph.

- Relative container.
- SVG lines.
- Absolutely positioned nodes.
- Framer Motion node spawn animations.
- Hover popovers.

Acceptance criteria:

- Renders from `StrategyPlan.strategicPillars`.
- Bottleneck is visually dominant.
- Graph failure has a fallback.
- Looks custom, not like React Flow.

### 6. Cut List

This is one of the most important features. It must feel decisive.

Groups:

- Cut
- Defer
- Keep
- Double Down

Each item shows:

- Activity
- Recommendation badge
- Reason

Acceptance criteria:

- Every item has a specific reason.
- Reasons tie back to the goal or bottleneck.
- Categories are visually clear and scannable.

### 7. Next Seven Days

Shows 3 to 7 concrete actions.

Each action shows:

- Title
- Category
- Priority badge

Acceptance criteria:

- Actions are specific and doable.
- Actions connect to strategy categories.
- Priority is visible without relying only on color.

### 8. Opportunity Check

Embedded on the dashboard. The student enters a new opportunity and gets a structured strategy recommendation.

Examples:

- "Should I join the robotics club?"
- "Should I take on a research assistant role?"
- "Should I start another side project?"
- "Should I go to this networking event?"

Output:

- Fit score
- Recommendation
- Reasoning
- Why it fits
- Tradeoffs
- Conditions
- Cuts required

Acceptance criteria:

- Calls `POST /api/opportunity`.
- Evaluates against current strategy, not in isolation.
- Is willing to say no.
- If yes, explains what must be cut or capped.
- If API key is missing, the demo opportunity can use a clean mocked fallback.

---

## Demo Scenario

Demo route: `/dashboard/demo-cs-student-001`

Expected strategy:

- Destination: Software Engineering Internship
- Current Stage: Skill Signal
- Main Bottleneck: No shipped project, GitHub is empty
- Route Status: Scattered
- Alignment Score: 64

Expected cut list:

- Cut: Joining another general club
- Defer: Research outreach
- Keep: Current club role, capped at 3 hours/week
- Double Down: One complete portfolio project

Expected next 7 days:

1. Pick one project and commit to finishing it
2. Push current progress to GitHub today
3. Write a README explaining what the project does
4. Complete 6 LeetCode easy or medium problems
5. Apply to 5 internships with a tailored resume

Expected opportunity result for "Should I join the robotics club?":

- Fit Score: 78
- Recommendation: Say Yes With Conditions
- Condition: Cap at 4 hours/week
- Cuts Required: Pause second side project; do not join another general club; reduce current club role to 3 hours/week

---

## Design Direction

Philosophy:

- Dashboard-first, not chatbot-first
- Opinionated, not vague
- Visual, not text-heavy
- Premium student command center
- Strategy Map is the product's first impression

Color system:

| Token | Value |
|---|---|
| `--bg-base` | `#080C14` |
| `--bg-surface` | `#0D1424` |
| `--bg-elevated` | `#111827` |
| `--border` | `#1A2640` |
| `--accent` | `#4FACFE` |
| `--accent-glow` | `#4FACFE33` |
| `--danger` | `#FF4D6D` |
| `--danger-glow` | `#FF4D6D33` |
| `--success` | `#00F5A0` |
| `--warning` | `#FFB547` |
| `--muted` | `#3D4F6B` |
| `--text-primary` | `#F0F4FF` |
| `--text-secondary` | `#6B7FA3` |

Typography:

- Inter for body and UI.
- Strong display weight for headlines and alignment score.
- Alignment score should be huge.
- Route status badge should be uppercase, small, tracking-widest.

Motion:

- Cards fade in with slight upward motion.
- Alignment score counts up.
- Opportunity gauge fills.
- Buttons and cards have subtle hover lift.
- Loading screen cycles through generation steps.

Tone:

- Sharp advisor, not wellness app.
- Avoid: "Here are some things you may want to consider."
- Prefer: "Your bottleneck is no shipped project. Everything else is secondary until that changes."

---

## Non-Goals

- Full degree audit
- Official academic advising
- Course registration integration
- Calendar sync
- Transcript parsing
- Social features
- Global state manager
- Multiple simultaneous goal tracks

---

## Success Criteria

Hackathon judging:

- Innovation and Originality: strategy dashboard, Strategy Map, opportunity-cost lens.
- Technical Execution: typed Next.js app, Grok JSON validation, Supabase persistence, polished graph.
- Functional Completeness: full onboarding to dashboard to opportunity-check loop.
- Problem-Solution Fit: scattered students get a bottleneck, cut list, and 7-day route.
- UX and Design: premium dark command center, screenshot-ready.
- Learning and Ambition: AI, validation, database, graph visualization, end-to-end product.

MVP complete when:

- Landing page works.
- Onboarding form exists.
- Demo dashboard loads instantly.
- Dashboard displays `StrategyPlan` data.
- Strategy Map renders from data.
- Bottleneck is visually obvious.
- Cut List displays recommendations and reasons.
- Next Seven Days displays actionable items.
- Opportunity Checker accepts input and returns structured result.
- Grok API is used for opportunity checker, or mocked cleanly if API key is missing.
- Strategy generation API exists.
- No blank loading states.

