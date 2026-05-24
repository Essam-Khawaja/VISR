# TECH SPEC: Strategy Map Visualization

## Files

```text
components/StrategyMap.tsx
lib/statusColors.ts
lib/types.ts
```

## Props

```ts
interface StrategyMapProps {
  pillars: StrategicPillar[];
  destination: string;
  mainBottleneck: string;
}
```

## Three.js Architecture

- Mark component with `"use client"`.
- Initialize renderer, scene, camera, and parent group in `useEffect`.
- Use sphere geometry or sprite circles for nodes.
- Use line geometry for edges.
- Compute radial layout from pillars and actions.
- Use `Raycaster` for hover.
- Store hovered node in React state for the HTML popover.
- Animate with `requestAnimationFrame`.
- Clean up renderer, animation frame, event listeners, and DOM canvas on unmount.

## 2D Fallback Architecture

- Use a relative container.
- Use SVG lines for edges.
- Use absolutely positioned divs for nodes.
- Compute polar coordinates in render.
- Use Framer Motion for scale/fade node entrance.
- Use CSS animation for bottleneck pulse.
- Use local hover state for popover.

## Bottleneck Matching

Use a practical MVP heuristic:

1. Prefer action or pillar names that appear in `mainBottleneck`.
2. Otherwise prefer pillars with `Weak` or `Missing`.
3. Otherwise prefer actions with `At Risk` or `Behind`.

## Status Colors

Use only `pillarStatusColor` and `nodeStatusColor` from `lib/statusColors.ts`.

## Failure Handling

If Three.js initialization throws or canvas rendering fails, render the 2D implementation. A polished 2D graph is preferred over a fragile 3D graph.

