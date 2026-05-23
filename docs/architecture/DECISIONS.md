# Global Decision Log

## 2026-05-23 — MVP persistence and API (see feature 02)

**Decision:**  
User plans persist in `localStorage` via `lib/planStore.ts`. Strategy generation and opportunity scoring use `POST /api/generate` and `POST /api/opportunity` with optional OpenAI and deterministic fallbacks. Demo plan remains fixture-based at `demo-cs-student-001`.

**Reason:**  
Hackathon scope: one device, one user, no auth. APIs give a real generation path; localStorage gives reload survival without Supabase setup.

**Consequence:**  
See `docs/features/02-strategy-mvp/` and `docs/architecture/API_SPEC.md`. Dashboard and opportunity pages hydrate client-side through `PlanProvider`.

---

## 2026-05-23 — Light visual system (see feature 02)

**Decision:**  
App commits to a light, white-base, grayscale-with-accent design. Dark HUD chrome (Grain, GlowFollow, ScanLine, Reticle on surfaces) removed from root layout.

**Reason:**  
Product direction for daily-driver calm UI; see feature PRD for token palette.

**Consequence:**  
`styles/tokens.css` rewritten; graph uses normal blending on light background.

---

## YYYY-MM-DD — Decision Title

**Decision:**  
What did we decide?

**Reason:**  
Why did we choose this?

**Alternatives Considered:**  
- Option 1
- Option 2

**Consequence:**  
What does this affect?
