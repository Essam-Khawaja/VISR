<div align="center">

<img src="public/Logo.png" alt="VISR logo" width="84" height="84" />

# VISR

### Visual Intelligence for Student Roadmapping

**You say the what. We tell the how.**

Strategy dashboard for overwhelmed university students. Built for the 2026 hackathon.

[Live demo route](#-quickstart) - [Judging notes](docs/judging-notes.md) - [Research backing](docs/research.md) - [Architecture docs](docs/architecture/)

</div>

---

## What VISR is

Most productivity tools ask "what tasks do you have?" VISR asks **"what are you trying to achieve, what is blocking you, and what should you cut?"**

It is a single workspace with two synchronised perspectives:

- **Strategy Web** (`/strategyweb`): a 3D goal map, a five-pillar plan, a cut list, and an opportunity checker that scores new commitments against the active strategy.
- **Flowgram** (`/flowgram`): the day, week, and notes views where strategy tasks land alongside calendar events, packing checklists, weather, transit blocks, and routines.

Both perspectives share the same data model (`StrategyPlan`, `StrategyNode`, `StrategyTask`) so a goal at the top of the map flows down to a dated action on today's timeline.

---

## Why this matters

The canonical user is a second-year CS student at the University of Calgary. Five courses (algorithms, databases, three more), a 12 hr/week part-time job, a club role, two unfinished side projects, networking events, considering research outreach. GitHub is empty. LeetCode hasn't started. They are not lazy. They are scattered.

VISR's job is to make the strategic posture visible:

1. Identify the **single biggest bottleneck** (e.g. "no shipped project").
2. Map the destination, the pillars, and the actions in one explorable graph.
3. Recommend what to **Cut, Defer, Keep, or Double Down** on, with reasons.
4. Generate a **next 7 days** route as concrete dated tasks.
5. When a new opportunity appears ("Should I join the robotics club?"), evaluate it against the active strategy, not in isolation, and surface the explicit cuts required to take it on.

The product is opinionated by design. It is not a chatbot. It is not a to-do list. It is a strategy dashboard that is willing to say no.

---

## Highlight reel

| | What it does | Where to see it |
|---|---|---|
| **Strategy Map** | Three.js scene that renders destination, pillars, and action nodes with status colors. The bottleneck is the loudest element. | `components/strategyweb/graph/GoalTree.tsx` |
| **Cut list as a first-class panel** | Every plan ships 4 to 6 items grouped Cut / Defer / Keep / Double Down with explicit reasons. | `components/strategyweb/dashboard/DashboardWorkspace.tsx` |
| **Opportunity validation** | Structured `OpportunityCheck` with fit score, recommendation, why-it-fits, tradeoffs, conditions, and required cuts. | `app/strategyweb/opportunity/[planId]/page.tsx` |
| **Schema-validated AI** | Every Groq response is Zod-validated and falls back to a deterministic generator on failure. The demo never breaks. | `lib/strategyweb/{groq,validate,deterministicPlan}.ts` |
| **Strategy to day handoff** | Strategy tasks materialise from pillar actions into dated work that shows up on `/flowgram` and `/flowgram/week`. | `lib/strategyweb/taskStore.ts` |
| **Daily orchestration** | Day view stitches together events, packing checklist, weather, free-time finder, voice briefing, end-of-day reschedule, ICS import. | `app/flowgram/page.tsx` |

---

## Quickstart

```bash
# Install
npm install

# Run dev server
npm run dev
# -> http://localhost:3000
```

The fastest way to see VISR end-to-end is the demo route, which works without any environment configuration:

```
http://localhost:3000/strategyweb/dashboard/demo-cs-student-001
```

### Optional environment variables

VISR runs without any of these set: AI calls fall back to the deterministic generator and persistence falls back to localStorage. Configure them to unlock live AI and Supabase writes.

```bash
# .env.local
GROQ_API_KEY=<your_key>            # llama-3.3-70b-versatile by default
GROQ_MODEL=llama-3.3-70b-versatile

NEXT_PUBLIC_SUPABASE_URL=<url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role>   # server only

OPENWEATHER_API_KEY=<key>          # Flowgram weather banner
DATABASE_URL=<postgres_url>        # python helpers only
NEXT_PUBLIC_DEMO_PLAN_ID=demo-cs-student-001  # override for testing
```

See [`.env.example`](.env.example) for the full list and `db/README.md` for Supabase setup.

---

## Project layout

```
Pathwise/
  app/
    page.tsx                 # Landing
    layout.tsx               # Root HTML + fonts + LiquidCursor
    not-found.tsx            # 404
    flowgram/                # Daily / weekly execution surface
      page.tsx               #   Today
      week/page.tsx          #   Week
      notes/page.tsx         #   Notes inbox
      settings/page.tsx      #   City, locations, defaults
    strategyweb/             # Strategy surface
      onboarding/page.tsx    #   Multi-step onboarding + live map
      dashboard/[planId]/    #   Dashboard
      dashboard/demo-cs-student-001/   # Static demo dashboard
      opportunity/[planId]/  #   Full-page opportunity checker
    api/
      flowgram/{events,routines,settings,...}/route.ts
      strategyweb/{generate,opportunity,plan/[planId],...}/route.ts

  components/
    shared/                  # AppShell, Sidebar, LiquidCursor, CreditsModal
    flowgram/                # Day, week, settings, voice, weather, ICS, ...
    strategyweb/             # Onboarding, dashboard, graph, opportunity, UI

  lib/
    shared/                  # supabase, env (DEMO_PLAN_ID), cn, motion, cssColor
    flowgram/                # types, supabase, timelineUtils, weather, ics, ...
    strategyweb/             # types, validate, groq, prompts,
                             #   deterministic*, planStore, nodeStore, taskStore,
                             #   fixture, demoData, statusColors

  db/
    schema.sql               # Idempotent Postgres schema
    seed.sql                 # Showcase dataset
    README.md

  scripts/
    db_setup.py              # python helper: schema + seed
    db_reseed.py             # python helper: seed only
    requirements.txt

  styles/
    tokens.css               # Pastel design tokens
    globals.css              # Global typography + utilities

  docs/
    README.md                # Index of docs
    judging-notes.md         # Notes for judges (read this!)
    research.md              # Research-backed design rationale
    architecture/            # ARCHITECTURE.md, TECH_SPEC.md, ...
    diagrams/                # PlantUML diagrams (00..NN)

  public/                    # Logo, team avatars
  assets/fonts/              # Plus Jakarta Sans + Fraunces (woff2)
```

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 3 + custom pastel tokens |
| Animation | Framer Motion |
| 3D | Three.js (custom scene, no React-Three-Fiber) |
| AI | Groq Chat Completions, default `llama-3.3-70b-versatile` |
| Validation | Zod |
| Database | Supabase Postgres (`@supabase/supabase-js`) |
| State | React `useState` + `useContext`. No Redux, no Zustand. |

Dependencies are intentionally small. The project favours explicit code over abstractions.

---

## Reliability strategy

The hackathon demo is the primary judging path, so the architecture is deliberately defensive:

- **AI fallbacks**: every route that calls Groq has a deterministic backup in `lib/strategyweb/deterministic*.ts`. No API key, no network, bad JSON, schema mismatch all path-route to the deterministic generator.
- **Persistence fallbacks**: every Strategy Web store is local-first. `localStorage` is the source of truth for the client; Supabase is best-effort and merged in when an anon client is available.
- **Demo bypass**: the canonical demo plan id (`demo-cs-student-001`) skips Supabase entirely and serves the static fixture so judging works with zero env configuration.
- **Validation everywhere**: AI responses, request bodies, and Supabase rows are Zod-validated before they reach the React tree.

The result: drop the project on a fresh machine, `npm install`, `npm run dev`, open the demo URL, full product loads.

---

## Scripts

```bash
npm run dev         # Next dev server
npm run build       # Production build
npm run start       # Start production server
npm run lint        # next lint
npm run typecheck   # tsc --noEmit
```

For database operations:

```bash
pip install -r scripts/requirements.txt
python scripts/db_setup.py    # Apply schema + seed (first time)
python scripts/db_reseed.py   # Reseed the showcase dataset
```

---

## Documentation map

The repo is documented at three levels. The grading AI (and human judges) will benefit most from the first three:

- [**`docs/judging-notes.md`**](docs/judging-notes.md) - the canonical "judge me on this" file. Maps each AI screening criterion to concrete code paths in the repo. **Read this first.**
- [`docs/research.md`](docs/research.md) - the research foundation behind every design decision (goal-setting theory, cognitive load, implementation intentions, choice overload, learning analytics dashboards).
- [`docs/architecture/`](docs/architecture/) - PRD, tech spec, architecture, data model, API spec, decisions, and tasks.
- [`docs/diagrams/`](docs/diagrams/) - PlantUML diagrams (system overview, data model, sequence flows, deployment).
- [`docs/features/`](docs/features/) - per-feature PRD / TECH_SPEC / TASKS / DECISIONS history. Useful as a build log, not as user docs.
- [`db/README.md`](db/README.md) - Postgres schema setup and the localStorage <-> Supabase sync model.

---

## Demo script (60 seconds)

> "VISR is for students who are doing a lot but cannot tell what matters.
>
> This CS student is trying to land an internship. Five courses, a job, a club, two unfinished projects, an empty GitHub.
>
> VISR identifies the bottleneck: no shipped project.
>
> It builds a Strategy Map. Destination at the centre, five pillars, action nodes around each pillar, status colors at a glance.
>
> It tells them what to cut: don't join another general club, defer research, cap the current club role, double down on one complete portfolio project.
>
> Then the next 7 days as dated work, surfaced on the Flowgram day and week views alongside their calendar.
>
> When they ask 'should I join the robotics club?', VISR doesn't just say yes or no. It returns a fit score, conditions, tradeoffs, and the explicit cuts required if they accept.
>
> VISR doesn't help students do more. It helps them stop doing the wrong things."

---

## Team

VISR was built by four undergraduates at the University of Calgary:

- Ahmad Akhondi
- Khuzayma Khan
- Hamnah Khan
- Essam Akhondi

See `components/shared/CreditsModal.tsx` for the in-app credits.

---

## License

Hackathon project. All rights reserved by the team unless explicitly noted.
