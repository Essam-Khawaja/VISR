# PRD: Pathwise
## University Strategy Dashboard

---

### Tagline
**You say the what. We tell the how.**

---

## 1. The Personal Problem

Last semester I was taking five courses, leading a 17-person software engineering team, applying to six internships simultaneously, running a YouTube channel, and co-running a web agency. At any given moment I had 40 things I could be working on and no way to know which ones actually mattered.

The problem was not motivation. The problem was not a missing to-do list. The problem was that I had no strategy. I did not know my bottleneck. I did not know what to cut. I did not know whether saying yes to a new opportunity was going to help me or just add noise.

Every productivity app I tried gave me better ways to organize the chaos. None of them told me whether I was working on the right things at all.

Pathwise is the tool I needed and could not find. It does not help you execute faster. It tells you what is actually worth executing on.

---

## 2. The Core Insight

Productivity apps solve for execution. They assume you already know what matters.

The gap is strategy. Specifically:

- Which of my current activities actually move me toward my goal?
- What is the one thing blocking me most right now?
- Is this new opportunity worth saying yes to, given everything else I am doing?
- What should I cut, defer, or double down on?

No app answers these questions. They require understanding the student's goal, their current commitments, and the relationship between them. That is what Pathwise does.

---

## 3. Target User

**Primary:** Ambitious university students who have a goal but feel scattered.

The canonical user is a CS student trying to land a software internship who is taking five courses, doing a club, considering three side projects, and unsure whether any of it is moving the needle.

That student is real. That student is me. That student is at every university.

**Secondary:** Students who are unsure of their path and want structured clarity on where to start.

---

## 4. What Pathwise Is Not

- Not a to-do app
- Not a chatbot
- Not a course planner
- Not an academic advisor replacement
- Not a calendar tool
- Not motivational content

Pathwise is a **strategic planning dashboard**. It builds a model of your situation and tells you what it means.

---

## 5. Core Features

### Feature 1: Onboarding
Multi-step form collecting:
- Degree, year, university
- Target career goal
- Current courses
- Current commitments (clubs, jobs, projects, etc.)
- Work hours per week
- Constraints
- Brain dump — unstructured text, anything on their mind

The brain dump is critical. It captures signal that structured fields miss. Students should be able to paste messy, honest thoughts and have the app make sense of them.

**Acceptance criteria:**
- Completable in under 3 minutes
- Accepts unstructured text
- Produces a StudentProfile object on submit

---

### Feature 2: AI Strategy Generation
Takes the StudentProfile and calls the Claude API with a structured prompt. Returns a validated StrategyPlan JSON object.

The output drives every part of the dashboard. It must be complete, specific, and tied to the student's actual stated goal — not generic advice.

**Acceptance criteria:**
- Returns valid StrategyPlan JSON
- Includes a specific bottleneck (not a generic one)
- Includes at least 4 strategic pillars
- Includes a cut/defer/keep list with reasons
- Includes a next 7 days plan tied to the bottleneck
- Passes Zod validation before saving

---

### Feature 3: Strategy Dashboard
The main screen. A student should understand their strategic situation within 10 seconds of landing here.

**Layout:** The Goal Tree occupies 60% of the screen. Everything else is cards arranged around it. This is not a list of sections. The graph is the page.

**Header displays:**
- Destination
- Current stage
- Main bottleneck
- Route status
- Alignment score

**Supporting cards:**
- Bottleneck detail
- Semester priorities
- Cut list
- Next 7 days
- Risk warnings

**Acceptance criteria:**
- Dashboard loads from saved StrategyPlan
- Bottleneck is immediately visible
- Does not feel like a chatbot interface
- Does not feel like a generic dashboard template

---

### Feature 4: Goal Tree (Hero Visualization)
The most important component in the product. This is what no other app has.

A custom Three.js radial graph rendered on a canvas. Not React Flow. Not a diagram library. Custom built.

**Structure:**
- Goal node at center, glowing
- Strategic pillar nodes orbit the goal at fixed radius
- Action nodes cluster around each pillar
- Nodes connected by animated gradient edges

**Visual behavior:**
- Camera starts zoomed out, slowly drifts inward on load (cinematic push)
- Scene rotates imperceptibly at ~0.3 degrees/second — alive, not distracting
- Bottleneck node pulses with a breathing red glow (sin-wave opacity, not blinking)
- Hovering a node pauses drift, lifts the node, shows a popover with recommendation
- Node colors encode status: electric mint (on track), amber (needs attention), warm red (bottleneck/risk), muted gray (deferred/cut)

**Acceptance criteria:**
- Renders from real StrategyPlan data
- All animations present
- Hover popover shows node explanation
- Bottleneck node visually dominant
- Looks nothing like a flowchart builder

---

### Feature 5: Cut List
Shows what the student should cut, defer, keep, or double down on. Each item includes a specific reason tied to their goal.

Categories: Cut now / Defer / Keep / Double down

**Acceptance criteria:**
- Appears on dashboard
- Every item has a reason
- Reasons reference the student's actual goal and bottleneck
- Not generic advice

