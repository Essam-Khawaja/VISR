# Feature Tasks: UI Restructure and Strategy Brief

## Setup
- [x] Read feature PRD
- [x] Read feature tech spec
- [x] Check global architecture docs
- [x] Confirm implementation scope

## Implementation

### Home / branding
- [x] Update tagline to "You say what, Pathwise shows you how"
- [x] Update both card descriptions to one-line framing (zoomed-out vs day-to-day)
- [x] Remove the "Open" pill on each card
- [x] Replace "Perspective 1" / "Perspective 2" labels with "Daily Flow" / "Big Picture"

### Flowgram
- [x] Convert ICS Import button to a modal popup (not embedded inside the "Today's flow" card)
- [x] Darken time-elapsed (`TimelineConnector`) labels
- [x] Darken checkbox outline on `TimelineEvent`
- [x] Make the Reschedule modal blur the entire viewport including the top edge
- [x] Tag color update: one-time → purple, weather → yellow

### Week View
- [x] Widen day cards so titles aren't truncated/rotated
- [x] Move location to its own small line beneath the time

### Opportunity Validation
- [x] Remove the "Opportunity check" eyebrow above "Worth saying yes to?"
- [x] Enlarge and differentiate the verdict stamp from section tags/pills

### Assessments (Onboarding)
- [x] Switch layout to left/right (form left, map right) on desktop; stacked on mobile

### Strategy Web — Strategy Brief
- [x] Add `StrategyBriefPanel` overlay component
- [x] Add "Strategy Brief" button to `OrbitalDashboardSidebar`
- [x] Wire button → `DashboardLayout` state → render panel
- [x] Support Esc to close

## Integration
- [x] Ensure no regressions in `TodayOverlay`, opportunity flow, or Strategy Web
- [x] Ensure home page links still work and accent colors are kept
- [x] Ensure typography and tokens match existing palette

## Validation
- [x] Run typecheck
- [x] Run lint
- [x] Run build
- [ ] Manually test main flow on desktop

## Completion
- [x] Update feature PRD status
- [x] Update feature tech spec status
- [x] Update this task list
- [x] Add decisions to feature `DECISIONS.md`
