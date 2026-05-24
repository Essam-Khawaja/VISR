# Feature Decisions: Pastel Theme Overhaul

## Decision Log

### 2026-05-23 -- Warm earthy pastels over cool blue palette

**Decision:**
Replace the entire color system with warm, earthy pastel tones: cream backgrounds, warm brown text, muted sage/mauve/gold status colors.

**Reason:**
The reference design uses an organic, warm color palette that feels premium and distinctive. The current cool blue/slate palette looks generic. The warm tones better match the "personal strategist" brand of VISR.

**Alternatives Considered:**
- Keep blue but mute it -- rejected; still looks like every other SaaS product.
- Dark mode with warm tones -- deferred; warm light theme is the priority.
- Per-page color schemes -- rejected; cohesive identity is more impactful.

**Consequence:**
Every page inherits the new palette via CSS custom properties. No component code changes required. The Three.js graph will resolve updated colors at runtime via `cssVar()`.

---

### 2026-05-23 -- Token-only change, no component refactoring

**Decision:**
Limit the change to `styles/tokens.css` values only. Do not restructure the token system or add new tokens.

**Reason:**
The existing token architecture is sound. All components already reference tokens via Tailwind utilities or CSS vars. A pure value swap is the fastest path with zero regression risk.

**Alternatives Considered:**
- Add semantic color roles (e.g., `--pillar-academics`, `--pillar-skills`) -- deferred to feature 010 which adds per-pillar identity colors.
- Add dark mode tokens now -- out of scope.

**Consequence:**
Feature 010 will need to add new tokens for per-pillar colors. This feature only changes the base palette.

---

### 2026-05-23 -- Muted pastels maintain WCAG AA contrast

**Decision:**
Use darker pastel shades (not pastel tints) to ensure sufficient contrast against warm backgrounds. For example, `--danger` is `#A85A6B` (dark dusty rose) not `#F4B4C4` (light pink).

**Reason:**
Light pastels on cream backgrounds fail accessibility contrast requirements. The reference image uses medium-value saturated pastels that read well on both light and colored backgrounds.

**Alternatives Considered:**
- Light pastels with dark outlines -- more complex, harder to maintain.
- Dark text on pastel badges instead of white -- inconsistent with reference image.

**Consequence:**
Badge text, graph node labels, and status indicators use white text on the darker pastel backgrounds. Body text uses warm dark brown on cream.

---

### 2026-05-23 -- Glow texture warmed to match palette

**Decision:**
Changed `glowTexture.ts` gradient from pure white `rgba(255,255,255,...)` to warm white `rgba(255,248,240,...)`.

**Reason:**
Pure white glows looked cold against the warm pastel palette. The warm tint makes the glow harmonize with the cream surfaces.
