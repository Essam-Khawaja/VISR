import type { OnboardingMapState } from "@/components/onboarding/onboardingMapTypes";
import type { LayoutEdge, LayoutNode } from "./graphTypes";

const GOAL_NODE_RADIUS = 0.42;
const PILLAR_NODE_RADIUS = 0.28;
const CONCERN_NODE_RADIUS = 0.2;

const PILLAR_RING_RADIUS = 3;
const CONCERN_RING_RADIUS = 5;

const GOAL_PASTEL = "#7D9B8A";
const COURSE_PASTELS = ["#8B4A6B", "#9B9267", "#B5707E", "#C4A882", "#8FA68B"];
const COMMITMENT_PASTELS = ["#7E6B8A", "#9B9267", "#C4A882", "#8FA68B"];
const CONCERN_PASTEL = "#A85A6B";

export function buildOnboardingLayout(mapState: OnboardingMapState): {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
} {
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  const goalPos: [number, number, number] = [0, 0, 0];

  if (!mapState.goal) return { nodes, edges };

  nodes.push({
    id: "onboarding-goal",
    kind: "goal",
    name: mapState.goal.label,
    status: "Goal",
    recommendation: "Your destination — everything connects back here.",
    color: "var(--accent)",
    isBottleneck: false,
    position: goalPos,
    radius: GOAL_NODE_RADIUS,
    parentId: null,
    pastelColor: GOAL_PASTEL,
    progressPercent: 0,
    actionCount: 0,
  });

  const allPillars = [
    ...mapState.courses.map((c) => ({ ...c, type: "course" as const })),
    ...mapState.commitments.map((c) => ({ ...c, type: "commitment" as const })),
  ];
  const numPillars = allPillars.length;

  allPillars.forEach((item, i) => {
    const angle = (i / Math.max(numPillars, 1)) * Math.PI * 2 - Math.PI / 2;
    const pos: [number, number, number] = [
      Math.cos(angle) * PILLAR_RING_RADIUS,
      Math.sin(angle) * PILLAR_RING_RADIUS,
      0,
    ];
    const prefix = item.type === "course" ? "course" : "commitment";
    const nodeId = `onboarding-${prefix}-${item.id}`;
    const palette =
      item.type === "course" ? COURSE_PASTELS : COMMITMENT_PASTELS;

    nodes.push({
      id: nodeId,
      kind: "pillar",
      name: item.label,
      status: item.type === "course" ? "Okay" : "Strong",
      recommendation:
        item.type === "course"
          ? "Academic commitment on your route."
          : "This competes for the same hours as your goal.",
      color:
        item.type === "course" ? "var(--text-secondary)" : "var(--muted)",
      isBottleneck: false,
      position: pos,
      radius: PILLAR_NODE_RADIUS,
      parentId: null,
      pastelColor: palette[i % palette.length],
      progressPercent: 0,
      actionCount: 0,
    });

    edges.push({
      id: `onboarding-edge-goal-${prefix}-${item.id}`,
      from: "onboarding-goal",
      to: nodeId,
      kind: "goal-pillar",
      parentPillarId: nodeId,
      points: [goalPos, pos],
    });
  });

  const numConcerns = mapState.concerns.length;
  mapState.concerns.forEach((concern, i) => {
    const angle =
      (i / Math.max(numConcerns, 1)) * Math.PI * 2 + Math.PI / 4;
    const pos: [number, number, number] = [
      Math.cos(angle) * CONCERN_RING_RADIUS,
      Math.sin(angle) * CONCERN_RING_RADIUS,
      0,
    ];
    const nodeId = `onboarding-concern-${concern.id}`;

    nodes.push({
      id: nodeId,
      kind: "pillar",
      name: concern.label,
      status: "Weak",
      recommendation: "A concern surfaced from your brain dump.",
      color: "var(--danger)",
      isBottleneck: true,
      position: pos,
      radius: CONCERN_NODE_RADIUS,
      parentId: null,
      pastelColor: CONCERN_PASTEL,
      progressPercent: 0,
      actionCount: 0,
    });

    edges.push({
      id: `onboarding-edge-goal-${concern.id}`,
      from: "onboarding-goal",
      to: nodeId,
      kind: "goal-pillar",
      parentPillarId: nodeId,
      points: [goalPos, pos],
    });
  });

  return { nodes, edges };
}
