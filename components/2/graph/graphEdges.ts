import * as THREE from "three";
import { cssVar, hexToThreeColor } from "@/lib/shared/cssColor";
import type { GraphEdgeKind, LayoutEdge } from "./graphTypes";

export type EdgeRender = {
  dashLine: THREE.Line;
  fillLine: THREE.Line;
  kind: GraphEdgeKind;
  fromId: string;
  toId: string;
  parentPillarId: string;
  currentOpacity: number;
  targetOpacity: number;
  baseOpacity: number;
  progressPercent: number;
};

export function createEdgeRender(edge: LayoutEdge): EdgeRender {
  const [a, b] = edge.points;
  const start = new THREE.Vector3(a[0], a[1], a[2] ?? 0);
  const end = new THREE.Vector3(b[0], b[1], b[2] ?? 0);

  const edgeColor = hexToThreeColor(
    cssVar(
      edge.kind === "goal-pillar" ? "--border-strong" : "--border",
      "#B8AFA3",
    ),
  );
  const baseOpacity = edge.kind === "goal-pillar" ? 0.85 : 0.7;

  const dashGeo = new THREE.BufferGeometry().setFromPoints([start, end]);
  const dashMat = new THREE.LineDashedMaterial({
    color: edgeColor,
    dashSize: 0.15,
    gapSize: 0.1,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const dashLine = new THREE.Line(dashGeo, dashMat);
  dashLine.computeLineDistances();
  dashLine.userData = { edgeId: edge.id };

  const progress = edge.progressPercent ?? 0;
  const fillEnd = new THREE.Vector3().lerpVectors(start, end, progress);
  const fillGeo = new THREE.BufferGeometry().setFromPoints([start, fillEnd]);
  const fillMat = new THREE.LineBasicMaterial({
    color: edgeColor,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const fillLine = new THREE.Line(fillGeo, fillMat);

  return {
    dashLine,
    fillLine,
    kind: edge.kind,
    fromId: edge.from,
    toId: edge.to,
    parentPillarId: edge.parentPillarId,
    currentOpacity: 0,
    targetOpacity: edge.kind === "goal-pillar" ? baseOpacity : 0,
    baseOpacity,
    progressPercent: progress,
  };
}

export function updateEdgeProgress(
  er: EdgeRender,
  edge: LayoutEdge,
  progress: number,
): void {
  const [a, b] = edge.points;
  const start = new THREE.Vector3(a[0], a[1], a[2] ?? 0);
  const end = new THREE.Vector3(b[0], b[1], b[2] ?? 0);
  const fillEnd = new THREE.Vector3().lerpVectors(
    start,
    end,
    Math.max(0.01, progress),
  );
  er.fillLine.geometry.dispose();
  er.fillLine.geometry = new THREE.BufferGeometry().setFromPoints([
    start,
    fillEnd,
  ]);
  er.progressPercent = progress;
}
