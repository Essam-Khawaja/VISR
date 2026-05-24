# Feature Tasks: UI Restructure and Strategy Brief

## Setup
- [x] Read feature PRD
- [x] Read feature tech spec
- [x] Check global architecture docs
- [x] Confirm implementation scope

## Implementation

### Home / branding
- [ ] Update tagline to "You say what, Pathwise shows you how"
- [ ] Update both card descriptions to one-line framing (zoomed-out vs day-to-day)
- [ ] Remove the "Open" pill on each card
- [ ] Replace "Perspective 1" / "Perspective 2" labels with "Daily Flow" / "Big Picture"

### Flowgram
- [ ] Convert ICS Import button to a modal popup (not embedded inside the "Today's flow" card)
- [ ] Darken time-elapsed (`TimelineConnector`) labels
- [ ] Darken checkbox outline on `TimelineEvent`
- [ ] Make the Reschedule modal blur the entire viewport including the top edge
- [ ] Tag color update: one-time → purple, weather → yellow

### Week View
- [ ] Widen day cards so titles aren't truncated/rotated
- [ ] Move location to its own small line beneath the time

### Opportunity Validation
- [ ] Remove the "Opportunity check" eyebrow above "Worth saying yes to?"
- [ ] Enlarge and differentiate the verdict stamp from section tags/pills

### Assessments (Onboarding)
- [ ] Switch layout to left/right (form left, map right) on desktop; stacked on mobile

### Strategy Web — Strategy Brief
- [ ] Add `StrategyBriefPanel` overlay component
- [ ] Add "Strategy Brief" button to `OrbitalDashboardSidebar`
- [ ] Wire button → `DashboardLayout` state → render panel
- [ ] Support Esc to close

## Integration
- [ ] Ensure no regressions in `TodayOverlay`, opportunity flow, or Strategy Web
- [ ] Ensure home page links still work and accent colors are kept
- [ ] Ensure typography and tokens match existing palette

## Validation
- [ ] Run typecheck
- [ ] Run lint
- [ ] Run build
- [ ] Manually test main flow on desktop

## Completion
- [ ] Update feature PRD status
- [ ] Update feature tech spec status
- [ ] Update this task list
- [ ] Add decisions to feature `DECISIONS.md`
