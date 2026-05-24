/**
 * components/strategyweb/graph/GoalTree.tsx
 *
 * The Three.js Strategy Map. The same component is used in three modes:
 *   - "onboarding" : minimal radial preview that grows as the user types.
 *   - "preview"    : compact card on the dashboard.
 *   - "full"       : full-screen Explore Map with HUD and intelligence dock.
 *
 * Layout, node meshes, edges, and animations live in sibling files so
 * this file stays focused on data wiring, hover/select state, and the
 * popover/dialog overlays.
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IntelligenceDock } from "@/components/strategyweb/dashboard/IntelligenceDock";
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
} from "@/lib/strategyweb/types";
import {
  tasksForNode,
  type CreateStrategyTaskInput,
  type NodeRollup,
} from "@/lib/strategyweb/taskStore";
import {
  buildSemesterFocusPath,
  buildScopedNucleusLayout,
  getRootNode,
  getRootNodeId,
  hasUniversityNodes,
  resolveNucleusFromNodes,
  type FocusBreadcrumb,
} from "./universityGraphLayout";

const PILLAR_PASTELS = [
  "#933B5B", // amaranth
  "#B5728A", // thulian
  "#9F9679", // pomelo olive
  "#8A9A5B", // sage
  "#AABAAE", // brook green
  "#C4A882", // chalk-dark
];
const GOAL_PASTEL = "#AABAAE"; // brook green

export type GoalTreeProps = {
  plan: StrategyPlan;
  planId: string;
  nodes: StrategyNode[];
  actionStates: Record<string, ActionState>;
  tasks: StrategyTask[];
  nextSevenDayTasks?: StrategyTask[];
  rollups: Record<string, NodeRollup>;
  markAction: (actionId: string, state: ActionState) => void;
  onCreateTask: (input: Omit<CreateStrategyTaskInput, "planId">) => Promise<void>;
  onMarkTask: (taskId: string, state: StrategyTaskStatus) => Promise<void>;
  isDemo: boolean;
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
  if (hasUniversityNodes(nodes)) {
    const result = resolveNucleusFromNodes(nodes, tasks, focusPath);
    if (result) return result;
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
  nextSevenDayTasks = [],
  rollups,
  markAction,
  onCreateTask,
  onMarkTask,
  isDemo,
  displayMode = "full",
  layoutOverride,
}: GoalTreeProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const [dockOpen, setDockOpen] = useState(false);
  const [focusPath, setFocusPath] = useState<FocusBreadcrumb[]>([]);
  const [exploreDialogId, setExploreDialogId] = useState<string | null>(null);
  const [didAutoFocus, setDidAutoFocus] = useState(false);

  useEffect(() => {
    setDidAutoFocus(false);
  }, [planId]);

  const onboarding = displayMode === "onboarding";
  const preview = displayMode === "preview";
  const explore = displayMode === "full";
  const universityMode = hasUniversityNodes(nodes);

  const rootNodeTitle =
    getRootNode(nodes)?.title ?? plan.destination;

  useEffect(() => {
    if (!explore || didAutoFocus || nodes.length === 0 || !universityMode) {
      return;
    }
    setFocusPath(buildSemesterFocusPath(nodes));
    setDidAutoFocus(true);
  }, [explore, nodes, didAutoFocus, universityMode]);

  const previewFocusPath = useMemo(() => {
    if (!preview || !universityMode) return [];
    return buildSemesterFocusPath(nodes);
  }, [preview, universityMode, nodes]);

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

  const previewLayout = useMemo(() => {
    if (!preview || !universityMode) return undefined;
    return buildScopedNucleusLayout(nodes, tasks, previewFocusPath);
  }, [preview, universityMode, nodes, tasks, previewFocusPath]);

  const activeLayoutOverride = explore
    ? nucleusLayout
    : preview
      ? previewLayout
      : layoutOverride;

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
      // During onboarding we want pan/zoom but no clicks, so unlock the camera.
      // Preview cards stay frozen; explore is fully interactive.
      lockCamera: preview,
      showAllNodes: preview && !universityMode,
      layoutOverride: activeLayoutOverride,
    });

  const toggleDock = useCallback(() => setDockOpen((v) => !v), []);

  // Handle clicks in Explore mode
  useEffect(() => {
    if (!explore || !selection || !nucleusLevel) return;
    const nodeId = selection.nodeId;

    if (nodeId === nucleusLevel.nucleusId) {
      setExploreDialogId(nodeId);
      clearSelection();
      return;
    }

    const name = findNodeName(plan, tasks, nodes, nodeId);
    setFocusPath((prev) => [...prev, { id: nodeId, name }]);
    setExploreDialogId(null);
    clearSelection();
  }, [selection, explore, nucleusLevel, plan, tasks, nodes, clearSelection]);

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
        router.push("/flowgram");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearSelection, router, explore, focusPath, exploreDialogId]);

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
          rootLabel={rootNodeTitle}
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
          nodes={nodes}
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
          nodes={nodes}
          onClose={clearSelection}
          onCreateTask={onCreateTask}
          onMarkTask={onMarkTask}
          isDemo={isDemo}
        />
      )}

      {hideNonExploreChrome ? null : (
        <IntelligenceDock
          tasks={nextSevenDayTasks}
          onMarkTask={onMarkTask}
          open={dockOpen}
          onToggle={toggleDock}
          isDemo={isDemo}
        />
      )}

      {explore ? (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 max-w-[min(100%,28rem)] -translate-x-1/2 px-4 text-center text-[11px] text-tertiary md:bottom-6">
          Click center node to add tasks · Click orbit to drill in · Esc to go
          back
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
  rootLabel,
  focusPath,
  onNavigate,
}: {
  rootLabel: string;
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
          {rootLabel}
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
