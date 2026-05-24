import { nodesForParent } from "@/lib/2/nodeStore";
import { tasksForNode } from "@/lib/2/taskStore";
import type { StrategyNode, StrategyTask } from "@/lib/2/types";
import { type NucleusChild } from "./graphLayout";
import { buildRadialLayoutFromCenter } from "./buildOnboardingLayout";
import type { LayoutEdge, LayoutNode } from "./graphTypes";

export type FocusBreadcrumb = { id: string; name: string };

const PILLAR_PASTELS = [
  "#933B5B",
  "#B5728A",
  "#9F9679",
  "#8A9A5B",
  "#AABAAE",
  "#C4A882",
];

export function hasUniversityNodes(nodes: StrategyNode[]): boolean {
  return nodes.some(
    (n) => n.parentNodeId === null && n.kind !== "strategic_pillar",
  );
}

export function getRootNode(nodes: StrategyNode[]): StrategyNode | null {
  return nodes.find((n) => n.parentNodeId === null) ?? null;
}

export function getRootNodeId(nodes: StrategyNode[]): string {
  return getRootNode(nodes)?.id ?? "goal";
}

/** Keep university outcome root and descendants; drop legacy pillar subtrees. */
export function filterUniversitySubtree(nodes: StrategyNode[]): StrategyNode[] {
  const root =
    nodes.find(
      (n) => n.parentNodeId === null && n.kind !== "strategic_pillar",
    ) ?? nodes.find((n) => n.parentNodeId === null);
  if (!root || root.kind === "strategic_pillar") return nodes;

  const ids = new Set<string>([root.id]);
  const queue = [root.id];
  while (queue.length > 0) {
    const parentId = queue.shift()!;
    for (const node of nodes) {
      if (node.parentNodeId === parentId && !ids.has(node.id)) {
        ids.add(node.id);
        queue.push(node.id);
      }
    }
  }
  return nodes.filter((node) => ids.has(node.id));
}

function nodeChildColor(node: StrategyNode, index: number): string {
  if (node.kind === "course") return PILLAR_PASTELS[0];
  if (node.kind === "club" || node.kind === "work" || node.kind === "research")
    return PILLAR_PASTELS[1];
  if (node.kind === "commitment" || node.kind === "project")
    return PILLAR_PASTELS[2];
  return PILLAR_PASTELS[index % PILLAR_PASTELS.length];
}

function taskNodeColor(task: StrategyTask): string {
  if (task.status === "done") return "#8A9A5B";
  if (task.priority === "High") return "#933B5B";
  if (task.priority === "Medium") return "#C4A882";
  return "#AABAAE";
}

export function resolveNucleusFromNodes(
  allNodes: StrategyNode[],
  tasks: StrategyTask[],
  focusPath: FocusBreadcrumb[],
): {
  nucleusId: string;
  nucleusName: string;
  nucleusPastel: string;
  children: NucleusChild[];
} | null {
  const rootNode = getRootNode(allNodes);
  if (!rootNode) return null;

  const targetId =
    focusPath.length === 0
      ? rootNode.id
      : focusPath[focusPath.length - 1].id;

  const target = allNodes.find((n) => n.id === targetId);
  if (!target) return null;

  const childNodes = nodesForParent(allNodes, targetId);
  const childTasks = tasksForNode(tasks, targetId);

  const children: NucleusChild[] = [
    ...childNodes.map((child, i) => ({
      id: child.id,
      name: child.title,
      status:
        child.status === "at_risk"
          ? "At Risk"
          : child.status === "done"
            ? "Done"
            : "On Track",
      recommendation: child.subtitle || child.kind,
      pastelColor: nodeChildColor(child, i),
      childCount:
        nodesForParent(allNodes, child.id).length +
        tasksForNode(tasks, child.id).length,
    })),
    ...childTasks.map((task) => ({
      id: task.id,
      name: task.title,
      status: task.status,
      recommendation: task.recommendation || `Due ${task.dueDate}`,
      pastelColor: taskNodeColor(task),
      childCount: tasksForNode(tasks, task.id).length,
    })),
  ];

  const rootIdx = allNodes.indexOf(target);
  return {
    nucleusId: target.id,
    nucleusName: target.title,
    nucleusPastel: PILLAR_PASTELS[rootIdx % PILLAR_PASTELS.length],
    children,
  };
}

/** Default explore/preview focus: current year + current semester. */
export function buildSemesterFocusPath(
  nodes: StrategyNode[],
): FocusBreadcrumb[] {
  const root = getRootNode(nodes);
  if (!root) return [];

  const yearNode =
    nodes.find(
      (n) =>
        n.parentNodeId === root.id &&
        n.kind === "academic_year" &&
        n.status === "doing",
    ) ??
    nodes.find(
      (n) => n.parentNodeId === root.id && n.kind === "academic_year",
    );
  if (!yearNode) return [];

  const semesterNode =
    nodes.find(
      (n) =>
        n.parentNodeId === yearNode.id &&
        n.kind === "semester" &&
        n.status === "doing",
    ) ??
    nodes.find(
      (n) => n.parentNodeId === yearNode.id && n.kind === "semester",
    ) ??
    nodes
      .filter(
        (n) => n.parentNodeId === yearNode.id && n.kind === "semester",
      )
      .sort(
        (a, b) =>
          a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt),
      )[0];

  const path: FocusBreadcrumb[] = [
    { id: yearNode.id, name: yearNode.title },
  ];
  if (semesterNode) {
    path.push({ id: semesterNode.id, name: semesterNode.title });
  }
  return path;
}

export function buildScopedNucleusLayout(
  nodes: StrategyNode[],
  tasks: StrategyTask[],
  focusPath: FocusBreadcrumb[],
): { nodes: LayoutNode[]; edges: LayoutEdge[] } | undefined {
  const root = getRootNode(nodes);
  if (!root) return undefined;

  const targetId =
    focusPath.length === 0
      ? root.id
      : focusPath[focusPath.length - 1].id;

  const center = nodes.find((node) => node.id === targetId);
  if (!center) return undefined;

  const childNodes = nodesForParent(nodes, targetId);
  const childTasks = tasksForNode(tasks, targetId);
  return buildRadialLayoutFromCenter(center, childNodes, childTasks);
}
