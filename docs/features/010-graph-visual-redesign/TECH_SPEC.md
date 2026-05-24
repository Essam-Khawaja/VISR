# Feature Tech Spec: Graph Visual Redesign

## Status
Complete

## Related Docs
- Global Architecture: `docs/architecture/ARCHITECTURE.md`
- Feature PRD: [PRD.md](./PRD.md)
- Feature 009 (Pastel Theme): `docs/features/009-pastel-theme-overhaul/`

## Technical Summary

This feature modifies the Three.js graph rendering pipeline to match the reference image. Changes span node creation, edge rendering, animation loops, layout constants, type extensions, and the HTML label overlay system.

## Files Expected to Change

| File | Change |
|---|---|
| `components/graph/graphTypes.ts` | Extend `LayoutNode` with `progressPercent`, `actionCount`, `pastelColor` |
| `components/graph/graphLayout.ts` | Assign per-pillar pastel colors, compute progress, add orbit ring data |
| `components/graph/graphNodes.ts` | Use `pastelColor` for node mesh, add pulse halo mesh |
| `components/graph/graphEdges.ts` | Render dashed lines + solid progress overlay |
| `components/graph/graphAnimations.ts` | Add pulse animation constants |
| `components/graph/useGraphScene.ts` | Drive pulse animation loop, fix zoom math, render orbit ring |
| `components/graph/GoalTree.tsx` | Update HTML label overlay: center on node, add badge + progress bar |

## Detailed Changes

### 1. Type Extensions (`graphTypes.ts`)

```typescript
export type LayoutNode = GraphNodeData & {
  position: [number, number, number];
  radius: number;
  parentId: string | null;
  // New fields
  pastelColor: string;        // hex like "#8B4A6B"
  progressPercent: number;    // 0–1
  actionCount: number;        // total actions for pillar, 0 for goal/action nodes
};
```

`LayoutEdge` gets an optional `progressPercent`:

```typescript
export type LayoutEdge = {
  // ...existing fields...
  progressPercent?: number;   // 0–1, for progress fill on goal-pillar edges
};
```

### 2. Layout Changes (`graphLayout.ts`)

**Pillar pastel assignment:**

```typescript
const PILLAR_PASTELS = [
  "#8B4A6B", // deep mauve
  "#9B9267", // olive khaki
  "#B5707E", // dusty rose
  "#C4A882", // warm tan
  "#8FA68B", // sage green
  "#7E6B8A", // muted plum (overflow)
];

const GOAL_PASTEL = "#7D9B8A";
```

Each pillar node gets `pastelColor: PILLAR_PASTELS[i % PILLAR_PASTELS.length]` and its `color` field set to the same value (replacing the status-driven `pillarStatusColor[pillar.status]`).

**Progress computation:**

```typescript
const doneCount = pillar.actions.filter(a => 
  actionStatesRef.current?.[a.id] === "done"
).length;
const progressPercent = pillar.actions.length > 0 
  ? doneCount / pillar.actions.length 
  : 0;
```

Note: `buildGraphLayout` doesn't currently have access to `actionStates`. Two options:
1. Pass `actionStates` into `buildGraphLayout` (adds a parameter).
2. Compute progress in `useGraphScene` after layout is built and mutate node objects.

**Decision**: Option 2 is less invasive. Compute progress in `useGraphScene` and set `progressPercent`/`actionCount` on each `LayoutNode` before passing to `createNodeMesh`.

**Orbit ring:**

Add a `THREE.RingGeometry` or dashed `THREE.Line` at `PILLAR_RADIUS` distance from center in `useGraphScene`. This is a static visual element, not per-node.

```typescript
const orbitGeo = new THREE.RingGeometry(PILLAR_RADIUS - 0.02, PILLAR_RADIUS + 0.02, 128);
const orbitMat = new THREE.MeshBasicMaterial({
  color: hexToThreeColor(cssVar("--border", "#D4CCC0")),
  transparent: true,
  opacity: 0.25,
  side: THREE.DoubleSide,
});
const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);
root.add(orbitMesh);
```

For dashed appearance, use `THREE.LineDashedMaterial` with a circular `BufferGeometry`.

### 3. Node Rendering (`graphNodes.ts`)

**Color source change:**

Replace `resolveColor(node.color)` with direct hex parsing of `node.pastelColor`:

```typescript
const colorHex = hexToThreeColor(node.pastelColor);
```

The existing `node.color` field (CSS var reference) remains for backward compatibility but `pastelColor` takes precedence when present.

**Pulse halo mesh:**

Add a second sprite or ring mesh specifically for the pulse effect:

```typescript
// Pulse halo: larger, lower opacity, scale animated in useGraphScene
const pulseHaloMat = new THREE.SpriteMaterial({
  map: getGlowTexture(),
  color,
  transparent: true,
  blending: THREE.NormalBlending,
  depthWrite: false,
  opacity: 0,
});
const pulseHalo = new THREE.Sprite(pulseHaloMat);
pulseHalo.scale.setScalar(node.radius * 8);
group.add(pulseHalo);
```

Add `pulseHalo: THREE.Sprite` to the `NodeMesh` type.

