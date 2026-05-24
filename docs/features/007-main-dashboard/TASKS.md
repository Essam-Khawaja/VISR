# Feature Tasks: Main Dashboard

## Setup
- [ ] Read feature PRD and tech spec
- [ ] Read sub-component docs (roadmap, graph, bottleneck, cut-list)
- [ ] Read 002 and 003 module specs
- [ ] Review global design tokens in architecture PRD

## Layout shell
- [ ] Create `/dashboard` route
- [ ] Build `DashboardLayout` (header + 60/40 grid)
- [ ] Build `DashboardHeader` (destination, stage, bottleneck summary, score, route badge)
- [ ] Add loading skeleton for full page
- [ ] Add empty state (no profile → redirect onboarding)

## Integrate roadmap (002)
- [ ] Implement `GET /api/dashboard` aggregating profile + roadmap
- [ ] Auto-trigger roadmap generate if missing
- [ ] Wire header `destination` and `currentStage` from roadmap + profile
- [ ] See [degree-roadmap-engine.md](degree-roadmap-engine.md) checklist

## Integrate graph (003)
- [ ] Embed `RoadmapGraph` in hero column
- [ ] Pass roadmap + node statuses into graph
- [ ] Implement bottleneck node highlight via `linkedNodeId`
- [ ] Node click → detail popover
- [ ] See [graph-visualization.md](graph-visualization.md) checklist

## Bottleneck
- [ ] Implement `lib/strategy/bottleneck.ts` heuristics
- [ ] Build `BottleneckCard` component
- [ ] Show bottleneck one-liner in header
- [ ] Link card CTA to weekly tasks route (004)
- [ ] See [bottleneck.md](bottleneck.md) checklist

## Cut list
- [ ] Implement `lib/strategy/cutList.ts` from commitments + roadmap + bottleneck
- [ ] Build `CutListCard` with four categories
- [ ] Ensure each item has goal/bottleneck-specific reason
- [ ] See [cut-list.md](cut-list.md) checklist

## Strategy snapshot
- [ ] Implement `buildStrategySnapshot`
- [ ] Implement alignment score + route status
- [ ] Optional: persist snapshot table for history (post-MVP)

## Integration
- [ ] Redirect post-onboarding to `/dashboard`
- [ ] Revalidate dashboard after task complete (005)
- [ ] Revalidate after adaptation run (006)
- [ ] Nav link: Dashboard | Weekly Tasks

## Validation
- [ ] Manual: full flow onboarding → dashboard with graph + cards
- [ ] Verify bottleneck + cut copy references real goal text
- [ ] Run typecheck, lint, build

## Completion
- [ ] Update PRD/tech spec status
- [ ] Update 002/003 integration notes if needed
- [ ] Update features README
- [ ] Log decisions in `DECISIONS.md`
