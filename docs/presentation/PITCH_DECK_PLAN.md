# VISR - final-round pitch deck plan

**Purpose:** Slide structure and speaker notes for hackathon judging, updated to reflect the current merged product: strategy, opportunity filtering, and Straightnoodle execution.  
**Audience:** Human judges + repo reviewers.  
**Product references:** [PRD](../architecture/PRD.md) / [Tech Spec](../architecture/TECH_SPEC.md) / [Architecture](../architecture/ARCHITECTURE.md)  
**Recommended runtime:** 4-5 minutes spoken + 60-90 seconds live demo.  
**Deck cap:** 14 slides. One job per slide.  
**Current tagline direction:** "You say what, VISR shows you how."  
**North-star sentence:** "I was scattered. VISR found my bottleneck, told me what to cut, and gave me the next moves."

---

## Current implementation snapshot

### Implemented in the repo

- Home route: `/` presents VISR as two planning layers: VISR Strategy and Straightnoodle.
- Straightnoodle routes:
  - `/flowgram` Flowgram daily planner
  - `/flowgram/week` Week View
  - `/flowgram/notes` Notes Hub
  - `/flowgram/settings` settings for city/timezone, saved locations, defaults, routines, and personal time
- Straightnoodle daily planning:
  - Weather banner and weather advice
  - Day warnings via `DayOverview`
  - "Before You Leave" packing checklist from event-linked items, category defaults, manual items, and weather
  - Timeline events with notes, completion state, items, locations, and auto-transit support
  - ICS import
  - Free-time finder
  - Routines panel
  - End-of-day rescheduling
  - Voice briefing
  - Week chart and Week View
- Strategy routes:
  - `/strategyweb/onboarding` Assessments and progressive strategy-map preview
  - `/strategyweb/dashboard/demo-cs-student-001` seeded demo dashboard
  - `/strategyweb/dashboard/[planId]` plan dashboard
  - `/strategyweb/dashboard/[planId]/pillar/[pillarId]` pillar Kanban/task workspace
  - `/strategyweb/opportunity/[planId]` Opportunity Validation
- Strategy dashboard:
  - GoalTree / Strategy Web visualization
  - Destination, stage, route status, main bottleneck, alignment score
  - Next 7 days action route with action states
  - Cut list, semester priorities, risks
  - Embedded Opportunity Checker
  - Today Focus overlay showing the top three strategy actions
- AI and data:
  - `POST /api/strategyweb/generate` calls Groq when configured and falls back to deterministic generation
  - `POST /api/strategyweb/opportunity` evaluates opportunities against the current `StrategyPlan`
  - `POST /api/strategyweb/onboarding/insight` gives per-step onboarding insight
  - `POST /api/strategyweb/node/tasks` generates tasks for strategy nodes with fallback tasks
  - Zod validation for `StudentProfile`, `StrategyPlan`, `OpportunityCheck`, onboarding insights, and task generation
  - Supabase JSONB persistence plus localStorage plan cache

### Partially implemented

- Strategy-to-execution loop: VISR has strategic "Next 7 days" and Today Focus, and Straightnoodle has daily/weekly planning. They are both implemented, but the repo does not yet automatically schedule `StrategyPlan.nextSevenDays` into the Straightnoodle timeline.
- Persistence: Supabase and local cache are implemented, but there is no real user auth yet.
- Calendar integration: ICS import is implemented. Two-way calendar sync is not.
- Strategy analysis view: the dashboard already shows bottleneck, alignment, priorities, cuts, risks, and next actions. A compact "Strategy Brief" drawer is not present in `main`.

### Planned or implied

- Deeper link between Strategy Web actions and Straightnoodle scheduled events
- Authenticated saved sessions
- Richer node drill-down and shareable plans
- Mobile polish
- Semester-aware planning
- Advisor or mentor sharing/integrations

### Safe to pitch as MVP

- Strategy generation from onboarding, with Groq + Zod + deterministic fallback
- Strategy Web / GoalTree visualization
- Bottleneck, alignment score, cut list, risks, semester priorities, and Next 7 days
- Today Focus overlay
- Opportunity Validation with fit score, recommendation, tradeoffs, conditions, and cuts required
- Straightnoodle Flowgram, Week View, Notes Hub, settings, weather/packing/free-time/routines/day planning tools
- Pillar Kanban and node task generation as a strategy drill-down feature

