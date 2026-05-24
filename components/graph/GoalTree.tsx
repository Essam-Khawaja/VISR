"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IntelligenceDock } from "@/components/dashboard/IntelligenceDock";
import { NodePopover } from "./NodePopover";
import { NodeTaskDialog } from "./NodeTaskDialog";
import { StrategyHUD } from "./StrategyHUD";
import { buildNucleusLayout, type NucleusChild } from "./graphLayout";
import { useGraphScene, type ActionState } from "./useGraphScene";
import type { LayoutEdge, LayoutNode, GraphSelection } from "./graphTypes";
import type { ActionNode, StrategyPlan } from "@/lib/types";

const PILLAR_PASTELS = [
  "#8B4A6B",
  "#9B9267",
  "#B5707E",
  "#C4A882",
  "#8FA68B",
  "#7E6B8A",
];
const GOAL_PASTEL = "#7D9B8A";

type FocusBreadcrumb = { id: string; name: string };

export type GoalTreeProps = {
  plan: StrategyPlan;
  planId: string;
  actionStates: Record<string, ActionState>;
  markAction: (actionId: string, state: ActionState) => void;
  isDemo: boolean;
  onToggleToday: () => void;
  onAddTasks?: (
    parentNodeId: string,
    tasks: { name: string; recommendation: string }[],
  ) => void;
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

function findNodeName(plan: StrategyPlan, nodeId: string): string {
  if (nodeId === "goal") return plan.destination;
  for (const p of plan.strategicPillars) {
    if (p.id === nodeId) return p.name;
    const found = findActionDeep(p.actions, nodeId);
    if (found) return found.name;
  }
  return "Unknown";
}

function resolveNucleusLevel(
  plan: StrategyPlan,
  focusPath: FocusBreadcrumb[],
): {
  nucleusId: string;
  nucleusName: string;
  nucleusPastel: string;
  children: NucleusChild[];
} {
  if (focusPath.length === 0) {
    return {
      nucleusId: "goal",
      nucleusName: plan.destination,
      nucleusPastel: GOAL_PASTEL,
      children: plan.strategicPillars.map((p, i) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        recommendation: p.reason,
        pastelColor: PILLAR_PASTELS[i % PILLAR_PASTELS.length],
        childCount: p.actions.length,
      })),
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
      children: pillar.actions.map((a) => ({
        id: a.id,
        name: a.name,
        status: a.status,
        recommendation: a.recommendation,
        pastelColor: basePastel,
        childCount: a.children?.length ?? 0,
      })),
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
        children: (action.children ?? []).map((c) => ({
          id: c.id,
          name: c.name,
          status: c.status,
          recommendation: c.recommendation,
          pastelColor: basePastel,
          childCount: c.children?.length ?? 0,
        })),
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
  actionStates,
  markAction,
  isDemo,
  onToggleToday,
  onAddTasks,
  displayMode = "full",
  layoutOverride,
}: GoalTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const [dockOpen, setDockOpen] = useState(false);
  const [focusPath, setFocusPath] = useState<FocusBreadcrumb[]>([]);
  const [exploreDialogId, setExploreDialogId] = useState<string | null>(null);

  const onboarding = displayMode === "onboarding";
  const preview = displayMode === "preview";
  const explore = displayMode === "full";

  const nucleusLevel = useMemo(() => {
    if (!explore) return null;
    return resolveNucleusLevel(plan, focusPath);
  }, [explore, plan, focusPath]);

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
      isReadOnly: onboarding || preview,
      showAllNodes: preview,
      layoutOverride: explore ? nucleusLayout : layoutOverride,
    });

  const toggleDock = useCallback(() => setDockOpen((v) => !v), []);

  const handleAddTasks = useCallback(
    (
      parentNodeId: string,
      tasks: { name: string; recommendation: string }[],
    ) => {
      onAddTasks?.(parentNodeId, tasks);
    },
    [onAddTasks],
  );

  // Handle clicks in Explore mode
  useEffect(() => {
    if (!explore || !selection) return;
    const nodeId = selection.nodeId;

    const currentNucleusId =
      focusPath.length === 0
        ? "goal"
        : focusPath[focusPath.length - 1].id;

    if (nodeId === currentNucleusId) {
      // Clicked the nucleus — show task dialog
      setExploreDialogId(nodeId);
      clearSelection();
      return;
    }

    // Clicked an orbit node — only drill in, no dialog
    const name = findNodeName(plan, nodeId);
    setFocusPath((prev) => [...prev, { id: nodeId, name }]);
    setExploreDialogId(null);
    clearSelection();
  }, [selection, explore, focusPath, plan, clearSelection]);

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
        aria-hidden
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
          actionStates={actionStates}
          onSelect={select}
          onClose={closeExploreDialog}
          onToggleAction={markAction}
          onAddTasks={handleAddTasks}
          isDemo={isDemo}
        />
      ) : hideNonExploreChrome ? null : (
        <NodeTaskDialog
          plan={plan}
          selection={selection}
          actionStates={actionStates}
          onSelect={select}
          onClose={clearSelection}
          onToggleAction={markAction}
          onAddTasks={handleAddTasks}
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
