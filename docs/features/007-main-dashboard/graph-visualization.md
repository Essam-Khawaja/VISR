# Dashboard Component: Graph Visualization

## Parent feature
[007-main-dashboard](PRD.md)

## Backend module
[003-graph-visualization](../003-graph-visualization/) — owns graph library, node mapping, styling rules.

## Role on dashboard
The **hero visualization** — occupies ~60% of viewport width on desktop. This is the primary product surface ("the graph is the page").

## Embedded behavior
- Render inside `DashboardLayout` main column, not a separate `/graph` route (optional `/graph` redirect to dashboard for MVP).
- Map `Roadmap` → React Flow nodes/edges per 003 tech spec.
- Bottleneck node (if `linkedNodeId` on strategy snapshot): apply emphasis style (pulse border / accent) per dashboard DECISIONS.
- Node click → side drawer or popover: label, type, status, link to related weekly task if exists.
- Low-priority nodes (adaptation): reduced opacity.

## Dashboard-specific interactions
| Action | Result |
|--------|--------|
| Click bottleneck-linked node | Scroll/highlight bottleneck card |
| Hover node | Pause subtle layout drift if animations enabled |
| Empty roadmap | Show CTA: "Generate your path" |

## Acceptance criteria
- [ ] Graph fills hero region; pan/zoom functional
- [ ] Status legend visible (compact, corner overlay)
- [ ] Bottleneck node visually dominant when set
- [ ] Completing task (005) updates node color on dashboard refresh
