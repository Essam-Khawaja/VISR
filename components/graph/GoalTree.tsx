"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IntelligenceDock } from "@/components/dashboard/IntelligenceDock";
import { NodePopover } from "./NodePopover";
import { NodeTaskDialog } from "./NodeTaskDialog";
import { StrategyHUD } from "./StrategyHUD";
import { useGraphScene, type ActionState } from "./useGraphScene";
import type { LayoutEdge, LayoutNode } from "./graphTypes";
import type { StrategyPlan } from "@/lib/types";

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
  onNodeClick?: (pillarId: string) => void;
  displayMode?: "onboarding" | "preview" | "full";
  layoutOverride?: { nodes: LayoutNode[]; edges: LayoutEdge[] };
};

export default function GoalTree({
  plan,
  planId,
  actionStates,
  markAction,
  isDemo,
  onToggleToday,
  onAddTasks,
  onNodeClick,
  displayMode = "full",
  layoutOverride,
}: GoalTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const [dockOpen, setDockOpen] = useState(false);
  const onboarding = displayMode === "onboarding";

  const { hover, selection, select, clearSelection, selectBottleneck } =
    useGraphScene({
      containerRef,
      labelsRef,
      pillars: plan.strategicPillars,
      destination: plan.destination,
      mainBottleneck: plan.mainBottleneck,
      actionStates,
      isReadOnly: onboarding,
      layoutOverride,
    });

  const toggleDock = useCallback(() => setDockOpen((v) => !v), []);

  useEffect(() => {
    if (selection?.kind === "pillar" && onNodeClick) {
      onNodeClick(selection.nodeId);
    }
  }, [selection, onNodeClick]);

  const handleAddTasks = useCallback(
    (
      parentNodeId: string,
      tasks: { name: string; recommendation: string }[],
    ) => {
      onAddTasks?.(parentNodeId, tasks);
    },
    [onAddTasks],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") clearSelection();
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
  }, [clearSelection, onToggleToday]);

  const hasBottleneck = plan.strategicPillars.some(
    (p) => p.status === "Weak" || p.status === "Missing",
  );
  const preview = displayMode === "preview";
  const hideChrome = preview || onboarding;

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

      {hideChrome ? null : (
        <StrategyHUD
          plan={plan}
          planId={planId}
          hasBottleneck={hasBottleneck}
          onFocusBottleneck={selectBottleneck}
          isDemo={isDemo}
        />
      )}

      {selection || onboarding ? null : <NodePopover hover={hover} />}

      {hideChrome ? null : (
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

      {hideChrome ? null : (
        <IntelligenceDock
          plan={plan}
          actionStates={actionStates}
          onToggleAction={markAction}
          open={dockOpen}
          onToggle={toggleDock}
          isDemo={isDemo}
        />
      )}

      {hideChrome ? null : (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-[11px] text-tertiary md:bottom-6">
          {selection
            ? "Click goal or press Esc to return"
            : "Click a pillar to expand \u00b7 drag to pan \u00b7 scroll to zoom \u00b7 press T for today"}
        </div>
      )}
    </div>
  );
}