---

### Feature 6: Next 7 Days
3–7 specific, actionable steps. Connected to the current bottleneck. Not motivational fluff.

**Acceptance criteria:**
- Actions are specific (e.g. "Push current project to GitHub" not "Work on projects")
- Actions connect to the bottleneck
- Actions are doable within a week

---

### Feature 7: Opportunity Check
Standalone tool. User enters an opportunity ("Should I join the robotics club?"). App evaluates it against the current strategy and returns a structured recommendation.

**Output:**
- Fit score (0–100)
- Recommendation: Say Yes / Say No / Defer / Say Yes With Conditions
- Why it fits or does not
- Tradeoffs
- What to cut if accepted

**Acceptance criteria:**
- Input is freeform text
- Output is structured and specific
- Includes opportunity cost
- Recommendation is opinionated, not hedged

---

## 6. Design Direction

### Philosophy
- Dashboard-first, not chatbot-first
- Opinionated, not vague
- Visual, not text-heavy
- The graph is the product
- Premium and restrained, not loud

### Color System
| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#080C14` | Page background |
| `--bg-surface` | `#0D1424` | Card backgrounds |
| `--bg-elevated` | `#111827` | Hover states, popovers |
| `--border` | `#1A2640` | Structural lines |
| `--accent` | `#4FACFE` | Primary accent, links, active states |
| `--accent-glow` | `#4FACFE33` | Glow effects |
| `--danger` | `#FF4D6D` | Bottleneck, risk, cut |
| `--danger-glow` | `#FF4D6D33` | Bottleneck pulse |
| `--success` | `#00F5A0` | On track status |
| `--warning` | `#FFB547` | Needs attention |
| `--muted` | `#3D4F6B` | Deferred, cut items |
| `--text-primary` | `#F0F4FF` | Primary text |
| `--text-secondary` | `#6B7FA3` | Labels, metadata |

One accent color. Everything else is neutrals. Restraint is what makes it feel expensive.

### Typography
- **Display / Hero numbers:** Clash Display or Cal Sans — geometric, confident
- **UI / Body:** Inter — no substitutions
- **Alignment score:** Rendered at 120px. The number is the design.
- **Route status badge:** 11px uppercase tracking-widest

### Motion
All animations use Framer Motion unless inside the Three.js canvas.

- Dashboard cards: staggered fade-in, 40ms between each, `ease-out` 300ms
- Alignment score: counts up from 0 on first render, 1200ms duration
- Goal Tree camera: smooth cinematic drift inward over 3 seconds on load
- Bottleneck node: sin-wave breathing glow, 2s period
- Opportunity fit score: circular gauge fills on render, 800ms
- Card hover: subtle `translateY(-2px)` lift, 150ms

### Tone
Sound like a sharp advisor, not a wellness app.

Avoid: "You might want to consider exploring some options in this space."
Prefer: "Your bottleneck is no shipped project. Everything else is noise until that changes."

---

## 7. Non-Goals for MVP
- Full degree audit
- Official academic advising replacement
- Course registration integration
- Calendar sync
- Transcript parsing
- Social features
- Mobile-specific design
- Multiple simultaneous goal tracks

---

## 8. Success Criteria

**Demo success:**
- Judges understand the product in under 60 seconds
- Goal Tree visually dominates and impresses
- Cut list feels specific to the demo user, not generic
- Opportunity check gives a recommendation judges agree with
- End-to-end flow works without errors

**Product success:**
- Student can name their bottleneck after first use
- Student knows what to do in the next 7 days
- Student knows what to stop doing
- Student feels more clear, not more anxious

---

## 9. Demo Scenario (Pre-Generated, Cached)

**Input profile:**
> I'm a second-year CS student at the University of Calgary. I want a software engineering internship. I'm taking 5 courses including algorithms and databases, working 12 hours a week at a part-time job, helping run a student club, thinking of joining another club, working on two side projects neither of which is finished, going to networking events, and considering reaching out about research. My GitHub is basically empty and I haven't started LeetCode. I feel scattered and behind.

**Expected dashboard output:**
- Destination: Software Engineering Internship
- Current Stage: Skill Signal
- Main Bottleneck: No shipped project — GitHub is empty
- Route Status: Scattered but Recoverable
- Alignment Score: 64%

**Cut list:**
- Cut: Joining another general club
- Defer: Research until portfolio project is shipped
- Keep: Current club role, capped at 3 hours/week
- Double down: One complete shipped portfolio project

**Next 7 days:**
1. Pick one project and commit to finishing it
2. Push current progress to GitHub today
3. Write a README that explains what the project does
4. Complete 6 LeetCode easy/medium problems
5. Apply to 5 internships with a tailored resume

**Opportunity check — "Should I join the robotics club?"**
- Fit Score: 78%
- Recommendation: Say Yes With Conditions
- Condition: Cap at 4 hours/week and pause second side project
- Tradeoff: May delay portfolio project by 2 weeks

This scenario is pre-generated and saved to Supabase. The demo never calls the live API during judging.