### 4. Edge Rendering (`graphEdges.ts`)

**Dashed line approach:**

Replace the solid `TubeGeometry` with a `THREE.Line` using `LineDashedMaterial`:

```typescript
const dashMat = new THREE.LineDashedMaterial({
  color: hexToThreeColor(cssVar("--border", "#D4CCC0")),
  dashSize: 0.15,
  gapSize: 0.08,
  transparent: true,
  opacity: 0,
});
const curve = new THREE.CatmullRomCurve3([...]);
const points = curve.getPoints(64);
const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
const dashLine = new THREE.Line(lineGeo, dashMat);
dashLine.computeLineDistances(); // required for dashing
```

**Progress fill overlay:**

A second solid line rendered on top, using only the first `progressPercent * 100%` of the curve points:

```typescript
const fillCount = Math.max(2, Math.floor(points.length * (edge.progressPercent ?? 0)));
const fillPoints = points.slice(0, fillCount);
const fillGeo = new THREE.BufferGeometry().setFromPoints(fillPoints);
const fillMat = new THREE.LineBasicMaterial({
  color: hexToThreeColor(pilllarPastelColor),
  transparent: true,
  opacity: 0,
  linewidth: 2, // note: linewidth >1 only works in some renderers
});
const fillLine = new THREE.Line(fillGeo, fillMat);
```

Add both `dashLine` and `fillLine` to the `EdgeRender` type.

### 5. Animation Constants (`graphAnimations.ts`)

```typescript
export const PULSE_MIN_SCALE = 1.0;
export const PULSE_MAX_SCALE = 1.15;
export const PULSE_SPEED = 0.8;     // cycles per second (≈3s full cycle at 2*PI)
export const PULSE_MAX_OPACITY = 0.15;
```

### 6. Scene Changes (`useGraphScene.ts`)

**Pulse animation in `animate()` loop:**

```typescript
nodeMeshes.forEach((nm) => {
  if (nm.pulseHalo && nm.currentOpacity > 0.1 && !reduceMotion) {
    const pulseT = Math.sin(seconds * PULSE_SPEED * Math.PI * 2 + nm.bobPhase);
    const pulseScale = PULSE_MIN_SCALE + (PULSE_MAX_SCALE - PULSE_MIN_SCALE) * (pulseT * 0.5 + 0.5);
    nm.pulseHalo.scale.setScalar(nm.data.radius * 8 * pulseScale);
    (nm.pulseHalo.material as THREE.SpriteMaterial).opacity = 
      nm.currentOpacity * PULSE_MAX_OPACITY * (pulseT * 0.5 + 0.5);
  }
});
```

**Zoom fix:**

Adjust `updateCameraTargetFromSelection`:

```typescript
const px = pillar.basePosition.x;
const py = pillar.basePosition.y;
const dist = Math.hypot(px, py);
// Center the pillar at ~30% from screen center, not edge
const lean = dist > 0 ? 0.35 : 0;
cameraTargetX = px * lean;
cameraTargetY = py * lean;
cameraTargetZ = FOCUS_CAMERA_Z;
lookAtTargetX = px * 0.5;
lookAtTargetY = py * 0.5;
```

This ensures the selected pillar appears centered in the viewport with its action nodes visible around it.

### 7. HTML Labels (`GoalTree.tsx`)

Update the label creation in `useGraphScene` (or move label logic to `GoalTree`):

**Center positioning:**

Change label offset from `below node` to `centered on node`:

```typescript
// Current: y + offset (below)
// New: centered, no vertical offset
el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
```

**Badge overlay:**

Add a child `<span>` to each pillar label showing action count:

```html
<div class="label-container">
  <span class="action-badge">3</span>
  <span class="label-text">Academics</span>
  <div class="progress-bar">
    <div class="progress-fill" style="width: 66%"></div>
  </div>
</div>
```

Style the badge as a small white circle with dark text, positioned at the top-right of the label container.

**Progress bar:**

A thin (3px) horizontal bar below the label text, with a white background track and a white filled portion (using opacity difference for contrast on colored node).

## State Management

No new state. `actionStates` already exists and is passed to `useGraphScene`. Progress is derived from `actionStates` in the render loop.

## Performance Considerations

- Pulse animation adds one extra sprite per node. With 5–7 pillars, this is negligible.
- Dashed lines use `THREE.Line` instead of `TubeGeometry`, which is actually cheaper (fewer vertices).
- Progress fill lines are also `THREE.Line` -- very lightweight.
- HTML overlay labels are already present; adding badge/progress bar children is minimal DOM cost.

## Validation

- [ ] `npm run typecheck` -- verify extended types compile
- [ ] `npm run build` -- clean build
- [ ] Visual: nodes match reference colors
- [ ] Visual: badges show correct counts
- [ ] Visual: progress bars reflect `actionStates`
- [ ] Visual: pulse animation is subtle and smooth
- [ ] Visual: edges are dashed with progress fill
- [ ] Visual: orbit ring visible
- [ ] Visual: zoom centers selected pillar correctly
- [ ] Performance: 60fps with 5 pillars and 15 action nodes
- [ ] `prefers-reduced-motion`: pulse and bob disabled
