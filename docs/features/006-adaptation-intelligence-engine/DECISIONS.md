# Feature Decisions: Adaptation Intelligence Engine

## Decision Log

### 2026-05-23 — Rule-based engine first (not AI agent)

**Decision:**  
MVP adaptation is deterministic rules over counts and tags. No autonomous LLM editing the roadmap.

**Reason:**  
Explainable, testable, safe for hackathon demo. Matches "smart enough" without overbuilding.

**Alternatives Considered:**  
- LLM agent with tool calls to edit roadmap  
- Collaborative filtering across students

**Consequence:**  
Product intelligence is transparent; copy can cite reasons ("inactive for 4 weeks").

---

### 2026-05-23 — Deprioritize, do not delete nodes

**Decision:**  
Inactive branches lower `priority` and fade in UI. Nodes are never removed automatically in MVP.

**Reason:**  
Avoids destructive surprises; student can revive path if interest returns.

**Alternatives Considered:**  
- Auto-prune subgraph  
- Archive with undo

**Consequence:**  
Roadmaps may grow; cap template size at generation time instead.

---

### 2026-05-23 — Goal drift = prompt, not auto-change

**Decision:**  
When drift detected, show confirm/update goal UI. System does not change `primaryGoal` silently.

**Reason:**  
Trust and alignment with student agency; long-term goal should not move without consent.

**Alternatives Considered:**  
- Auto-update goal from behavior  
- Ignore drift

**Consequence:**  
Adaptation still adjusts node priorities; goal text waits for user confirmation.
