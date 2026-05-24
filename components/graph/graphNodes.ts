import * as THREE from "three";
import { cssVar, hexToThreeColor } from "@/lib/cssColor";
import { getGlowTexture } from "./glowTexture";
import type { LayoutNode } from "./graphTypes";

export type NodeMesh = {
  group: THREE.Group;
  core: THREE.Mesh;
  ring: THREE.Mesh;
  halo: THREE.Sprite;
  pulseHalo: THREE.Sprite;
  data: LayoutNode;
  parentId: string | null;
  basePosition: THREE.Vector3;
  bobPhase: number;
  bobAmp: number;
  bobSpeed: number;
  currentOpacity: number;
  targetOpacity: number;
  currentScale: number;
  targetScale: number;
  baseRenderScale: number;
};

const colorCache = new Map<string, number>();

function resolveColor(cssColor: string, fallback = "#8B6B5A"): number {
  if (cssColor.startsWith("#")) return hexToThreeColor(cssColor);
  if (colorCache.has(cssColor)) return colorCache.get(cssColor)!;
  const map: Record<string, string> = {
    "var(--success)": "--success",
    "var(--warning)": "--warning",
    "var(--danger)": "--danger",
    "var(--muted)": "--muted",
    "var(--accent)": "--accent",
    "var(--text-secondary)": "--text-secondary",
  };
  const varName = map[cssColor] ?? "--accent";
  const hex = cssVar(varName, fallback);
  const n = hexToThreeColor(hex);
  colorCache.set(cssColor, n);
  return n;
}

export function createNodeMesh(node: LayoutNode): NodeMesh {
  const colorHex = node.pastelColor
    ? hexToThreeColor(node.pastelColor)
    : resolveColor(node.color);
  const color = new THREE.Color(colorHex);

  const group = new THREE.Group();
  group.position.set(...node.position);
  group.scale.setScalar(0.001);

  const coreGeo = new THREE.SphereGeometry(node.radius, 24, 24);
  const coreMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.userData = { nodeId: node.id, kind: node.kind };
  group.add(core);

  const ringGeo = new THREE.RingGeometry(
    node.radius * 1.25,
    node.radius * 1.4,
    48,
  );
  const ringMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xffffff),
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  group.add(ring);

  const haloFactor =
    node.kind === "goal" ? 7 : node.kind === "pillar" ? 5 : 3.6;
  const haloMat = new THREE.SpriteMaterial({
    map: getGlowTexture(),
    color,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
    opacity: 0,
  });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.setScalar(node.radius * haloFactor);
  group.add(halo);

  const pulseHaloMat = new THREE.SpriteMaterial({
    map: getGlowTexture(),
    color,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
    opacity: 0,
  });
  const pulseHalo = new THREE.Sprite(pulseHaloMat);
  pulseHalo.scale.setScalar(node.radius * 9);
  group.add(pulseHalo);

  return {
    group,
    core,
    ring,
    halo,
    pulseHalo,
    data: node,
    parentId: node.parentId,
    basePosition: new THREE.Vector3(...node.position),
    bobPhase: Math.random() * Math.PI * 2,
    bobAmp:
      node.kind === "goal" ? 0.03 : node.kind === "pillar" ? 0.06 : 0.08,
    bobSpeed: 0.4 + Math.random() * 0.3,
    currentOpacity: 0,
    targetOpacity: node.kind === "action" ? 0 : 1,
    currentScale: 0.001,
    targetScale: node.kind === "action" ? 0.001 : 1,
    baseRenderScale: 1,
  };
}

/** Halo opacity for the node's current role/state. */
export function haloStrength(node: NodeMesh, isSelected: boolean): number {
  if (node.data.kind === "goal") return 0.45;
  if (isSelected) return 0.5;
  if (node.data.isBottleneck) return 0.4;
  if (node.data.kind === "pillar") return 0.28;
  return 0.2;
}
