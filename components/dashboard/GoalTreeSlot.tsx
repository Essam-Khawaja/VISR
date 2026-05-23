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
};

export function GoalTreeSlot({ onToggleToday }: Props) {
  const { plan, planId, stored, markAction, isDemo } = usePlan();
  return (
    <GoalTree
      plan={plan}
      planId={planId}
      actionStates={stored.actionStates}
      markAction={markAction}
      isDemo={isDemo}
      onToggleToday={onToggleToday}
    />
  );
}
