import type { CutRecommendation, NodeStatus, PillarStatus, RouteStatus } from "@/lib/types";

export const pillarStatusColor: Record<PillarStatus, string> = {
  Strong: "#00F5A0",
  Okay: "#FFB547",
  Weak: "#FF4D6D",
  Missing: "#FF4D6D",
};

export const nodeStatusColor: Record<NodeStatus, string> = {
  "On Track": "#00F5A0",
  Behind: "#FFB547",
  "At Risk": "#FF4D6D",
  Deferred: "#3D4F6B",
  Cut: "#3D4F6B",
};

export const cutRecommendationColor: Record<CutRecommendation, string> = {
  Cut: "#FF4D6D",
  Defer: "#FFB547",
  Keep: "#6B7FA3",
  "Double Down": "#00F5A0",
};

export const routeStatusColor: Partial<Record<RouteStatus, string>> = {
  "On Track": "#00F5A0",
  "At Risk": "#FF4D6D",
  Scattered: "#FFB547",
  "Needs Focus": "#FFB547",
  "Scattered but Recoverable": "#FFB547",
};

export function pillarToGraphStatusColors(pillar: {
  status: PillarStatus;
  isPrimaryBottleneck?: boolean;
}): { ring: string; glow: boolean; pulse: boolean } {
  const base = pillarStatusColor[pillar.status];
  if (pillar.isPrimaryBottleneck) {
    return { ring: "#FF4D6D", glow: true, pulse: true };
  }
  return { ring: base, glow: false, pulse: false };
}

export function pillarAlignmentScore(status: PillarStatus): number {
  switch (status) {
    case "Strong":
      return 92;
    case "Okay":
      return 68;
    case "Weak":
      return 38;
    case "Missing":
      return 22;
    default:
      return 50;
  }
}

export function actionAlignmentScore(status: NodeStatus): number {
  switch (status) {
    case "On Track":
      return 90;
    case "Behind":
      return 55;
    case "At Risk":
      return 35;
    case "Deferred":
      return 20;
    case "Cut":
      return 15;
    default:
      return 50;
  }
}
