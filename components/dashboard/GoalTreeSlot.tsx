"use client";

import dynamic from "next/dynamic";
import { GoalTreeLoading } from "@/components/graph/GoalTreeLoading";
import { usePlan } from "./PlanProvider";

const GoalTree = dynamic(() => import("@/components/graph/GoalTree"), {
  ssr: false,
  loading: () => <GoalTreeLoading />,
});

type Props = {
  onToggleToday: () => void;
  displayMode?: "preview" | "full";
};

export function GoalTreeSlot({ onToggleToday, displayMode = "full" }: Props) {
  const { plan, planId, stored, markAction, addTasks, isDemo } = usePlan();
  return (
    <GoalTree
      plan={plan}
      planId={planId}
      actionStates={stored.actionStates}
      markAction={markAction}
      isDemo={isDemo}
      onToggleToday={onToggleToday}
      onAddTasks={addTasks}
      displayMode={displayMode}
    />
  );
}
