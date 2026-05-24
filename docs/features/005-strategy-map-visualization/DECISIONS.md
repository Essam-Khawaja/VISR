# DECISIONS: Strategy Map Visualization

## D1: Custom Visualization

Do not use React Flow. The graph should feel like Pathwise, not a diagram builder.

## D2: Three.js Is Optional

Three.js is preferred, but reliability wins. The accepted fallback is a polished 2D radial graph.

## D3: Status Is Labeled and Colored

Color helps scanning, but hover/popover labels must include status text so the graph is accessible.

