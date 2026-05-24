# Feature Decisions: Weekly Execution System

## Decision Log

### 2026-05-23 — Fixed weekly cycle (not daily)

**Decision:**  
Plans are scoped to calendar weeks. No daily task breakdown in MVP.

**Reason:**  
Matches university rhythm; reduces notification noise; simpler generator.

**Alternatives Considered:**  
- Daily top-3 tasks  
- Bi-weekly sprints

**Consequence:**  
All accountability prompts (Feature 005) trigger on task completion, not end-of-day.

---

### 2026-05-23 — Default 5 tasks per week

**Decision:**  
Generator targets 5 tasks; hard cap 7, soft floor 3 if eligible nodes scarce.

**Reason:**  
Enough to feel productive without overwhelming scattered students.

**Alternatives Considered:**  
- User-configurable count  
- Single "one thing" mode

**Consequence:**  
Generator must handle sparse roadmaps gracefully.

---

### 2026-05-23 — Incomplete tasks do not auto-roll (MVP)

**Decision:**  
Incomplete tasks at week end are marked `skipped` in history; new week gets fresh selection. No automatic rollover.

**Reason:**  
Avoids snowball guilt lists; adaptation engine handles deprioritization separately.

**Alternatives Considered:**  
- Roll over high-priority incomplete tasks

**Consequence:**  
Post-MVP: optional rollover flag per task priority.