### Frame as next steps

- Automatic scheduling from strategy actions into Straightnoodle
- Compact Strategy Brief drawer
- Full calendar sync
- Auth and long-term saved user accounts
- Mentor/advisor workflows

---

## Rubric map

| Criterion | Weight | Primary slides |
|-----------|--------|----------------|
| Innovation & Originality | 25% | 1, 3, 4, 5, 6, 8, 12 |
| Technical Execution | 25% | 9, 11, live demo, Appendix A |
| Functional Completeness | 20% | 4, 7, 8, 9, live demo |
| Problem-Solution Fit | 15% | 2, 3, 4, 10 |
| User Experience & Design | 10% | 5, 6, 7, 9 |
| Demo & Communication | 10% | 1, 9, 14 |

---

## Slide-by-slide plan

### Slide 1 - Title / hook

**Slide type:** MVP / demo  
**Purpose:** Establish the emotional hook in one line.  
**Key message:** Students are not failing because they lack motivation. They are trying to move in too many directions without a system for deciding what matters next.  
**On-slide copy:**  
VISR  
You say what, VISR shows you how.  
For students who need direction and follow-through.

**Suggested visual/screenshot:** Full-bleed screenshot split between Strategy Web and Straightnoodle Flowgram. Use warm cream, deep plum accents, serif headline, minimal labels.  
**Screenshot targets:**
- `/`
- `/strategyweb/dashboard/demo-cs-student-001`
- `/flowgram`

**Speaker notes / talking points:**
- Start with the canonical student: internship goal, five courses, job, club, unfinished projects, empty GitHub.
- The promise is not "more productivity." The promise is deciding what matters and then making it executable.
- Keep this slide short. Judges should understand the product category before seeing the UI.

---

### Slide 2 - Problem

**Slide type:** MVP / problem  
**Purpose:** Show the pain clearly.  
**Key message:** Students are overloaded by competing priorities, and even when they know what they should do, that insight often never becomes scheduled action.  
**On-slide copy:**  
Students are juggling classes, work, clubs, projects, applications, networking, and life admin.  
The hard part is not making a list.  
The hard part is knowing what to cut and what to do next.

**Suggested visual/screenshot:** Messy cluster of obligations around the demo student. Keep it as a diagram, not a dense paragraph.  
**Screenshot targets:** Use text from `docs/architecture/PRD.md` target user or the seeded demo plan in `lib/2/fixture.ts`.  
**Speaker notes / talking points:**
- "Five courses, 12 hour/week job, student club, two side projects, networking events, research curiosity, empty GitHub, no LeetCode."
- Every option sounds reasonable in isolation.
- Without a strategy layer, students mistake motion for progress.

---

### Slide 3 - The gap

**Slide type:** MVP / problem-solution fit  
**Purpose:** Position VISR against existing tools.  
**Key message:** Current tools either organize tasks or give advice, but they do not connect strategy to execution.  
**On-slide copy/table:**

| Tool type | Helps with | Missing piece |
|-----------|------------|---------------|
| Task managers | Tracking tasks | Which tasks deserve to exist |
| Calendars | Time blocks | Strategic tradeoffs |
| Notion-style planners | Organizing notes | Opinionated cuts |
| AI chatbots | Suggestions | Living plan + follow-through |

**Suggested visual/screenshot:** Four simple cards with one "missing piece" column. Use cream cards and small plum status chips.  
**Screenshot targets:** None required. This can be a designed slide.  
**Speaker notes / talking points:**
- Task tools start after the decision has already been made.
- Chatbots can suggest ideas, but they usually do not preserve a strategy model.
- VISR starts one step earlier: what are you trying to achieve, what is blocking it, what should you stop doing, and how does that become this week?

---

### Slide 4 - What is VISR?

**Slide type:** MVP / product definition  
**Purpose:** Give the clean product definition.  
**Key message:** VISR is a student strategy co-pilot that connects direction, decisions, and daily execution.  
**On-slide copy:**  
VISR helps students:

1. Define the destination
2. Map the strategy
3. Identify the bottleneck
4. Cut distractions
5. Evaluate opportunities
6. Turn priorities into daily and weekly action through Straightnoodle

