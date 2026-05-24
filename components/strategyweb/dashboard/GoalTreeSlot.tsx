"use client";

import dynamic from "next/dynamic";
import { GoalTreeLoading } from "@/components/strategyweb/graph/GoalTreeLoading";
import { usePlan } from "./PlanProvider";

const GoalTree = dynamic(() => import("@/components/strategyweb/graph/GoalTree"), {
  ssr: false,
  loading: () => <GoalTreeLoading />,
});

type Props = {
  displayMode?: "preview" | "full";
};

export function GoalTreeSlot({ displayMode = "full" }: Props) {
  const {
    plan,
    planId,
    stored,
    nodes,
    tasks,
    rollups,
    nextSevenDayTasks,
    markAction,
    createTask,
    markTask,
    isDemo,
  } = usePlan();
  return (
    <GoalTree
      plan={plan}
      planId={planId}
      nodes={nodes}
      actionStates={stored.actionStates}
      tasks={tasks}
      nextSevenDayTasks={nextSevenDayTasks}
      rollups={rollups}
      markAction={markAction}
      onCreateTask={createTask}
      onMarkTask={markTask}
      isDemo={isDemo}
      displayMode={displayMode}
    />
  );
}
