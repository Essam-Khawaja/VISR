# Feature PRD: Pastel Theme Overhaul

## Status
Complete

## Summary

Replace the current cool blue/slate UI palette with a warm, earthy pastel color system inspired by the reference design. Every surface, border, text color, accent, and status indicator shifts to muted organic tones -- cream backgrounds, warm gray borders, sage/mauve/dusty-rose accents. The change is sitewide: landing page, onboarding, dashboard, strategy map, opportunity checker, and all UI primitives.

## User Problem

The current blue/white command-center aesthetic feels generic and cold. Hackathon judges and student users should immediately perceive VISR as premium, calm, and intentional. The warm pastel palette creates a distinctive visual identity that differentiates from every other blue SaaS product.

## User Story

As a student opening VISR, I want the interface to feel warm, organic, and calming -- like a thoughtfully designed planner, not a corporate dashboard -- so I feel comfortable being honest about my goals and constraints.

As a hackathon judge, I want the product to have a distinctive, cohesive visual identity that signals design craft.

## Reference Palette (extracted from design reference)

### Surfaces
| Token | Current | New | Description |
|---|---|---|---|
| `--bg-base` | `#F6F8FC` (cool gray) | `#F5F0E8` | Warm cream/parchment background |
| `--bg-surface` | `#FFFFFF` | `#FDFBF7` | Off-white warm surface |
| `--bg-elevated` | `#EEF3FA` (blue tint) | `#EDE8DF` | Warm tan elevated |

### Borders
| Token | Current | New |
|---|---|---|
| `--border` | `#D9E2EF` | `#D4CCC0` |
| `--border-strong` | `#B8C7DA` | `#B8AFA3` |

### Text
| Token | Current | New |
|---|---|---|
| `--text-primary` | `#172033` (navy) | `#2C2520` (warm dark brown) |
| `--text-secondary` | `#53657F` | `#6B5E52` |
| `--text-tertiary` | `#7A8AA3` | `#9B8E82` |

### Accent
| Token | Current | New | Usage |
|---|---|---|---|
| `--accent` | `#2563EB` (bright blue) | `#8B6B5A` (warm brown) | Primary CTA, focus rings |
| `--accent-soft` | `#E8F1FF` | `#F0E8E0` | Soft accent backgrounds |
| `--accent-strong` | `#1746A2` | `#6B4F3E` | Hover/pressed states |

### Status Colors (muted pastel versions)
| Token | Current | New |
|---|---|---|
| `--success` | `#059669` | `#7D9B7A` (muted sage) |
| `--success-soft` | `#E7F8EF` | `#EAF0E8` |
| `--warning` | `#D97706` | `#C4A55A` (warm gold) |
| `--warning-soft` | `#FFF4DA` | `#F5EDD8` |
| `--danger` | `#E11D48` | `#A85A6B` (dusty rose) |
| `--danger-soft` | `#FFE8EE` | `#F2E4E8` |
| `--muted` | `#94A3B8` | `#A8A095` (warm gray) |
| `--muted-soft` | `#EEF2F7` | `#EDEBE7` |

### Graph Node Palette (unique per pillar)
These are the identity colors for strategy-map pillar nodes. Each pillar gets a distinct muted pastel, assigned in order:

| Index | Name example | Color | Hex |
|---|---|---|---|
| 0 | Academics | Deep mauve | `#8B4A6B` |
| 1 | Wellness | Olive khaki | `#9B9267` |
| 2 | Experience | Dusty rose | `#B5707E` |
| 3 | Network | Warm tan | `#C4A882` |
| 4 | Skills | Sage green | `#8FA68B` |
| 5 | (overflow) | Muted plum | `#7E6B8A` |

Center (goal) node: muted sage `#7D9B8A`.

### Shadows (warmer undertone)
| Token | New |
|---|---|
| `--shadow-sm` | `0 8px 26px rgba(60, 48, 36, 0.06)` |
| `--shadow-md` | `0 18px 50px rgba(60, 48, 36, 0.1)` |
| `--shadow-lg` | `0 28px 80px rgba(60, 48, 36, 0.14)` |
| `--shadow-focus` | `0 0 0 3px rgba(139, 107, 90, 0.22)` |

## Requirements

### Must Have
- [ ] All CSS custom properties in `styles/tokens.css` updated to new pastel values.
- [ ] Tailwind theme in `tailwind.config.ts` unchanged structurally (still reads from CSS vars) -- only token values change.
- [ ] Status color maps in `lib/statusColors.ts` still reference CSS vars (no change needed if tokens change).
- [ ] Three.js graph node colors in `graphNodes.ts` resolve new CSS var values correctly.
- [ ] Edge colors in `graphEdges.ts` resolve new border tokens.
- [ ] All UI primitives (`Button`, `Card`, `Badge`, `Input`, `Textarea`, `Skeleton`, `NumberDial`) inherit the new palette via tokens.
- [ ] Landing page hero, onboarding flow, dashboard workspace, and opportunity checker all display correctly with new palette.
- [ ] `glowTexture.ts` halo effect still works (may need opacity/blending adjustment for warm tones).

### Nice to Have
- [ ] Dark mode variant of the pastel palette (out of scope for hackathon but token structure should not block it).
- [ ] Gradient overlays on surfaces for extra depth.

### Out of Scope
- Changing component layout or structure.
- Adding new components.
- Modifying the graph interaction model (covered by features 010 and 011).

## UX Notes

### Visual tone
Warm, organic, like a premium notebook or planner app. Think Notion's warm gray, but with more color personality. White text on colored graph nodes; warm brown text on light surfaces.

### Accessibility
Contrast ratios must remain WCAG AA compliant. The muted pastels are darker than typical pastels specifically to maintain readability against warm backgrounds.

### Testing
- Visually inspect every page: `/`, `/onboarding`, `/dashboard/demo-cs-student-001`, `/opportunity/demo-cs-student-001`.
- Verify the 3D graph nodes render with correct colors (CSS var resolution happens at runtime).
- Check focus rings are visible against the cream background.

## Success Criteria

This feature is complete when:
- [ ] Every page uses the warm pastel palette with no cool blue remnants.
- [ ] The strategy map nodes match the reference image's color family.
- [ ] Text remains readable on all surfaces (AA contrast minimum).
- [ ] Build passes with no visual regressions in the main flows.
