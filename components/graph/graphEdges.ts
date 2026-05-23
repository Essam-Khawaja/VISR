import * as THREE from "three";
import { cssVar, hexToThreeColor } from "@/lib/cssColor";
import type { GraphEdgeKind, LayoutEdge } from "./graphTypes";

export type EdgeRender = {
  mesh: THREE.Mesh;
  kind: GraphEdgeKind;
  fromId: string;
  toId: string;
  parentPillarId: string;
  currentOpacity: number;
  targetOpacity: number;
  baseOpacity: number;
};

export function createEdgeRender(edge: LayoutEdge): EdgeRender {
  const [a, b] = edge.points;
  const ax = a[0];
  const ay = a[1];
  const bx = b[0];
  const by = b[1];
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const arc = Math.min(0.55, len * 0.18);

  const mid: [number, number, number] = [
    (ax + bx) / 2 + nx * arc,
    (ay + by) / 2 + ny * arc,
    0,
  ];

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(ax, ay, 0),
    new THREE.Vector3(...mid),
    new THREE.Vector3(bx, by, 0),
  ]);
  const radius = edge.kind === "goal-pillar" ? 0.022 : 0.015;
  const geometry = new THREE.TubeGeometry(curve, 48, radius, 8, false);
  // Slate-300/400 for visibility on white; full opacity baseline lerps low.
  const colorHex = hexToThreeColor(
    cssVar(edge.kind === "goal-pillar" ? "--border-strong" : "--border", "#cbd5e1"),
  );
  const baseOpacity = edge.kind === "goal-pillar" ? 0.85 : 0.7;
  const material = new THREE.MeshBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: 0,
    blending: THREE.NormalBlending,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData = { edgeId: edge.id };

  return {
    mesh,
    kind: edge.kind,
    fromId: edge.from,
    toId: edge.to,
    parentPillarId: edge.parentPillarId,
    currentOpacity: 0,
    targetOpacity: edge.kind === "goal-pillar" ? baseOpacity : 0,
    baseOpacity,
  };
}
