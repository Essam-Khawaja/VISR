import type { NodeStatus, PillarStatus } from "@/lib/strategyweb/types";

export type GraphNodeKind = "goal" | "pillar" | "action";

export type GraphNodeData = {
  id: string;
  kind: GraphNodeKind;
  name: string;
  status: NodeStatus | PillarStatus | "Goal";
  recommendation: string;
  color: string;
  isBottleneck: boolean;
};

export type LayoutNode = GraphNodeData & {
  position: [number, number, number];
  radius: number;
  /** For action nodes, the pillar id they belong to. Null for goal/pillar. */
  parentId: string | null;
  pastelColor?: string;
  progressPercent?: number;
  actionCount?: number;
};

export type GraphEdgeKind = "goal-pillar" | "pillar-action";

export type LayoutEdge = {
  id: string;
  from: string;
  to: string;
  kind: GraphEdgeKind;
  /** The pillar this edge is rooted at (pillar of the pair). */
  parentPillarId: string;
  points: [number, number, number][];
  progressPercent?: number;
};

export type GraphLayoutResult = {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  destination: string;
  bottleneckPillarId: string | null;
};

export type GraphSelection =
  | { kind: "pillar"; nodeId: string }
  | { kind: "action"; nodeId: string }
  | null;
