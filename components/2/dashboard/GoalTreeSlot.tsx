"use client";

import dynamic from "next/dynamic";
import { GoalTreeLoading } from "@/components/2/graph/GoalTreeLoading";
import { usePlan } from "./PlanProvider";

const GoalTree = dynamic(() => import("@/components/2/graph/GoalTree"), {
  ssr: false,
  loading: () => <GoalTreeLoading />,
});

type Props = {
  onToggleToday: () => void;
  displayMode?: "preview" | "full";
};

export function GoalTreeSlot({ onToggleToday, displayMode = "full" }: Props) {
  const {
    plan,
    planId,
    stored,
    tasks,
    markAction,
    createTask,
    markTask,
    isDemo,
  } = usePlan();
  return (
    <GoalTree
      plan={plan}
      planId={planId}
      actionStates={stored.actionStates}
      tasks={tasks}
      markAction={markAction}
      onCreateTask={createTask}
      onMarkTask={markTask}
      isDemo={isDemo}
      onToggleToday={onToggleToday}
      displayMode={displayMode}
    />
  );
}
