"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IntelligenceDock } from "@/components/dashboard/IntelligenceDock";
import { NodePopover } from "./NodePopover";
import { SelectionCard } from "./SelectionCard";
import { StrategyHUD } from "./StrategyHUD";
import { useGraphScene, type ActionState } from "./useGraphScene";
import type { StrategyPlan } from "@/lib/types";

export type GoalTreeProps = {
  plan: StrategyPlan;
  planId: string;
  actionStates: Record<string, ActionState>;
  markAction: (actionId: string, state: ActionState) => void;
  isDemo: boolean;
  onToggleToday: () => void;
};

export default function GoalTree({
  plan,
  planId,
  actionStates,
  markAction,
  isDemo,
  onToggleToday,
}: GoalTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const [dockOpen, setDockOpen] = useState(false);

  const { hover, selection, select, clearSelection, selectBottleneck } =
    useGraphScene({
      containerRef,
      labelsRef,
      pillars: plan.strategicPillars,
      destination: plan.destination,
      mainBottleneck: plan.mainBottleneck,
      actionStates,
    });

  const toggleDock = useCallback(() => setDockOpen((v) => !v), []);

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

  return (
    <div className="relative h-full w-full min-h-0 overflow-hidden bg-base">
      <div
        ref={containerRef}
        className="absolute inset-0"
        aria-label="Goal tree visualization"
      />
      <div
        ref={labelsRef}
        className="pointer-events-none absolute inset-0 z-10"
        aria-hidden
      />

      <StrategyHUD
        plan={plan}
        planId={planId}
        hasBottleneck={hasBottleneck}
        onFocusBottleneck={selectBottleneck}
        isDemo={isDemo}
      />

      {selection ? null : <NodePopover hover={hover} />}

      <SelectionCard
        plan={plan}
        selection={selection}
        actionStates={actionStates}
        onSelect={select}
        onClose={clearSelection}
        onToggleAction={markAction}
        isDemo={isDemo}
      />

      <IntelligenceDock
        plan={plan}
        actionStates={actionStates}
        onToggleAction={markAction}
        open={dockOpen}
        onToggle={toggleDock}
        isDemo={isDemo}
      />

      <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-[11px] text-tertiary md:bottom-6">
        {selection
          ? "Click goal or press Esc to return"
          : "Click a pillar to expand · drag to pan · scroll to zoom · press T for today"}
      </div>
    </div>
  );
}
