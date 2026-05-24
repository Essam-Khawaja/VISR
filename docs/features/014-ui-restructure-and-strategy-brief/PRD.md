# Feature PRD: UI Restructure and Strategy Brief

## Status
In Progress

## Summary
Sharpen Pathwise's branding and polish across the home page, Flowgram, Week View, Opportunity Validation, and Assessments pages, then add a new "Strategy Brief" panel on the Strategy Web that explains the current plan in one scannable view.

## User Problem
The product positioning isn't tight: the home page mixes generic copy and "Perspective 1/2" labels that don't sell the value. Several flow pages have small but cumulative friction (cramped Week View cards, embedded import flow, unreadable time labels, unblurred edges on a modal, blurry tag colors). The Strategy Web is visual but never explains itself, so users can't see "where I'm going, how aligned, what's blocking me, what to cut, and what to watch" without leaving the page.

## User Story
As an overwhelmed university student, I want a clean entry point that names what Pathwise does, day-to-day pages that are easy to read, and a one-tap brief that explains my strategy web, so I can act on my plan instead of decoding the interface.

## Main User Flow
1. User lands on `/` and immediately reads the tagline "You say what, Pathwise shows you how" with two clear cards: Daily Flow and Big Picture.
2. User clicks Daily Flow → Flowgram. The "Today's flow" header has Import as a popup (modal), tag colors are clearer, gap labels are readable, and the Reschedule modal blurs the full background.
3. User opens Week View. Each task card fits the title without rotating; location sits below the time as a smaller line.
4. User opens Opportunity Validation. The verdict ("Say No" etc.) is visually distinct from the smaller tags; no redundant "Opportunity check" eyebrow above "Worth saying yes to?"
5. User opens Assessments. The onboarding form is on the left, the live strategy graph is on the right.
6. User opens the Strategy Web. The web itself is unchanged. A new "Strategy Brief" button appears in the bottom-left button cluster. Clicking it slides in a panel with: Destination, Alignment Score, Main Bottleneck, Strategic Priorities (≤5), Cut/Defer/Keep/Double Down, Risks. The web remains visible behind it.

## Requirements

### Must Have
- [ ] Home page tagline changed to "You say what, Pathwise shows you how"
- [ ] Home page card descriptions: one liner each, framing Strategy Web as global/zoomed-out and StraighterNoodles as day-to-day
- [ ] Remove the "Open" badge on home page cards
- [ ] Replace "Perspective 1/2" labels with "Daily Flow" / "Big Picture" (keep accent colors)
- [ ] Flowgram: Import button opens a proper modal (not inline panel)
- [ ] Flowgram: time-elapsed gap labels in darker color
- [ ] Flowgram: checkbox circles on tasks use darker outline
- [ ] Flowgram: Reschedule modal blurs the full viewport (no unblurred strip at top)
- [ ] Flowgram: packing list tag colors — One-time = purple, Weather = yellow (one-time keeps its accent if already purple, but distinct from weather)
- [ ] Week View: cards wide enough to fit task titles on one or two lines without rotation
- [ ] Week View: location separated, shown smaller below the time line
- [ ] Opportunity Validation: remove the small "Opportunity check" eyebrow above "Worth saying yes to?"
- [ ] Opportunity Validation: verdict stamp visually distinct from tag pills and larger
- [ ] Assessments page: form on the left, strategy graph on the right (desktop)
- [ ] Strategy Web: do not change the visual layout, web, sidebar, or existing buttons
- [ ] Strategy Web: add a "Strategy Brief" button beside existing bottom-left buttons, matching their style
- [ ] Strategy Brief panel contains: Destination, Alignment Score (with interpretation), Main Bottleneck, up to 5 Strategic Priorities (each mapped to a pillar), Cut/Defer/Keep/Double Down, 2–3 Risks
- [ ] Strategy Brief panel keeps the Strategy Web visible behind it (overlay/drawer)
- [ ] Strategy Brief reuses existing theme tokens (cream background, muted accents, rounded pills, serif headings where used today)

### Nice to Have
- [ ] Smooth slide-in animation for the Strategy Brief
- [ ] Strategy Brief is keyboard-dismissable (Esc)

## Out of Scope
- Redesigning the Strategy Web canvas, sidebar rail, or button group itself
- Adding a separate analysis page
- New data fields on `StrategyPlan`
- Mobile-specific reflow beyond what falls out naturally from the desktop changes

## UX Notes
- Strategy Brief should be a right-side drawer on desktop (≈ 420px wide) overlaying the web, with a soft backdrop tint rather than a hard scrim so the web stays visible.
- Use existing `--bg-surface`, `--border`, soft pills, and the warm cream background. No new visual language.
- Tone: executive summary, scannable, no dense paragraphs.
- Color cues inside the brief: bottleneck/cut → danger; defer/risk → warning; keep → muted; double down → success; priorities → pillar accents from the web.

## Success Criteria
This feature is complete when:
- [ ] Each page's listed changes ship and look correct on the desktop demo viewport
- [ ] Strategy Brief opens/closes without breaking the underlying Strategy Web state
- [ ] No new TypeScript errors, lint errors, or build failures
- [ ] The hackathon demo flow (home → strategy web → brief → opportunity) reads cleanly end-to-end
