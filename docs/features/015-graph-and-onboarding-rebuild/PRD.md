# Feature PRD: Graph And Onboarding Rebuild

## Status
Draft

## Summary

This feature turns Pathwise from a demo dashboard with a strategy graph into a full first-run strategy-building experience.

There are two immediate graph fixes:

1. Graph nodes must be a single visible circle. The current visual has a Three.js circle plus a separate HTML text circle, which reads as two stacked nodes. The node should be one disk large enough to contain its label and progress ring.
2. When the user adds a task to the center node or any graph node, the graph must visibly grow by adding a connected task node. A task should not only appear in a dialog or Today view.

There is also a larger onboarding rebuild:

Pathwise should start by onboarding the student into a university-life strategy graph. The onboarding should feel premium, interactive, and alive: a compact question card in the top-left, with the map being constructed in real time as the student answers. It should build from high-level university outcome to years, semesters, current semester, courses, clubs, work, and strategic tasks.

## Problem

The current app is closer, but it still has three product gaps:

- The graph looks visually inconsistent because node text appears inside a separate overlay circle instead of the actual node.
- Adding a task does not make the graph grow. The user cannot see their strategy map becoming more detailed.
- Onboarding asks reasonable questions, but it does not yet build a premium multi-level university strategy map. It should feel like the app is constructing the student's path through university, not filling out a form.

## Goals

- Make every visible graph node a single unified circle or disk that contains its own text.
- Ensure node text is fully contained with no detached labels and no second node-shaped text background.
- Make manually added tasks appear as graph nodes connected to the selected parent node.
- Keep task sync with Today and Week through the canonical strategy task model from feature 014.
- Rebuild onboarding as the default first-run experience.
- Build a live multi-level graph during onboarding:
  - End-of-university identity / destination.
  - University program timeline.
  - Year-level graph.
  - Semester-level graph.
  - Current-semester execution graph.
- Use onboarding answers to create an initial strategy map before reaching the dashboard.
- Preserve the seeded demo tasks in Today for hackathon reliability.

## Non-Goals

- Do not remove the demo dashboard.
- Do not remove the existing Today and Week routes.
- Do not rely on AI to generate tasks during onboarding. The user should be prompted to create important tasks themselves.
- Do not build a full degree audit system with university-specific requirements.
- Do not build a calendar scheduler for task time blocks in this feature. Tasks remain day-level due-date items.
- Do not replace opportunity checking. It remains a separate AI feature after onboarding.

## Target User

An ambitious university student who knows where they roughly want to end up, but cannot translate that into a semester-level route.

Example:

> "By the end of university, I want to be a strong software engineering candidate. I am in year two, taking five courses, working part time, in a club, and trying to decide what matters this semester."

## User Experience

### First App Open

When the user opens Pathwise:

- If no active plan exists, send them into onboarding.
- If an active plan exists, open the dashboard for that plan.
- Demo routes remain available for judging and development.

The default product path is:

```text
Open app
  -> Premium onboarding
  -> Live university strategy graph
  -> Generated / assembled initial plan
  -> Dashboard
  -> Add tasks on graph
  -> Tasks appear in graph, Today, and Week
  -> Opportunity check evaluates against current plan
```

### Onboarding Visual Style

The onboarding screen should feel like a command center being assembled:

- Full-screen light premium background.
- Strategy map takes most of the screen.
- A floating question card sits in the top-left.
- Progress is visible, but quiet.
- The graph animates as answers are added.
- Transitions should zoom between graph levels instead of hard replacing the whole screen.

Card placement:

```text
┌─────────────────────────────────────────────────────────────┐
│ ┌────────────────────────────┐                              │
│ │ Question card              │                              │
│ │ input / chips / controls   │          Live graph          │
│ │ continue button            │                              │
│ └────────────────────────────┘                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Onboarding Flow

#### Step 1: End State

Question:

> What do you want to be at the end of university?

Purpose:

Capture the student's long-range identity, not just this semester's goal.

Examples:

- "A software engineering candidate with shipped products and internship experience."
- "Ready for medical school with strong grades and research exposure."
- "A designer with a portfolio and real client work."

Graph behavior:

- Create the top-level destination node.
- The graph center represents the student's university journey / outcome.

#### Step 2: University Context

Questions:

- University name.
- Degree/program.
- Expected program length.
- Total courses required.
- Courses already completed, if known.
- Current year.
- Expected graduation year.

Graph behavior:

- Generate a high-level linear graph for the university path.
- Show one node per academic year.
- Connect years in order.
- Highlight the current year.

Example:

```text
End of University Outcome
  -> Year 1
  -> Year 2 current
  -> Year 3
  -> Year 4
