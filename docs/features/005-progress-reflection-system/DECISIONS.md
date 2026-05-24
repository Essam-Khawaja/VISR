# Feature Decisions: Progress + Reflection System

## Decision Log

### 2026-05-23 — Reflection required on completion

**Decision:**  
Tasks cannot move to `completed` without a reflection of at least 50 characters.

**Reason:**  
Core product differentiator vs to-do apps; forces learning accountability.

**Alternatives Considered:**  
- Optional reflection  
- Multiple choice "how did it go" only

**Consequence:**  
Friction is intentional; keep prompt short and friendly to reduce abandonment.

---

### 2026-05-23 — No heavy analytics at MVP

**Decision:**  
Only simple counters (tasks/week, nodes completed). No charts, streaks, or ML on reflection text.

**Reason:**  
Hackathon scope; adaptation engine uses rules not NLP initially.

**Alternatives Considered:**  
- Sentiment analysis on reflections  
- Engagement dashboards

**Consequence:**  
Feature 006 reads structured signals (completion rate, skip rate) not reflection semantics.

---

### 2026-05-23 — One task per node for MVP

**Decision:**  
Each weekly task maps 1:1 to a roadmap node for status updates.

**Reason:**  
Simplifies node completion logic.

**Alternatives Considered:**  
- Multiple tasks per node with partial progress %

**Consequence:**  
Post-MVP: add `progress` 0–100 on nodes for multi-step milestones.
