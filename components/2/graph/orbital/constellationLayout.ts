import type { OrbitalNodeData } from "@/lib/2/orbitalMap";

export type GhostStar = { x: number; y: number };

/** Max hint dots per branch (children stay hidden until drill-in). */
const MAX_GHOST_STARS = 4;

/**
 * Invisible-child constellation hints: small star dots past a parent node,
 * suggesting sub-goals exist without rendering child nodes.
 */
export function layoutGhostStars(
  parentX: number,
  parentY: number,
  centerX: number,
  centerY: number,
  childCount: number,
  extensionLength = 52,
): GhostStar[] {
  if (childCount <= 0) return [];

  const dotCount = Math.min(childCount, MAX_GHOST_STARS);
  const awayFromCenter = Math.atan2(
    parentY - centerY,
    parentX - centerX,
  );
  const spread =
    dotCount === 1
      ? 0.12
      : Math.min(Math.PI * 0.55, 0.22 * dotCount + 0.18);

  return Array.from({ length: dotCount }, (_, index) => {
    const t = dotCount === 1 ? 0.5 : index / (dotCount - 1);
    const angle = awayFromCenter - spread / 2 + t * spread;
    const dist = extensionLength * (0.55 + t * 0.45);
    return {
      x: parentX + dist * Math.cos(angle),
      y: parentY + dist * Math.sin(angle),
    };
  });
}

/** Curved tether between two points. */
export function constellationPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  curveSign: number,
): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const perpX = (-dy / len) * 16 * curveSign;
  const perpY = (dx / len) * 16 * curveSign;
  return `M ${x1} ${y1} Q ${mx + perpX} ${my + perpY}, ${x2} ${y2}`;
}

/** Main orbit branch connector (center → pillar). */
export function branchConstellationPath(
  centerX: number,
  centerY: number,
  x: number,
  y: number,
  angle: number,
  curveOffset: number,
): string {
  const orbitDistance = Math.hypot(x - centerX, y - centerY);
  const midDistance = orbitDistance * 0.6;
  const perpAngle = angle + Math.PI / 2;
  const cx1 =
    centerX +
    midDistance * 0.4 * Math.cos(angle) +
    curveOffset * Math.cos(perpAngle);
  const cy1 =
    centerY +
    midDistance * 0.4 * Math.sin(angle) +
    curveOffset * Math.sin(perpAngle);
  const cx2 =
    centerX +
    midDistance * 0.8 * Math.cos(angle) +
    curveOffset * 0.5 * Math.cos(perpAngle);
  const cy2 =
    centerY +
    midDistance * 0.8 * Math.sin(angle) +
    curveOffset * 0.5 * Math.sin(perpAngle);
  return `M ${centerX} ${centerY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x} ${y}`;
}

/** Star dots spaced along the center → branch curve (decorative). */
export function starsAlongBranchPath(
  centerX: number,
  centerY: number,
  x: number,
  y: number,
  angle: number,
  curveOffset: number,
  count: number,
): GhostStar[] {
  if (count <= 0) return [];
  const orbitDistance = Math.hypot(x - centerX, y - centerY);
  const midDistance = orbitDistance * 0.6;
  const perpAngle = angle + Math.PI / 2;
  const cx1 =
    centerX +
    midDistance * 0.4 * Math.cos(angle) +
    curveOffset * Math.cos(perpAngle);
  const cy1 =
    centerY +
    midDistance * 0.4 * Math.sin(angle) +
    curveOffset * Math.sin(perpAngle);
  const cx2 =
    centerX +
    midDistance * 0.8 * Math.cos(angle) +
    curveOffset * 0.5 * Math.cos(perpAngle);
  const cy2 =
    centerY +
    midDistance * 0.8 * Math.sin(angle) +
    curveOffset * 0.5 * Math.sin(perpAngle);

  const sample = (t: number) => {
    const u = 1 - t;
    const px =
      u * u * u * centerX +
      3 * u * u * t * cx1 +
      3 * u * t * t * cx2 +
      t * t * t * x;
    const py =
      u * u * u * centerY +
      3 * u * u * t * cy1 +
      3 * u * t * t * cy2 +
      t * t * t * y;
    return { x: px, y: py };
  };

  const n = Math.min(count, 3);
  return Array.from({ length: n }, (_, i) =>
    sample(0.35 + (i + 1) * (0.45 / n)),
  );
}

/** Star dots along a quadratic constellation curve. */
export function starsAlongQuadraticPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  curveSign: number,
  count: number,
): GhostStar[] {
  if (count <= 0) return [];
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const perpX = (-dy / len) * 16 * curveSign;
  const perpY = (dx / len) * 16 * curveSign;
  const cpx = mx + perpX;
  const cpy = my + perpY;

  const sample = (t: number) => {
    const u = 1 - t;
    return {
      x: u * u * x1 + 2 * u * t * cpx + t * t * x2,
      y: u * u * y1 + 2 * u * t * cpy + t * t * y2,
    };
  };

  const n = Math.min(count, 4);
  return Array.from({ length: n }, (_, i) =>
    sample(0.2 + (i + 1) * (0.65 / (n + 1))),
  );
}

/**
 * Where the root goal (e.g. Software Engineering Internship) sits off-screen
 * when zoomed into a child level — opposite the direction we drilled in from.
 */
export function rootGoalAnchor(
  centerX: number,
  centerY: number,
  drillInAngle: number | undefined,
  distance: number,
): GhostStar {
  const angle = (drillInAngle ?? -Math.PI / 2) + Math.PI;
  return {
    x: centerX + distance * Math.cos(angle),
    y: centerY + distance * Math.sin(angle),
  };
}