**Suggested visual/screenshot:** System loop diagram:
`Assessments -> Strategy Web -> Dashboard analysis -> Opportunity Validation -> Today Focus -> Straightnoodle Flowgram / Week View`

**Screenshot targets:**
- `/strategyweb/onboarding`
- `/strategyweb/dashboard/demo-cs-student-001`
- `/strategyweb/opportunity/demo-cs-student-001`
- `/flowgram`
- `/flowgram/week`

**Speaker notes / talking points:**
- Avoid feature dumping. This slide is the whole product story.
- VISR is the strategic layer. Straightnoodle is the execution layer.
- Be honest: the MVP begins connecting those layers, but the automatic schedule bridge is a next step.

---

### Slide 5 - Strategy Web / constellation map

**Slide type:** MVP / demo / UX  
**Purpose:** Provide the visual wow moment.  
**Key message:** The Strategy Web is the long-range map: goal at the center, pillars around it, action nodes showing what matters and where risk lives.  
**On-slide copy:**  
The goal sits at the center.  
Pillars orbit around it.  
Actions reveal the bottleneck.

**Suggested visual/screenshot:** Full-bleed Strategy Web / GoalTree screenshot. Use the demo dashboard map preview or full explore mode.  
**Screenshot targets:**
- `/strategyweb/dashboard/demo-cs-student-001`
- Click "Click to explore map" in `DashboardWorkspace`
- Component: `components/2/graph/GoalTree.tsx`

**Speaker notes / talking points:**
- "This is not React Flow. It is a custom visual model built from `StrategyPlan.strategicPillars`."
- Show the Software Engineering Internship center, then Skill Signal / Interview Readiness / Recruiting / Network / Academics.
- Explain that the graph is useful because the student sees relationships, not just a list.

---

### Slide 6 - Analysis layer: what the map means

**Slide type:** MVP + next step  
**Purpose:** Show how the product explains the Strategy Web instead of leaving users to interpret it alone.  
**Key message:** The current MVP already renders the analysis: destination, alignment score, bottleneck, priorities, cut list, risks, and next actions. A compact Strategy Brief drawer is the next UI refinement, not a built feature on `main`.  
**On-slide copy:**  
Built today:
- Destination and current stage
- Alignment score
- Main bottleneck
- Next 7 days
- Cut / Defer / Keep / Double Down
- Risks and priorities

Next UI refinement:
- A compact Strategy Brief drawer that summarizes the same analysis beside the web.

**Suggested visual/screenshot:** Dashboard top band + Next 7 days + Cut list in one cropped composite.  
**Screenshot targets:**
- `/strategyweb/dashboard/demo-cs-student-001`
- Components: `DashboardWorkspace`, `TodayOverlay`, `StrategyPanels`

**Speaker notes / talking points:**
- Do not overclaim the Strategy Brief drawer on `main`.
- Say: "The analysis is implemented in the dashboard panels. The compact brief is the next packaging step."
- This slide answers: where am I going, how aligned am I, what is blocking me, what matters most, and what should I stop doing?

---

### Slide 7 - Straightnoodle daily / weekly planning

**Slide type:** MVP / demo  
**Purpose:** Add the execution layer clearly.  
**Key message:** VISR does not stop at the strategy map. Straightnoodle turns the week into something the student can actually follow.  
**On-slide copy:**  
Straightnoodle is the day-to-day execution layer:

- Flowgram: today's schedule, notes, completion, items, weather, routines
- Week View: calendar-style scan of the week
- Notes Hub: unresolved and follow-up notes
- Free-time finder: find a slot and schedule it
- End-of-day reschedule: recover unfinished work

**Example translation:**
- "Improve skill signal" -> "Ship one portfolio project and push progress to GitHub."
- "Prepare for interviews" -> "Complete 6 LeetCode easy problems this week."
- "Network more" -> "Message 2 upper-year CS students."

**Suggested visual/screenshot:** Side-by-side: Flowgram `/flowgram` and Week View `/flowgram/week`.  
**Screenshot targets:**
- `/flowgram`
- `/flowgram/week`
- `/flowgram/notes`
- Components: `Timeline`, `BeforeYouLeave`, `FreeTimeFinder`, `RoutinesPanel`, `WeekChart`, `VoiceBriefingButton`

