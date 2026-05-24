# Feature Decisions: Graph Visual Redesign

## Decision Log

### 2026-05-23 -- Keep 3D spheres, don't switch to flat 2D circles

**Decision:**
Retain Three.js 3D `SphereGeometry` nodes. Apply pastel colors and new overlays to the existing 3D rendering pipeline.

**Reason:**
The 3D spheres are already implemented and contribute to the premium feel. The user confirmed "if its easier, keep the circles 3d." Switching to flat 2D circles would require rebuilding the node rendering and lose the depth effect.

**Alternatives Considered:**
- Flat 2D CSS circles with HTML rendering -- simpler to style but loses the 3D depth, hover parallax, and existing bob/glow animations.
- 2D canvas rendering -- still requires significant rewrite.

**Consequence:**
Labels, badges, and progress bars are rendered as HTML overlays positioned at the 3D node's projected screen coordinates. This is the existing pattern and works well for text clarity.

---

### 2026-05-23 -- Per-pillar identity colors instead of status-driven colors

**Decision:**
Each pillar gets a fixed pastel color based on its index, not its status (Strong/Okay/Weak/Missing). Status is still shown via badges and other UI indicators, just not the node sphere color.

**Reason:**
The reference image clearly shows each pillar with a unique color regardless of status. This makes the map more visually distinctive and helps users associate colors with specific life areas. Status coloring made all "Strong" pillars the same green, reducing visual variety.

**Alternatives Considered:**
- Status-driven coloring with pastel variants -- loses the distinctive identity per pillar.
- User-chosen colors -- too complex for MVP.
- Blend identity + status (e.g., tint the identity color toward red for weak) -- too subtle, increases visual complexity.

**Consequence:**
`pillarStatusColor` mapping in `graphLayout.ts` is bypassed for node coloring. It remains used for badges and status text elsewhere.

---

### 2026-05-23 -- Dashed edges with progress overlay (two-line approach)

**Decision:**
Render each goal-pillar edge as two overlapping `THREE.Line` objects: a dashed background line (full length) and a solid foreground line (partial length, proportional to completion).

**Reason:**
This approach is visually clean, performant, and easy to animate. The dashed line shows the full connection while the solid fill shows progress, matching the user's request for "dotted lines with progress bar."

**Alternatives Considered:**
- Single dashed tube with color gradient -- harder to control, shader-dependent.
- Animated particles along the edge -- more complex, potentially distracting.
- CSS-rendered edges -- doesn't integrate with 3D scene.

**Consequence:**
`EdgeRender` type gains two line references. The progress fill line's geometry is rebuilt when progress changes (or clipped via draw range). Performance impact is negligible with 5–7 edges.

---

### 2026-05-23 -- HTML overlay labels centered on nodes (not inside 3D geometry)

**Decision:**
Render labels (text, badge, progress bar) as HTML `<div>` elements absolutely positioned at each node's projected 2D screen coordinates. Do not attempt to render text inside the Three.js 3D geometry.

**Reason:**
Text rendering in Three.js (via SDF fonts, canvas textures, or troika-three-text) is complex, hard to style, and produces blurry text at non-ideal zoom levels. HTML overlays are already implemented in the codebase, produce crisp text at any zoom, and can be styled with CSS. The reference image's label style is easily achievable with HTML.

**Alternatives Considered:**
- `troika-three-text` for in-scene text -- adds a dependency, harder to style, zoom-dependent quality.
- Canvas texture for per-node billboards -- pixelated at zoom, can't easily add interactive badges.

**Consequence:**
The label overlay div (`labelsRef`) is already used. We extend each label element to include a badge span and progress bar div, all positioned at the node center.

---

### 2026-05-23 -- Compute progress in useGraphScene, not in buildGraphLayout

**Decision:**
`buildGraphLayout` remains a pure function of `pillars`, `destination`, and `mainBottleneck`. Progress and action count are computed in `useGraphScene` after layout generation, by iterating over nodes and cross-referencing `actionStates`.

**Reason:**
Adding `actionStates` as a parameter to `buildGraphLayout` couples layout computation to UI state. Since `actionStates` changes frequently (user toggling checkboxes), this would trigger unnecessary layout rebuilds. Computing progress separately in the render setup avoids this.

**Alternatives Considered:**
- Pass `actionStates` into `buildGraphLayout` -- unnecessary coupling, triggers re-layout on every toggle.
- Store progress in a separate data structure -- adds complexity without benefit.

**Consequence:**
`LayoutNode.progressPercent` and `LayoutNode.actionCount` default to 0 from layout, then are overwritten in `useGraphScene` init.

---

### 2026-05-23 -- Straight lines instead of curved arcs

**Decision:**
Replaced `CatmullRomCurve3` arcs with simple 2-point straight `THREE.Line` geometry. User explicitly requested "lines should not be curved anymore, just straight."

**Consequence:**
Simplifies edge code. `graphEdges.ts` no longer needs `TubeGeometry` or curve computation.
