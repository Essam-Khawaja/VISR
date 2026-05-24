"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IntelligenceDock } from "@/components/2/dashboard/IntelligenceDock";
import { NodePopover } from "./NodePopover";
import { NodeTaskDialog } from "./NodeTaskDialog";
import { StrategyHUD } from "./StrategyHUD";
import { buildNucleusLayout, type NucleusChild } from "./graphLayout";
import { useGraphScene, type ActionState } from "./useGraphScene";
import type { LayoutEdge, LayoutNode, GraphSelection } from "./graphTypes";
import type {
  ActionNode,
  StrategyNode,
  StrategyPlan,
  StrategyTask,
  StrategyTaskStatus,
} from "@/lib/2/types";
import { nodesForParent } from "@/lib/2/nodeStore";
import {
  tasksForNode,
  type CreateStrategyTaskInput,
  type NodeRollup,
} from "@/lib/2/taskStore";

const PILLAR_PASTELS = [
  "#933B5B", // amaranth
  "#B5728A", // thulian
  "#9F9679", // pomelo olive
  "#8A9A5B", // sage
  "#AABAAE", // brook green
  "#C4A882", // chalk-dark
];
const GOAL_PASTEL = "#AABAAE"; // brook green

type FocusBreadcrumb = { id: string; name: string };

export type GoalTreeProps = {
  plan: StrategyPlan;
  planId: string;
  nodes: StrategyNode[];
  actionStates: Record<string, ActionState>;
  tasks: StrategyTask[];
  rollups: Record<string, NodeRollup>;
  markAction: (actionId: string, state: ActionState) => void;
  onCreateTask: (input: Omit<CreateStrategyTaskInput, "planId">) => Promise<void>;
  onMarkTask: (taskId: string, state: StrategyTaskStatus) => Promise<void>;
  isDemo: boolean;
  onToggleToday: () => void;
  displayMode?: "onboarding" | "preview" | "full";
  layoutOverride?: { nodes: LayoutNode[]; edges: LayoutEdge[] };
};

function findActionDeep(
  actions: ActionNode[],
  id: string,
): ActionNode | null {
  for (const a of actions) {
    if (a.id === id) return a;
    if (a.children) {
      const found = findActionDeep(a.children, id);
      if (found) return found;
    }
  }
  return null;
}

function findNodeName(
  plan: StrategyPlan,
  tasks: StrategyTask[],
  nodes: StrategyNode[],
  nodeId: string,
): string {
  const sn = nodes.find((n) => n.id === nodeId);
  if (sn) return sn.title;
  const task = tasks.find((t) => t.id === nodeId || t.graphNodeId === nodeId);
  if (task) return task.title;
  if (nodeId === "goal") return plan.destination;
  for (const p of plan.strategicPillars) {
    if (p.id === nodeId) return p.name;
    const found = findActionDeep(p.actions, nodeId);
    if (found) return found.name;
  }
  return "Unknown";
}

function taskNodeColor(task: StrategyTask): string {
  if (task.status === "done") return "#8A9A5B";
  if (task.priority === "High") return "#933B5B";
  if (task.priority === "Medium") return "#C4A882";
  return "#AABAAE";
}

function taskChildren(task: StrategyTask, tasks: StrategyTask[]): NucleusChild[] {
  return tasksForNode(tasks, task.id).map((child, i) => ({
    id: child.id,
    name: child.title,
    status: child.status,
    recommendation: child.recommendation || `Due ${child.dueDate}`,
    pastelColor: taskNodeColor(child),
    childCount: tasksForNode(tasks, child.id).length,
  }));
}

function nodeChildColor(node: StrategyNode, index: number): string {
  if (node.kind === "course") return PILLAR_PASTELS[0];
  if (node.kind === "club" || node.kind === "work" || node.kind === "research")
    return PILLAR_PASTELS[1];
  if (node.kind === "commitment" || node.kind === "project")
    return PILLAR_PASTELS[2];
  return PILLAR_PASTELS[index % PILLAR_PASTELS.length];
}

