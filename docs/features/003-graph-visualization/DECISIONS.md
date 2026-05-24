# Feature Decisions: Graph Visualization System

## Decision Log

### 2026-05-23 — Simple graph first (no animations)

**Decision:**  
MVP uses static layout and CSS-based status styling. No animated growth or particle effects.

**Reason:**  
Animations distract from hackathon demo clarity and add implementation risk.

**Alternatives Considered:**  
- Animated "branch growth" on completion  
- Force-directed physics layout

**Consequence:**  
Visual "living" feel comes from status colors and opacity, not motion. Revisit post-MVP.

---

### 2026-05-23 — React Flow as default library

**Decision:**  
Use React Flow unless project stack dictates otherwise.

**Reason:**  
Mature React integration, custom nodes, pan/zoom out of the box.

**Alternatives Considered:**  
- Cytoscape.js  
- D3 raw

**Consequence:**  
Custom node components must conform to React Flow `NodeProps` API.