**Speaker notes / talking points:**
- The strategy side decides what matters.
- Straightnoodle helps the student live with that decision today and this week.
- Be precise: the current MVP shows the two layers in the same app; deeper automatic scheduling from strategy actions into Straightnoodle is future work.

---

### Slide 8 - Opportunity Validation

**Slide type:** MVP / demo  
**Purpose:** Show the tradeoff engine.  
**Key message:** VISR evaluates new opportunities against the current strategy, not in isolation.  
**On-slide copy:**  
When a student asks, "Should I join the robotics club?" VISR answers:

- Is it aligned?
- What does it cost?
- What would I have to cut?
- Under what condition should I say yes?

**Suggested visual/screenshot:** Opportunity input + result cards: fit score, verdict, tradeoffs, conditions, cuts required.  
**Screenshot targets:**
- `/strategyweb/opportunity/demo-cs-student-001`
- Embedded checker inside `/strategyweb/dashboard/demo-cs-student-001`
- Components: `OpportunityClient`, `EmbeddedOpportunityChecker`, `OpportunityResult`, `FitScoreGauge`

**Speaker notes / talking points:**
- The demo fixture returns 78% and "Say Yes With Conditions" for robotics club.
- The important part is not the yes. It is the conditions and the cuts.
- Tie it back to Straightnoodle: a yes that adds hours must be reflected in the week, otherwise it is just optimism.

---

### Slide 9 - Demo flow

**Slide type:** demo  
**Purpose:** Give a simple route judges can follow live.  
**Key message:** The MVP is demoable end to end, with a reliable seeded route and live AI paths when keys are configured.  
**Demo route:**

1. `/` - show the two-layer product: VISR Strategy + Straightnoodle.
2. `/strategyweb/onboarding` - show Assessments and the live map preview.
3. `/strategyweb/dashboard/demo-cs-student-001` - show Strategy Web / GoalTree and dashboard analysis.
4. Open Today Focus - show top three strategy actions.
5. Scroll to Next 7 days and Cut list - show the bottleneck and tradeoffs.
6. `/flowgram` - show Straightnoodle Flowgram daily execution.
7. `/flowgram/week` - show the weekly planning view.
8. `/strategyweb/opportunity/demo-cs-student-001` - test "Should I join the robotics club?"
9. Show conditional recommendation, cuts required, and the route back to the plan.

**Suggested visual/screenshot:** Numbered demo path with small route pills.  
**Screenshot targets:** All routes above.  
**Speaker notes / talking points:**
- Use the demo plan for reliability.
- Do not spend too long on every subfeature. The story is strategy -> decision -> action.
- If live AI fails, the deterministic fallback still shows the product loop.

---

### Slide 10 - Research-informed design

**Slide type:** research  
**Purpose:** Add credibility without turning the pitch into a literature review.  
**Key message:** VISR uses known behavior-design mechanisms: specific goals, visual strategy, fewer commitments, and implementation intentions.  
**On-slide copy:**

- Specific goals improve performance.
- Strategy maps help users see how actions connect.
- Visual explanations reduce cognitive load.
- Too many options reduce follow-through.
- Implementation intentions turn intention into action.

**Suggested visual/screenshot:** Five small mechanism cards. Keep citations in speaker notes or appendix, not on the main slide unless required.  
**Screenshot targets:** None required.  
**Speaker notes / talking points:**
- Say "research-informed," not "proven."
- VISR uses the mechanisms: destination, Strategy Web, cut list, Next 7 days, Straightnoodle daily/weekly execution.
- Keep this to 20 seconds.

---

### Slide 11 - Technical execution

**Slide type:** technical  
**Purpose:** Prove the app is more than a mockup.  
**Key message:** The MVP has typed schemas, AI calls with deterministic fallbacks, Supabase/local persistence, custom visualization, and a working daily planner layer.  
**On-slide stack chips:**

Next.js 14 App Router / TypeScript / Tailwind CSS / Framer Motion / Three.js / Groq / Zod / Supabase / localStorage / OpenWeather and geocoding APIs / Web Speech API

**Architecture diagram:**

```text
Assessments -> POST /api/strategyweb/generate
  -> Groq JSON (when configured)
  -> Zod validation
  -> deterministic fallback if needed
  -> Supabase JSONB + local cache
  -> Strategy dashboard / GoalTree

Opportunity text -> POST /api/strategyweb/opportunity
  -> StrategyPlan context
  -> Groq JSON or fallback
  -> OpportunityCheck result

Straightnoodle
  -> /api/flowgram/events, items, event-items, routines, weather,
     free-time, settings, saved-locations, manual-checklist, ICS import
```

