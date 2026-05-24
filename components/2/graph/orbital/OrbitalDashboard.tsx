"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { NodeTaskDialog } from "@/components/2/graph/NodeTaskDialog";
import type { GraphSelection } from "@/components/2/graph/graphTypes";
import { usePlan } from "@/components/2/dashboard/PlanProvider";
import { demoStudentProfile } from "@/lib/2/demoData";
import {
  FIGMA_DASHBOARD_BG,
  planToOrbitalRoot,
  type OrbitalNodeData,
} from "@/lib/2/orbitalMap";
import { OrbitalBreadcrumb } from "./OrbitalBreadcrumb";
import { OrbitalDashboardSidebar } from "./OrbitalDashboardSidebar";
import { OrbitalMap } from "./OrbitalMap";

type PathEntry = { node: OrbitalNodeData; angle?: number };

type Props = {
  onTodayClick?: () => void;
};

function selectionForNode(nodeId: string): GraphSelection {
  if (nodeId === "goal") {
    return { kind: "pillar", nodeId: "goal" };
  }
  return { kind: "action", nodeId };
}

export function OrbitalDashboard({ onTodayClick }: Props) {
  const { plan, planId, stored, markAction, addTasks, isDemo } = usePlan();
  const root = useMemo(() => planToOrbitalRoot(plan), [plan]);

  const [currentPath, setCurrentPath] = useState<PathEntry[]>([
    { node: root },
  ]);
  const [dialogNodeId, setDialogNodeId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPath([{ node: root }]);
    setDialogNodeId(null);
  }, [root]);

  const currentPathNode = currentPath[currentPath.length - 1];
  const currentNode = currentPathNode.node;
  const parentAngle =
    currentPath.length > 1 ? currentPath[currentPath.length - 1].angle : undefined;

  const categories = root.subGoals;

  const studentName = isDemo ? "Alex Morgan" : "Your strategy";
  const degree = isDemo ? demoStudentProfile.degree : plan.destination;
  const year = isDemo ? demoStudentProfile.year : plan.currentStage;

  const handleNodeClick = useCallback((node: OrbitalNodeData, angle: number) => {
    if (node.subGoals.length > 0) {
      setCurrentPath((prev) => [...prev, { node, angle }]);
      setDialogNodeId(null);
    } else {
      setDialogNodeId(node.id);
    }
  }, []);

  const handleBack = useCallback(() => {
    if (currentPath.length > 1) {
      setCurrentPath((prev) => prev.slice(0, -1));
      setDialogNodeId(null);
    }
  }, [currentPath.length]);

  const handleCategoryClick = useCallback(
    (category: OrbitalNodeData) => {
      const categoryIndex = root.subGoals.findIndex((c) => c.id === category.id);
      if (categoryIndex < 0) return;
      const angleStep = (2 * Math.PI) / root.subGoals.length;
      const angle = categoryIndex * angleStep - Math.PI / 2;
      setCurrentPath([{ node: root }, { node: category, angle }]);
      setDialogNodeId(null);
    },
    [root],
  );

  const dialogSelection: GraphSelection = useMemo(() => {
    if (!dialogNodeId) return null;
    return selectionForNode(dialogNodeId);
  }, [dialogNodeId]);

  const select = useCallback((selection: GraphSelection) => {
    if (!selection) return;
    setDialogNodeId(selection.nodeId);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (dialogNodeId) {
          setDialogNodeId(null);
          return;
        }
        if (currentPath.length > 1) {
          setCurrentPath((prev) => prev.slice(0, -1));
        }
      }
      if (
        (e.key === "t" || e.key === "T") &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        onTodayClick
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
        onTodayClick();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialogNodeId, currentPath.length, onTodayClick]);

  return (
    <div
      className="flex h-full min-h-0 w-full flex-1"
      style={{ backgroundColor: FIGMA_DASHBOARD_BG }}
    >
      <OrbitalDashboardSidebar
        studentName={studentName}
        degree={degree}
        year={year}
        categories={categories}
        planId={planId}
        onCategoryClick={handleCategoryClick}
        onTodayClick={onTodayClick}
      />

      <div className="relative min-h-0 min-w-0 flex-1">
        <OrbitalBreadcrumb
          path={currentPath.map((p) => p.node)}
          onBack={handleBack}
        />
        <div className="flex h-full w-full items-center justify-center px-4 pb-4 pt-16">
          <OrbitalMap
            centerNode={currentNode}
            onNodeClick={handleNodeClick}
            onCenterClick={() => setDialogNodeId(currentNode.id)}
            currentPath={currentPath}
            parentAngle={parentAngle}
          />
        </div>
      </div>

      <NodeTaskDialog
        plan={plan}
        selection={dialogSelection}
        actionStates={stored.actionStates}
        onSelect={select}
        onClose={() => setDialogNodeId(null)}
        onToggleAction={markAction}
        onAddTasks={addTasks}
        isDemo={isDemo}
      />
    </div>
  );
}
