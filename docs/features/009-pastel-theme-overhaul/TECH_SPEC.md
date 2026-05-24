# Feature Tech Spec: Pastel Theme Overhaul

## Status
Complete

## Related Docs
- Global Architecture: `docs/architecture/ARCHITECTURE.md`
- Feature PRD: [PRD.md](./PRD.md)
- Current tokens: `styles/tokens.css`
- Tailwind config: `tailwind.config.ts`

## Technical Summary

The theme overhaul is a pure token swap. The design system is already token-driven: `styles/tokens.css` defines CSS custom properties, `tailwind.config.ts` maps them to utility classes, and all components reference tokens (not hardcoded hex values). The change is to replace every token value with the new warm pastel equivalent.

## Files Expected to Change

### Primary (token definition)
- `styles/tokens.css` -- all `:root` custom property values
- `tailwind.config.ts` -- no structural changes needed (already references CSS vars)

### Secondary (hardcoded color references)
- `lib/statusColors.ts` -- no change needed (references CSS vars via `var(--success)` etc.)
- `components/graph/graphNodes.ts` -- resolveColor cache uses CSS var names; the `map` object keys match current var names. Verify `cssVar()` utility resolves updated values at runtime.
- `components/graph/graphEdges.ts` -- edge color via `cssVar("--border-strong")` and `cssVar("--border")` will auto-update.
- `components/graph/glowTexture.ts` -- glow gradient is white-to-transparent; may need warmth adjustment (`#FFF8F0` instead of `#FFFFFF`).
- `lib/cssColor.ts` -- `cssVar()` reads computed styles; no change needed.

### Verification (no code changes, visual check only)
- `components/ui/Button.tsx`
- `components/ui/Card.tsx`
- `components/ui/Badge.tsx`
- `components/ui/Input.tsx`
- `components/ui/Textarea.tsx`
- `components/ui/Skeleton.tsx`
- `components/ui/NumberDial.tsx`
- `components/layout/DashboardSidebar.tsx`
- `components/landing/LandingHero.tsx`
- `components/onboarding/OnboardingShell.tsx`
- `components/dashboard/DashboardWorkspace.tsx`
- `components/opportunity/OpportunityResult.tsx`

## Token Replacement Table

```css
:root {
  /* Surfaces */
  --bg-base: #F5F0E8;
  --bg-surface: #FDFBF7;
  --bg-elevated: #EDE8DF;

  /* Borders */
  --border: #D4CCC0;
  --border-strong: #B8AFA3;

  /* Text */
  --text-primary: #2C2520;
  --text-secondary: #6B5E52;
  --text-tertiary: #9B8E82;

  /* Accent */
  --accent: #8B6B5A;
  --accent-soft: #F0E8E0;
  --accent-glow: #8B6B5A24;
  --accent-strong: #6B4F3E;

  /* Status */
  --success: #7D9B7A;
  --success-soft: #EAF0E8;
  --warning: #C4A55A;
  --warning-soft: #F5EDD8;
  --danger: #A85A6B;
  --danger-soft: #F2E4E8;
  --danger-glow: #A85A6B24;
  --muted: #A8A095;
  --muted-soft: #EDEBE7;

  /* Shadows (warm undertone) */
  --shadow-sm: 0 8px 26px rgba(60, 48, 36, 0.06);
  --shadow-md: 0 18px 50px rgba(60, 48, 36, 0.1);
  --shadow-lg: 0 28px 80px rgba(60, 48, 36, 0.14);
  --shadow-focus: 0 0 0 3px rgba(139, 107, 90, 0.22);
}
```

## Graph Node Pastel Palette

The existing `pillarStatusColor` map drives node colors by status (Strong/Okay/Weak/Missing). Feature 010 will change this to per-pillar identity colors. For this feature, we only update the status color CSS vars so existing status-driven colors become muted pastels.

## State Management

No state changes. This is a pure visual/CSS change.

## Validation

- [ ] `npm run typecheck` -- no type changes
- [ ] `npm run lint` -- no code changes
- [ ] `npm run build` -- verify clean build
- [ ] Visual: check every page for readability, contrast, color correctness
- [ ] Graph: verify Three.js nodes resolve new colors (may need to clear `colorCache` in `graphNodes.ts` if colors are stale across hot reloads)
