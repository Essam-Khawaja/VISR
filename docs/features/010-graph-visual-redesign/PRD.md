# Feature PRD: Graph Visual Redesign

## Status
Complete

## Summary

Restyle the 3D strategy map to match the reference image: pastel-colored spheres with white text labels rendered inside the nodes, a small circular badge showing action count, a horizontal progress bar per node, subtle pulse animation halos, dotted connecting lines with a solid progress fill, and smoother camera zoom behavior when selecting a pillar.

## User Problem

The current graph nodes are monochrome status-colored spheres with external HTML labels on a white background. They look functional but don't convey the "premium planner" feel. The reference image shows a warm, organic strategy map where each pillar has its own identity color, visible task count, and progress indicator -- making the graph informative at a glance without needing to click.

## User Story

As a student viewing my strategy map, I want each pillar to have a unique color, visible task count, and completion progress so I can instantly see which areas need attention without clicking.

As a hackathon judge, I want the graph to look polished and reference-image accurate, with smooth animations and visual richness that demonstrates craft.

## Reference Image Analysis

### Node Appearance
- **Center node** (goal): Large muted sage sphere (`#7D9B8A`), white label text ("B.Sc. Computer Science") rendered inside or overlaid on the sphere, a small horizontal white progress bar below the label.
- **Pillar nodes**: Medium spheres, each with a unique pastel color. White label text inside/on the sphere. A small circular badge at the top-right shows the action count (e.g., "3"). A small horizontal progress bar below the label.
- **Node halo**: A faint, larger circle (semitransparent same-color) behind each pillar node, creating a glow/pulse effect.
- **Orbit ring**: A faint dashed circle connecting the pillar ring, visible behind the nodes.

### Edge Appearance
- Lines from center to each pillar are smooth curves (currently solid tubes).
- Lines appear to be solid warm gray with no visible dashing in the reference, but user requested: "the line from the nucleus to the outside should be dotted, with the filled in bar indicating a progress bar."
- Implementation: render edges as dashed lines (small gap) with a second solid overlay line whose length is proportional to the pillar's completion percentage.

### Animations
- **Pulse**: Subtle, slow halo expansion/contraction behind each node. Not jarring, ~2-3s cycle.
- **Bob**: Existing gentle floating is good, keep it.
- **Zoom on selection**: Smoother, correctly centered. Current zoom overshoots or doesn't center on pillar.

## Requirements

### Must Have
- [ ] Per-pillar identity colors (not status-driven) from the palette defined in feature 009 PRD.
- [ ] White text labels rendered inside 3D spheres or as positioned HTML overlays directly on nodes.
- [ ] Circular action-count badge (small circle with number) at top-right of each pillar node.
- [ ] Small horizontal progress bar on each pillar node showing `completedActions / totalActions`.
- [ ] Subtle pulse animation: halo scale oscillates 1.0x–1.15x over ~3s with 0.15 opacity.
- [ ] Dotted/dashed connecting lines from goal to pillars, with a solid overlay portion indicating progress.
- [ ] Faint dashed orbit circle at the pillar ring radius.
- [ ] Fix camera zoom on pillar selection to smoothly center the selected pillar (adjust `FOCUS_CAMERA_LEAN`, potentially use `FOCUS_CAMERA_Z` relative to pillar position).
- [ ] Existing bob animation preserved.
- [ ] `prefers-reduced-motion` disables pulse and bob.

### Nice to Have
- [ ] Pillar-to-action edges also dashed with progress.
- [ ] Node shadow/depth effect on spheres for enhanced 3D feel.
- [ ] Hover glow intensifies the pulse.

### Out of Scope
- Node dialog/interaction changes (covered by feature 011).
- Data model changes (covered by feature 011).
- Color palette definition (covered by feature 009).

## UX Notes

### Labels
The reference image shows labels inside the nodes. For 3D spheres, the cleanest approach is HTML overlay labels positioned at the node center (using `project()` from Three.js world coordinates to screen coordinates). The current label system already does this but places labels *below* nodes. Moving them to center and adding the badge/progress bar to the same overlay produces the reference look.

### Progress Calculation
`progress = pillar.actions.filter(a => actionStates[a.id] === "done").length / pillar.actions.length`

If no actions exist, progress is 0.

### Zoom Fix
The current `updateCameraTargetFromSelection` uses `FOCUS_CAMERA_LEAN = 0.55` to partially offset the camera toward the pillar. The problem: with 5 pillars, the top pillar at angle -PI/2 doesn't center correctly because the lean only applies to x/y without adjusting for the pillar ring radius relative to camera Z. Solution: compute the camera offset so the pillar appears at ~40% from center, not at the edge.

## Success Criteria

- [ ] Each pillar node has a unique pastel color matching the reference palette.
- [ ] White text labels are visible on/inside each node.
- [ ] Action count badges display correctly.
- [ ] Progress bars reflect actual completion state.
- [ ] Pulse animation is visible, subtle, and respects reduced-motion.
- [ ] Edges are dashed with progress fill.
- [ ] Camera zoom centers the selected pillar smoothly.
- [ ] No performance regression (maintain 60fps on mid-range devices).
