# Feature Decisions: User Foundation Layer

## Decision Log

### 2026-05-23 — Single primary goal for MVP

**Decision:**  
Store one `primaryGoal` string per profile. Secondary goals deferred to post-MVP.

**Reason:**  
Simplifies roadmap generation and adaptation scoring. Ambitious students often have one north star; multiple goals add conflict resolution the product is not ready to handle.

**Alternatives Considered:**  
- Multiple goals with weights  
- Goal hierarchy (primary + secondary array)

**Consequence:**  
Roadmap Engine and Adaptation Engine key off `primaryGoal` only until profile schema evolves.

---

### 2026-05-23 — Interests stored as tags

**Decision:**  
`interests` is `string[]` of normalized lowercase tags (e.g. `health-tech`, `ml`, `startups`).

**Reason:**  
Easy to match against roadmap node metadata and adaptation signals without NLP in MVP.

**Alternatives Considered:**  
- Free-text only  
- Structured taxonomy with IDs

**Consequence:**  
Onboarding UI should encourage tag selection; free-text entries normalized on save.
