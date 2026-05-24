import { nodeStatusColor, pillarStatusColor } from "@/lib/2/statusColors";
import type { StrategicPillar } from "@/lib/2/types";
import type {
  GraphLayoutResult,
  LayoutEdge,
  LayoutNode,
} from "./graphTypes";

const PILLAR_RADIUS = 3;
const ACTION_RADIUS = 5.5;
const GOAL_RADIUS = 0.55;
const PILLAR_NODE_RADIUS = 0.28;
const ACTION_NODE_RADIUS = 0.14;
const GOAL_NODE_RADIUS = 0.42;

const PILLAR_PASTELS = [
  "#933B5B", // amaranth
  "#B5728A", // thulian
  "#9F9679", // pomelo olive
  "#8A9A5B", // sage
  "#AABAAE", // brook green
  "#C4A882", // chalk-dark
];
const GOAL_PASTEL = "#AABAAE"; // brook green

export function findBottleneckPillarId(
  pillars: StrategicPillar[],
  mainBottleneck: string,
): string | null {
  const weak = pillars.find(
    (p) => p.status === "Weak" || p.status === "Missing",
  );
  if (weak) return weak.id;
  const lower = mainBottleneck.toLowerCase();
  const match = pillars.find(
    (p) =>
      lower.includes(p.name.toLowerCase()) ||
      p.reason.toLowerCase().includes(lower.slice(0, 20)),
  );
  return match?.id ?? null;
}

export function buildGraphLayout(
  pillars: StrategicPillar[],
  destination: string,
  mainBottleneck: string,
): GraphLayoutResult {
  const bottleneckPillarId = findBottleneckPillarId(pillars, mainBottleneck);
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  const total = pillars.length || 1;

  const goalPos: [number, number, number] = [0, 0, 0];
  nodes.push({
    id: "goal",
    kind: "goal",
    name: destination,
    status: "Goal",
    recommendation: "Your destination — everything routes through here.",
    color: "var(--accent)",
    isBottleneck: false,
    position: goalPos,
    radius: GOAL_NODE_RADIUS,
    parentId: null,
    pastelColor: GOAL_PASTEL,
    progressPercent: 0,
    actionCount: 0,
  });

  pillars.forEach((pillar, i) => {
    const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
    const px = Math.cos(angle) * PILLAR_RADIUS;
    const py = Math.sin(angle) * PILLAR_RADIUS;
    const pillarPos: [number, number, number] = [px, py, 0];
    const isBottleneck =
      pillar.id === bottleneckPillarId ||
      pillar.status === "Weak" ||
      pillar.status === "Missing";

    nodes.push({
      id: pillar.id,
      kind: "pillar",
      name: pillar.name,
      status: pillar.status,
      recommendation: pillar.reason,
      color: pillarStatusColor[pillar.status],
      isBottleneck,
      position: pillarPos,
      radius: PILLAR_NODE_RADIUS,
      parentId: null,
      pastelColor: PILLAR_PASTELS[i % PILLAR_PASTELS.length],
      progressPercent: 0,
      actionCount: pillar.actions.length,
    });

    edges.push({
      id: `edge-goal-${pillar.id}`,
      from: "goal",
      to: pillar.id,
      kind: "goal-pillar",
      parentPillarId: pillar.id,
      points: [goalPos, pillarPos],
    });

    pillar.actions.forEach((action, ai) => {
      const spread = (Math.PI / 8) * (ai - (pillar.actions.length - 1) / 2);
      const aAngle = angle + spread;
      const ax = Math.cos(aAngle) * ACTION_RADIUS;
      const ay = Math.sin(aAngle) * ACTION_RADIUS;
      const actionPos: [number, number, number] = [ax, ay, 0];

      nodes.push({
        id: action.id,
        kind: "action",
        name: action.name,
        status: action.status,
        recommendation: action.recommendation,
        color: nodeStatusColor[action.status],
        isBottleneck: isBottleneck && action.status === "At Risk",
        position: actionPos,
        radius: ACTION_NODE_RADIUS,
        parentId: pillar.id,
      });

      edges.push({
        id: `edge-${pillar.id}-${action.id}`,
        from: pillar.id,
        to: action.id,
        kind: "pillar-action",
        parentPillarId: pillar.id,
        points: [pillarPos, actionPos],
      });
    });
  });

  return { nodes, edges, destination, bottleneckPillarId };
}

export const graphRadii = {
  GOAL_RADIUS,
  PILLAR_RADIUS,
  ACTION_RADIUS,
};

export type NucleusChild = {
  id: string;
  name: string;
  status: string;
  recommendation: string;
  pastelColor: string;
  childCount: number;
};

export function buildNucleusLayout(
  nucleus: { id: string; name: string; pastelColor: string; childCount: number },
  children: NucleusChild[],
): { nodes: LayoutNode[]; edges: LayoutEdge[] } {
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  const nucleusPos: [number, number, number] = [0, 0, 0];

  nodes.push({
    id: nucleus.id,
    kind: "goal",
    name: nucleus.name,
    status: "Goal",
    recommendation: "",
    color: "var(--accent)",
    isBottleneck: false,
    position: nucleusPos,
    radius: GOAL_NODE_RADIUS,
    parentId: null,
    pastelColor: nucleus.pastelColor,
    progressPercent: 0,
    actionCount: nucleus.childCount,
  });

  const total = children.length || 1;
  children.forEach((child, i) => {
    const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
    const pos: [number, number, number] = [
      Math.cos(angle) * PILLAR_RADIUS,
      Math.sin(angle) * PILLAR_RADIUS,
      0,
    ];

    nodes.push({
      id: child.id,
      kind: "pillar",
      name: child.name,
      status: child.status as LayoutNode["status"],
      recommendation: child.recommendation,
      color: child.pastelColor,
      isBottleneck: false,
      position: pos,
      radius: PILLAR_NODE_RADIUS,
      parentId: null,
      pastelColor: child.pastelColor,
      progressPercent: 0,
      actionCount: child.childCount,
    });

    edges.push({
      id: `edge-${nucleus.id}-${child.id}`,
      from: nucleus.id,
      to: child.id,
      kind: "goal-pillar",
      parentPillarId: child.id,
      points: [nucleusPos, pos],
    });
  });

  return { nodes, edges };
}
