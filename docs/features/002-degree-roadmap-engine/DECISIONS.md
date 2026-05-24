# Feature Decisions: Degree Roadmap Engine

## Decision Log

### 2026-05-23 — Hybrid generator (rules first, AI optional)

**Decision:**  
MVP uses rule-based templates keyed by goal category. Optional LLM pass enriches labels/descriptions only—not structure.

**Reason:**  
Predictable demo output, faster hackathon delivery, easier debugging. Full AI generation risks hallucinated clubs/courses.

**Alternatives Considered:**  
- Pure rule-based  
- Full AI-generated roadmap

**Consequence:**  
Maintain template files under `lib/roadmap/templates/`. AI calls gated behind env flag.

---

### 2026-05-23 — Four-year structure with focus themes

**Decision:**  
Each year has a `focus` string: Year 1–2 exploration, Year 3 specialization, Year 4 career prep (adjustable by current `yearOfStudy`).

**Reason:**  
Matches product narrative and gives Weekly Execution context for what "kind" of work to suggest now.

**Alternatives Considered:**  
- Flat list of nodes without years  
- Semester-only breakdown

**Consequence:**  
Task generator filters nodes by current academic year and status.
