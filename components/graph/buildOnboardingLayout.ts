import type { OnboardingMapState } from "@/components/onboarding/onboardingMapTypes";
import type { LayoutEdge, LayoutNode } from "./graphTypes";

const GOAL_NODE_RADIUS = 0.5;
const COURSE_NODE_RADIUS = 0.22;
const COMMITMENT_NODE_RADIUS = 0.18;
const CONCERN_NODE_RADIUS = 0.12;

const COURSE_RING_RADIUS = 2.8;
const COMMITMENT_RING_RADIUS = 4.2;
const CONCERN_RING_RADIUS = 5.6;

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
  });

  const numCourses = mapState.courses.length;
  mapState.courses.forEach((course, i) => {
    const angle = (i / Math.max(numCourses, 1)) * Math.PI * 2 - Math.PI / 2;
    const pos: [number, number, number] = [
      Math.cos(angle) * COURSE_RING_RADIUS,
      Math.sin(angle) * COURSE_RING_RADIUS,
      0,
    ];
    const nodeId = `onboarding-course-${course.id}`;

    nodes.push({
      id: nodeId,
      kind: "pillar",
      name: course.label,
      status: "Okay",
      recommendation: "Academic commitment on your route.",
      color: "var(--text-secondary)",
      isBottleneck: false,
      position: pos,
      radius: COURSE_NODE_RADIUS,
      parentId: null,
    });

    edges.push({
      id: `onboarding-edge-goal-${course.id}`,
      from: "onboarding-goal",
      to: nodeId,
      kind: "goal-pillar",
      parentPillarId: nodeId,
      points: [goalPos, pos],
    });
  });

  const numCommitments = mapState.commitments.length;
  const commitmentOffset = numCourses > 0 ? Math.PI / numCourses / 2 : 0;
  mapState.commitments.forEach((commitment, i) => {
    const angle =
      (i / Math.max(numCommitments, 1)) * Math.PI * 2 -
      Math.PI / 2 +
      commitmentOffset;
    const pos: [number, number, number] = [
      Math.cos(angle) * COMMITMENT_RING_RADIUS,
      Math.sin(angle) * COMMITMENT_RING_RADIUS,
      0,
    ];
    const nodeId = `onboarding-commitment-${commitment.id}`;

    nodes.push({
      id: nodeId,
      kind: "pillar",
      name: commitment.label,
      status: "Okay",
      recommendation: "This competes for the same hours as your goal.",
      color: "var(--muted)",
      isBottleneck: false,
      position: pos,
      radius: COMMITMENT_NODE_RADIUS,
      parentId: null,
    });

    edges.push({
      id: `onboarding-edge-goal-${commitment.id}`,
      from: "onboarding-goal",
      to: nodeId,
      kind: "goal-pillar",
      parentPillarId: nodeId,
      points: [goalPos, pos],
    });
  });

  mapState.concerns.forEach((concern, i) => {
    const numConcerns = mapState.concerns.length;
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