```

#### Step 3: Year Zoom

Questions:

- Current semester.
- Typical fall/winter course load.
- Whether spring/summer courses are likely.
- Clubs, part-time work, research, athletics, family responsibilities, or recurring commitments.

Graph behavior:

- Zoom into the current year.
- Current year becomes the center.
- Surround it with Fall, Winter, Spring, Summer.
- Fall and Winter get course-count estimates from:

```text
remaining courses / remaining fall+winter semesters
```

- Spring/Summer remain optional or lighter unless the user says otherwise.
- Clubs and work appear as connected commitment nodes to the relevant semester.

#### Step 4: Current Semester Detail

Questions:

- Exact current semester courses.
- Work hours.
- Clubs / leadership roles.
- Projects.
- Research.
- Applications / recruiting / networking.
- Constraints.

Graph behavior:

- Zoom into the current semester.
- Current semester becomes the center node.
- Add course nodes around it.
- Add commitment nodes around it.
- Add strategic signal nodes that map to the student's end goal.

For a CS internship goal, likely nodes:

- Courses.
- Portfolio / shipped project.
- Interview readiness.
- Recruiting.
- Clubs / work commitments.

#### Step 5: Task Seeding By User

Question:

> What are the first tasks you know must happen this semester?

Important:

Do not use AI to generate tasks. Prompt the user to add tasks manually.

Fields:

- Task title.
- Due date.
- Priority.
- Parent context, defaulting to the selected graph node.

Graph behavior:

- Every added task appears as a task node connected to its parent.
- If the parent is the current semester center, the task connects directly to the center.
- If the parent is a course, club, project, or commitment, the task connects to that node.
- The same task appears in Today/Week according to due date.

#### Step 6: Bottleneck And Dashboard Handoff

Questions:

- What feels most likely to break this semester?
- What do you keep saying yes to?
- What would make the end-of-university outcome more realistic in the next 30 days?

Graph behavior:

- Mark a preliminary bottleneck.
- Confirm the current-semester map.
- Build the initial dashboard.

The user lands on the dashboard with:

- Current semester as the active strategy center.
- End-of-university goal visible as long-range context.
- Year/semester breadcrumbs available.
- Current tasks synced to Today and Week.

## Dashboard Behavior After Onboarding

The dashboard should default to the current semester graph. It can still show destination, bottleneck, cut list, opportunities, and next actions, but the graph model is now hierarchical:

```text
University outcome
  -> years
    -> semesters
      -> courses / commitments / strategic pillars
        -> tasks
```

The student should be able to:

- Add a task from the current center node.
- Add a task from a course node.
- Add a task from a club/work/project node.
- See that task appear as a graph node.
- See the same task in Today and Week.
- Mark it done from any surface.

## Acceptance Criteria

- First app open routes to onboarding when no active plan exists.
- Onboarding appears as a top-left premium question card over/alongside a live map.
- Step 1 asks "What do you want to be at the end of university?"
- Step 2 captures university, degree, expected length, current year, course requirements.
- Step 3 creates a linear year graph and then zooms into current year.
- Current year graph has Fall, Winter, Spring, Summer semester nodes.
- Course counts are estimated for Fall/Winter from total course requirements and program length.
- Current semester graph captures exact classes, clubs, work, and commitments.
- User-created onboarding tasks become graph task nodes.
- No AI-generated tasks are inserted.
- Existing seeded demo tasks remain in Today.
- Graph nodes are one visible node shape, not a node plus a separate text bubble.
- Added tasks appear as connected graph nodes.
- Added tasks with due dates appear in Today and Week.
- Done state syncs between graph, Today, and Week.

## Demo Narrative

> "Pathwise starts by asking who you want to be at the end of university. As you answer, it builds the university path: years, semesters, current semester, courses, work, clubs, and tasks. When I add a task to the semester, it becomes a real node on the map and also appears in Today and Week. The dashboard is not a separate app. It is the execution surface for the same strategy graph."