**Suggested visual/screenshot:** Stack diagram + short IDE crop of schemas.  
**Screenshot targets:**
- `lib/2/types.ts`
- `lib/2/validate.ts`
- `app/api/strategyweb/generate/route.ts`
- `app/api/strategyweb/opportunity/route.ts`
- `app/api/strategyweb/node/tasks/route.ts`
- `app/api/flowgram/events/route.ts`
- `app/api/flowgram/free-time/route.ts`
- `app/api/flowgram/ics-import/route.ts`

**Speaker notes / talking points:**
- Groq is only called from server routes.
- Zod controls the shape before the UI consumes it.
- The demo route is seeded for reliability, but live generation exists.
- Straightnoodle is not a static screenshot. It has event CRUD, checklists, routines, notes, weather, free-time search, and ICS import.

---

### Slide 12 - Why VISR is different

**Slide type:** MVP / comparison  
**Purpose:** Make the category difference obvious.  
**Key message:** VISR combines strategy clarity, tradeoff analysis, and daily execution in one system.  
**Comparison table:**

| Capability | Task managers | Calendars | AI chatbots | Notion planners | VISR |
|------------|---------------|-----------|-------------|-----------------|----------|
| Strategy clarity | Low | Low | Medium | Medium | High |
| Visual strategy map | No | No | No | Manual | Built |
| Bottleneck detection | No | No | Suggested | Manual | Built |
| Cut / keep / double-down decisions | No | No | Suggested | Manual | Built |
| Opportunity validation | No | No | One-off | No | Built |
| Daily/weekly execution through Straightnoodle | Partial | High | No | Manual | Built |
| Concrete next actions | Manual | Manual | Suggested | Manual | Built |

**Suggested visual/screenshot:** Compact table with VISR column highlighted in plum/cream, not bright SaaS blue.  
**Screenshot targets:** None required.  
**Speaker notes / talking points:**
- The win is not "we also have a planner."
- The win is the loop: strategy decides, opportunity validation protects focus, Straightnoodle turns it into the day/week.
- Be careful: automatic deep sync between Strategy Web and Straightnoodle is a next step.

---

### Slide 13 - Roadmap

**Slide type:** roadmap  
**Purpose:** Show ambition without pretending future work is already done.  
**Key message:** The MVP proves the loop. The roadmap deepens integration, persistence, and collaboration.  
**On-slide structure:**

**MVP built now**
- Strategy Web / GoalTree
- Dashboard analysis: bottleneck, alignment, cut list, risks, Next 7 days
- Today Focus
- Opportunity Validation
- Assessments and AI generation
- Straightnoodle Flowgram, Week View, Notes Hub, settings
- Pillar Kanban and AI task generation

**Next**
- Automatic schedule bridge from StrategyPlan actions into Straightnoodle
- Compact Strategy Brief drawer
- Authenticated saved sessions
- Deeper calendar integration
- Richer node drill-down
- Mobile optimization
- Shareable plans
- Semester-aware planning
- Advisor/mentor views

**Suggested visual/screenshot:** Two columns: "Built" and "Next". Keep it calm and honest.  
**Screenshot targets:** None required.  
**Speaker notes / talking points:**
- Emphasize that the MVP is already functional.
- The roadmap is about making the loop tighter, not changing the product.

---

### Slide 14 - Closing

**Slide type:** closing  
**Purpose:** Leave judges with the full promise.  
**Key message:** VISR helps students stop juggling everything and start moving with intention.  
**On-slide copy:**  
VISR helps scattered students:

- choose the destination
- see the route
- cut the noise
- validate new yeses
- move through the week with Straightnoodle

Final line:  
Stop juggling everything. Move with intention.

**Suggested visual/screenshot:** Strategy Web fading into Flowgram/Week View. Use the same cream/plum constellation style from earlier slides.  
**Screenshot targets:**
- `/strategyweb/dashboard/demo-cs-student-001`
- `/flowgram`
- `/flowgram/week`

**Speaker notes / talking points:**
- Return to the student from Slide 2.
- The student does not walk away with a motivational paragraph. They walk away with a bottleneck, cuts, and next actions.
- Close on clarity + execution, not AI novelty.

