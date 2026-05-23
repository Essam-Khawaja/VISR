"use client";

import { GoalTreePlaceholder } from "./GoalTreePlaceholder";
import type { StrategyPlan } from "@/lib/types";

type Props = {
  plan: StrategyPlan;
};

/**
 * Boundary for the Three.js Goal Tree owned by feat/graph. Until that
 * branch is merged, this renders the radial constellation placeholder.
 *
 * Once feat/graph ships:
 *   const GoalTree = dynamic(() => import("@/components/graph/GoalTree"), {
 *     ssr: false,
 *     loading: () => <GoalTreePlaceholder ... variant="loading" />,
 *   });
 */
export function GoalTreeSlot({ plan }: Props) {
  return (
    <GoalTreePlaceholder
      pillars={plan.strategicPillars}
      destination={plan.destination}
      mainBottleneck={plan.mainBottleneck}
    />
  );
}
