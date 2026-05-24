import type { ActionNode, StrategyPlan, StrategicPillar } from "./types";

export type OrbitalNodeData = {
  id: string;
  label: string;
  category: string;
  color: string;
  /** Optional ring/border (e.g. Network pillar uses #7a6a8a). */
  strokeColor?: string;
  subGoals: OrbitalNodeData[];
};

/** Network pillar — fill + stroke from design spec */
export const NETWORK_NODE_FILL = "#9b8aab";
export const NETWORK_NODE_STROKE = "#7a6a8a";

/** Figma dashboard pillar palette */
export const FIGMA_PILLAR_COLORS = [
  "#933B5B",
  "#B5728A",
  "#A8C4A4",
  "#E3D6BF",
  "#9F9679",
  "#8B4A6B",
  "#7E6B8A",
] as const;

export const FIGMA_ROOT_COLOR = "#8FA090";
export const FIGMA_DASHBOARD_BG = "#F5EFDF";

export function darkenColor(hex: string, depth: number): string {
  const factor = 1 - depth * 0.15;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const newR = Math.max(0, Math.floor(r * factor));
  const newG = Math.max(0, Math.floor(g * factor));
  const newB = Math.max(0, Math.floor(b * factor));

  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

function isNetworkPillar(pillar: StrategicPillar): boolean {
  return (
    pillar.id === "pillar-network" ||
    pillar.name.trim().toLowerCase() === "network"
  );
}

function pillarPalette(
  pillar: StrategicPillar,
  fallbackFill: string,
): { fill: string; stroke?: string } {
  if (isNetworkPillar(pillar)) {
    return { fill: NETWORK_NODE_FILL, stroke: NETWORK_NODE_STROKE };
  }
  return { fill: fallbackFill };
}

function actionToOrbitalNode(
  action: ActionNode,
  baseColor: string,
  depth: number,
  strokeColor?: string,
): OrbitalNodeData {
  return {
    id: action.id,
    label: action.name,
    category: "action",
    color: darkenColor(baseColor, depth),
    strokeColor,
    subGoals: (action.children ?? []).map((child) =>
      actionToOrbitalNode(child, baseColor, depth + 1, strokeColor),
    ),
  };
}

function pillarToOrbitalNode(
  pillar: StrategicPillar,
  fallbackFill: string,
): OrbitalNodeData {
  const { fill, stroke } = pillarPalette(pillar, fallbackFill);
  return {
    id: pillar.id,
    label: pillar.name,
    category: pillar.id,
    color: fill,
    strokeColor: stroke,
    subGoals: pillar.actions.map((action) =>
      actionToOrbitalNode(action, fill, 1, stroke),
    ),
  };
}

export function planToOrbitalRoot(plan: StrategyPlan): OrbitalNodeData {
  return {
    id: "goal",
    label: plan.destination,
    category: "degree",
    color: FIGMA_ROOT_COLOR,
    subGoals: plan.strategicPillars.map((pillar, index) =>
      pillarToOrbitalNode(
        pillar,
        FIGMA_PILLAR_COLORS[index % FIGMA_PILLAR_COLORS.length],
      ),
    ),
  };
}