---

## Live demo script (60-90 seconds)

1. Open `/` and say: "VISR has two layers: strategy and Straightnoodle execution."
2. Open `/strategyweb/dashboard/demo-cs-student-001`.
3. Point to the destination: Software Engineering Internship.
4. Point to the bottleneck: no shipped project, GitHub is empty.
5. Open Today Focus and show the top three actions.
6. Scroll to Next 7 days and Cut list.
7. Open `/flowgram` and show how Straightnoodle handles the day: timeline, packing list, weather, routines, free time.
8. Open `/flowgram/week` and show the weekly view.
9. Open `/strategyweb/opportunity/demo-cs-student-001`.
10. Evaluate "Should I join the robotics club?"
11. Show the answer: 78%, Say Yes With Conditions, plus cuts required.
12. End with: "VISR does not just add another task. It decides whether that task belongs in the plan."

**If AI is unavailable:** Use the seeded demo plan and deterministic opportunity fallback. The route still works.

---

## Screenshot checklist

- Home: `/`
- Strategy dashboard: `/strategyweb/dashboard/demo-cs-student-001`
- Explore map / GoalTree: click the map preview on the strategy dashboard
- Today Focus overlay: click "Open today focus"
- Opportunity Validation: `/strategyweb/opportunity/demo-cs-student-001`
- Assessments: `/strategyweb/onboarding`
- Straightnoodle Flowgram: `/flowgram`
- Week View: `/flowgram/week`
- Notes Hub: `/flowgram/notes`
- Pillar Kanban: `/strategyweb/dashboard/demo-cs-student-001/pillar/pillar-skill`

---

## Claims to avoid or soften

- Do not say Strategy Brief drawer is built on `main`. Say the dashboard already contains the analysis, and a compact brief drawer is a next UI step.
- Do not say Strategy Web actions automatically become Straightnoodle scheduled events. Say the MVP begins connecting strategy to daily action through Today Focus, Next 7 days, and Straightnoodle. Automatic scheduling is next.
- Do not say there is full calendar sync. ICS import exists; two-way sync is future work.
- Do not say there is authentication or multi-user persistence. Supabase/local persistence exists, but auth is future work.
- Do not claim the product is clinically proven. Say research-informed.
- Do not call VISR a chatbot, calendar app, degree audit, or advisor replacement.

---

## Appendix A: StrategyPlan JSON b-roll

**Use on:** Slide 11, as a quick cut during the technical architecture slide.  
**What to capture:** `lib/2/fixture.ts` and `lib/2/validate.ts`, or a Network tab response from `POST /api/strategyweb/generate`.

**What to say:**
- "The plan is typed and validated before the dashboard reads it."
- "Enums force the opinionated decisions: Cut, Defer, Keep, Double Down."
- "The same structured object powers the map, cut list, risks, Today Focus, and Opportunity Validation."
- "If Groq is unavailable, deterministic fallbacks keep the demo reliable."

**Trimmed example:**

```json
{
  "destination": "Software Engineering Internship",
  "currentStage": "Skill Signal",
  "mainBottleneck": "No shipped project - GitHub is empty",
  "routeStatus": "Scattered",
  "alignmentScore": 64,
  "strategicPillars": [
    {
      "name": "Skill Signal",
      "status": "Weak",
      "reason": "GitHub is empty and no project is shipped.",
      "actions": [
        {
          "name": "Portfolio Project",
          "status": "At Risk",
          "recommendation": "Pick one project and ship it."
        }
      ]
    }
  ],
  "cutList": [
    {
      "activity": "Joining another general club",
      "recommendation": "Cut",
      "reason": "Adds low signal and worsens the internship bottleneck."
    }
  ],
  "nextSevenDays": [
    {
      "title": "Push current project progress to GitHub today",
      "priority": "High"
    }
  ]
}
```

---

## Appendix B: Build checklist

- [ ] Build 14 slides from sections above
- [ ] Capture Strategy dashboard and GoalTree map
- [ ] Capture Straightnoodle Flowgram and Week View
- [ ] Capture Opportunity Validation result
- [ ] Record StrategyPlan JSON b-roll
- [ ] Rehearse the 60-90 second live demo path
- [ ] Verify all research claims are phrased as mechanisms, not proof