function resolveNucleusFromNodes(
  allNodes: StrategyNode[],
  tasks: StrategyTask[],
  focusPath: FocusBreadcrumb[],
): {
  nucleusId: string;
  nucleusName: string;
  nucleusPastel: string;
  children: NucleusChild[];
} | null {
  const rootNode = allNodes.find((n) => n.parentNodeId === null);
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
      status: child.status === "at_risk" ? "At Risk" : child.status === "done" ? "Done" : "On Track",
      recommendation: child.subtitle || child.kind,
      pastelColor: nodeChildColor(child, i),
      childCount: nodesForParent(allNodes, child.id).length + tasksForNode(tasks, child.id).length,
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

function resolveNucleusLevel(
  plan: StrategyPlan,
  tasks: StrategyTask[],
  nodes: StrategyNode[],
  focusPath: FocusBreadcrumb[],
): {
  nucleusId: string;
  nucleusName: string;
  nucleusPastel: string;
  children: NucleusChild[];
} {
  const hasRealNodes = nodes.some((n) => n.parentNodeId === null && n.kind !== "strategic_pillar");
  if (hasRealNodes) {
    const result = resolveNucleusFromNodes(nodes, tasks, focusPath);
    if (result && result.children.length > 0) return result;
  }
  if (focusPath.length === 0) {
    return {
      nucleusId: "goal",
      nucleusName: plan.destination,
      nucleusPastel: GOAL_PASTEL,
      children: [
        ...plan.strategicPillars.map((p, i) => ({
          id: p.id,
          name: p.name,
          status: p.status,
          recommendation: p.reason,
          pastelColor: PILLAR_PASTELS[i % PILLAR_PASTELS.length],
          childCount: p.actions.length + tasksForNode(tasks, p.id).length,
        })),
        ...tasksForNode(tasks, "goal").map((task) => ({
          id: task.id,
          name: task.title,
          status: task.status,
          recommendation: task.recommendation || `Due ${task.dueDate}`,
          pastelColor: taskNodeColor(task),
          childCount: tasksForNode(tasks, task.id).length,
        })),
      ],
    };
  }

  const focusedTask = tasks.find(
    (task) => task.id === focusPath[focusPath.length - 1]?.id,
  );
  if (focusedTask) {
    return {
      nucleusId: focusedTask.id,
      nucleusName: focusedTask.title,
      nucleusPastel: taskNodeColor(focusedTask),
      children: taskChildren(focusedTask, tasks),
    };
  }

  const pillar = plan.strategicPillars.find(
    (p) => p.id === focusPath[0].id,
  );
  if (!pillar) {
    return {
      nucleusId: "goal",
      nucleusName: plan.destination,
      nucleusPastel: GOAL_PASTEL,
      children: [],
    };
  }

  const pillarIdx = plan.strategicPillars.indexOf(pillar);
  const basePastel = PILLAR_PASTELS[pillarIdx % PILLAR_PASTELS.length];

  if (focusPath.length === 1) {
    return {
      nucleusId: pillar.id,
      nucleusName: pillar.name,
      nucleusPastel: basePastel,
      children: [
        ...pillar.actions.map((a) => ({
          id: a.id,
          name: a.name,
          status: a.status,
          recommendation: a.recommendation,
          pastelColor: basePastel,
          childCount:
            (a.children?.length ?? 0) + tasksForNode(tasks, a.id).length,
        })),
        ...tasksForNode(tasks, pillar.id).map((task) => ({
          id: task.id,
          name: task.title,
          status: task.status,
          recommendation: task.recommendation || `Due ${task.dueDate}`,
          pastelColor: taskNodeColor(task),
          childCount: tasksForNode(tasks, task.id).length,
        })),
      ],
    };
  }

  let actions: ActionNode[] = pillar.actions;
  for (let i = 1; i < focusPath.length; i++) {
    const action = actions.find((a) => a.id === focusPath[i].id);
    if (!action) {
      return {
        nucleusId: pillar.id,
        nucleusName: pillar.name,
        nucleusPastel: basePastel,
        children: [],
      };
    }
    if (i === focusPath.length - 1) {
      return {
        nucleusId: action.id,
        nucleusName: action.name,
        nucleusPastel: basePastel,
        children: [
          ...(action.children ?? []).map((c) => ({
            id: c.id,
            name: c.name,
            status: c.status,
            recommendation: c.recommendation,
            pastelColor: basePastel,
            childCount:
              (c.children?.length ?? 0) + tasksForNode(tasks, c.id).length,
          })),
          ...tasksForNode(tasks, action.id).map((task) => ({
            id: task.id,
            name: task.title,
            status: task.status,
            recommendation: task.recommendation || `Due ${task.dueDate}`,
            pastelColor: taskNodeColor(task),
            childCount: tasksForNode(tasks, task.id).length,
          })),
        ],
      };
    }
    actions = action.children ?? [];
  }

  return {
    nucleusId: "goal",
    nucleusName: plan.destination,
    nucleusPastel: GOAL_PASTEL,
    children: [],
  };
}

export default function GoalTree({
  plan,
  planId,
  nodes,
  actionStates,
  tasks,
  rollups,
  markAction,
  onCreateTask,
  onMarkTask,
  isDemo,
  onToggleToday,
  displayMode = "full",
  layoutOverride,
}: GoalTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const [dockOpen, setDockOpen] = useState(false);
  const [focusPath, setFocusPath] = useState<FocusBreadcrumb[]>([]);
  const [exploreDialogId, setExploreDialogId] = useState<string | null>(null);
  const [didAutoFocus, setDidAutoFocus] = useState(false);

  const onboarding = displayMode === "onboarding";
  const preview = displayMode === "preview";
  const explore = displayMode === "full";

  useEffect(() => {
    if (!explore || didAutoFocus || nodes.length === 0) return;
    const rootNode = nodes.find((n) => n.parentNodeId === null);
    if (!rootNode) return;

    const yearNode = nodes.find(
      (n) => n.parentNodeId === rootNode.id && n.kind === "academic_year",
    );
    if (!yearNode) return;

    const semesterNode = nodes.find(
      (n) => n.parentNodeId === yearNode.id && n.kind === "semester",
    );

    const path: FocusBreadcrumb[] = [{ id: yearNode.id, name: yearNode.title }];
    if (semesterNode) {
      path.push({ id: semesterNode.id, name: semesterNode.title });
    }
    setFocusPath(path);
    setDidAutoFocus(true);
  }, [explore, nodes, didAutoFocus]);

  const nucleusLevel = useMemo(() => {
    if (!explore) return null;
    return resolveNucleusLevel(plan, tasks, nodes, focusPath);
  }, [explore, plan, tasks, nodes, focusPath]);

  const nucleusLayout = useMemo(() => {
    if (!nucleusLevel) return undefined;
    return buildNucleusLayout(
      {
        id: nucleusLevel.nucleusId,
        name: nucleusLevel.nucleusName,
        pastelColor: nucleusLevel.nucleusPastel,
        childCount: nucleusLevel.children.length,
      },
      nucleusLevel.children,
    );
  }, [nucleusLevel]);

  const { hover, selection, select, clearSelection, selectBottleneck } =
    useGraphScene({
      containerRef,
      labelsRef,
      pillars: plan.strategicPillars,
      destination: plan.destination,
      mainBottleneck: plan.mainBottleneck,
      actionStates,
      rollups,
      isReadOnly: onboarding || preview,
      showAllNodes: preview,
      layoutOverride: explore ? nucleusLayout : layoutOverride,
    });

  const toggleDock = useCallback(() => setDockOpen((v) => !v), []);

  // Handle clicks in Explore mode
  useEffect(() => {
    if (!explore || !selection) return;
    const nodeId = selection.nodeId;

    const currentNucleusId =
      focusPath.length === 0
        ? "goal"
        : focusPath[focusPath.length - 1].id;

    if (nodeId === currentNucleusId) {
      // Clicked the nucleus - show task dialog
      setExploreDialogId(nodeId);
      clearSelection();
      return;
    }

    // Clicked an orbit node - only drill in, no dialog
    const name = findNodeName(plan, tasks, nodes, nodeId);
    setFocusPath((prev) => [...prev, { id: nodeId, name }]);
    setExploreDialogId(null);
    clearSelection();
  }, [selection, explore, focusPath, plan, tasks, nodes, clearSelection]);

  const closeExploreDialog = useCallback(() => {
    setExploreDialogId(null);
  }, []);

  const navigateToLevel = useCallback((index: number) => {
    setFocusPath((prev) => prev.slice(0, index));
    setExploreDialogId(null);
  }, []);

  // Build selection object for NodeTaskDialog from exploreDialogId
  const exploreSelection: GraphSelection = useMemo(() => {
    if (!explore || !exploreDialogId) return null;
    return { kind: "pillar", nodeId: exploreDialogId };
  }, [explore, exploreDialogId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (exploreDialogId) {
          setExploreDialogId(null);
          return;
        }
        if (explore && focusPath.length > 0) {
          setFocusPath((prev) => prev.slice(0, -1));
          return;
        }
        clearSelection();
      }
      if (
        (e.key === "t" || e.key === "T") &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        onToggleToday();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearSelection, onToggleToday, explore, focusPath, exploreDialogId]);

  const hasBottleneck = plan.strategicPillars.some(
    (p) => p.status === "Weak" || p.status === "Missing",
  );
  const hideNonExploreChrome = preview || onboarding || explore;

  return (
    <div className="relative h-full w-full min-h-0 overflow-hidden bg-base">
      <div
        ref={containerRef}
        className="absolute inset-0"
        aria-label={
          onboarding
            ? "Strategy map preview, updating as you answer"
            : "Goal tree visualization"
        }
      />
      <div
        ref={labelsRef}
        className="pointer-events-none absolute inset-0 z-10"
      />

      {explore ? (
        <ExploreBreadcrumb
          destination={plan.destination}
          focusPath={focusPath}
          onNavigate={navigateToLevel}
        />
      ) : null}

      {hideNonExploreChrome ? null : (
        <StrategyHUD
          plan={plan}
          planId={planId}
          hasBottleneck={hasBottleneck}
          onFocusBottleneck={selectBottleneck}
          isDemo={isDemo}
        />
      )}

      {selection || onboarding || explore ? null : (
        <NodePopover hover={hover} />
      )}

      {/* Task dialog: shown in both normal and explore modes */}
      {explore ? (
        <NodeTaskDialog
          plan={plan}
          selection={exploreSelection}
          tasks={tasks}
          onClose={closeExploreDialog}
          onCreateTask={onCreateTask}
          onMarkTask={onMarkTask}
          isDemo={isDemo}
        />
      ) : hideNonExploreChrome ? null : (
        <NodeTaskDialog
          plan={plan}
          selection={selection}
          tasks={tasks}
          onClose={clearSelection}
          onCreateTask={onCreateTask}
          onMarkTask={onMarkTask}
          isDemo={isDemo}
        />
      )}

      {hideNonExploreChrome ? null : (
        <IntelligenceDock
          plan={plan}
          actionStates={actionStates}
          onToggleAction={markAction}
          open={dockOpen}
          onToggle={toggleDock}
          isDemo={isDemo}
        />
      )}

      {explore ? (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-[11px] text-tertiary md:bottom-6">
          Click a node to add tasks · Esc to go back
        </div>
      ) : hideNonExploreChrome ? null : (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-[11px] text-tertiary md:bottom-6">
          {selection
            ? "Click goal or press Esc to return"
            : "Click a pillar to expand \u00b7 drag to pan \u00b7 scroll to zoom \u00b7 press T for today"}
        </div>
      )}
    </div>
  );
}

function ExploreBreadcrumb({
  destination,
  focusPath,
  onNavigate,
}: {
  destination: string;
  focusPath: FocusBreadcrumb[];
  onNavigate: (index: number) => void;
}) {
  return (
    <div className="pointer-events-auto absolute left-4 top-4 z-20 flex items-center gap-1.5 md:left-6 md:top-6">
      {focusPath.length > 0 ? (
        <button
          type="button"
          onClick={() => onNavigate(focusPath.length - 1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface/90 text-secondary shadow-soft backdrop-blur-sm transition-colors hover:text-primary"
          aria-label="Go back"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M9 3L5 7l4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}

      <div className="flex items-center gap-1 rounded-lg border border-border bg-surface/90 px-3 py-1.5 shadow-soft backdrop-blur-sm">
        <button
          type="button"
          onClick={() => onNavigate(0)}
          className={
            "text-[12px] font-medium transition-colors " +
            (focusPath.length === 0
              ? "text-primary"
              : "text-tertiary hover:text-primary")
          }
        >
          {destination}
        </button>
        {focusPath.map((entry, i) => (
          <span key={entry.id} className="flex items-center gap-1">
            <span className="text-[11px] text-tertiary">/</span>
            <button
              type="button"
              onClick={() => onNavigate(i + 1)}
              className={
                "text-[12px] font-medium transition-colors " +
                (i === focusPath.length - 1
                  ? "text-primary underline underline-offset-2"
                  : "text-tertiary hover:text-primary")
              }
            >
              {entry.name}
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
