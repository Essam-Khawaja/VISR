import { useMemo } from "react";
import { buildOnboardingLayout } from "@/components/graph/buildOnboardingLayout";
import type { LayoutEdge, LayoutNode } from "@/components/graph/graphTypes";
import type { StrategyPlan } from "@/lib/types";
import type { OnboardingMapState } from "./onboardingMapTypes";

const SYNTHETIC_PLAN_ID = "onboarding-preview";

function buildSyntheticPlan(mapState: OnboardingMapState): StrategyPlan {
  return {
    id: SYNTHETIC_PLAN_ID,
    studentId: "onboarding",
    destination: mapState.goal?.label ?? "Your Goal",
    currentStage: "Onboarding",
    mainBottleneck: mapState.bottleneckPreview ?? "",
    routeStatus: "Needs Focus",
    alignmentScore: 0,
    strategicPillars: [],
    semesterPriorities: [],
    cutList: [],
    nextSevenDays: [],
    risks: [],
    createdAt: new Date().toISOString(),
  };
}

type OnboardingMapResult = {
  plan: StrategyPlan;
  layoutOverride: { nodes: LayoutNode[]; edges: LayoutEdge[] };
};

export function useOnboardingMap(
  mapState: OnboardingMapState,
): OnboardingMapResult {
  return useMemo(() => {
    const plan = buildSyntheticPlan(mapState);
    const layoutOverride = buildOnboardingLayout(mapState);
    return { plan, layoutOverride };
  }, [mapState]);
}
