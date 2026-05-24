"use client";

import { useCallback } from "react";
import dynamic from "next/dynamic";
import { GoalTreeLoading } from "@/components/2/graph/GoalTreeLoading";
import type { NodeRollup } from "@/lib/2/taskStore";
import type { ActionState } from "@/lib/2/planStore";
import { useOnboardingMap } from "./useOnboardingMap";
import { OnboardingInsightStrip } from "./OnboardingInsightStrip";
import type { OnboardingMapState } from "./onboardingMapTypes";

const GoalTree = dynamic(() => import("@/components/2/graph/GoalTree"), {
  ssr: false,
  loading: () => <GoalTreeLoading />,
});

const EMPTY_ROLLUPS: Record<string, NodeRollup> = {};
const EMPTY_ACTION_STATES: Record<string, ActionState> = {};

type Props = {
  mapState: OnboardingMapState;
  insight: string | null;
  isInsightLoading: boolean;
};

export function OnboardingMapPanel({ mapState, insight, isInsightLoading }: Props) {
  const { plan, layoutOverride } = useOnboardingMap(mapState);
  const hasContent = mapState.goal !== null;

  const noop = useCallback(() => {}, []);
  const noopAsync = useCallback(async () => {}, []);

  return (
    <div
      className="relative h-full w-full bg-base"
      aria-label="Strategy map preview, updating as you answer"
    >
      <div className="pointer-events-none absolute bottom-5 left-4 z-20 w-[min(360px,calc(100%-2rem))] sm:bottom-6 sm:left-6">
        <div className="pointer-events-auto">
          <OnboardingInsightStrip insight={insight} isLoading={isInsightLoading} />
        </div>
      </div>

      {hasContent ? (
        <GoalTree
          plan={plan}
          planId="onboarding-preview"
          nodes={[]}
          actionStates={EMPTY_ACTION_STATES}
          tasks={[]}
          rollups={EMPTY_ROLLUPS}
          markAction={noop}
          onCreateTask={noopAsync}
          onMarkTask={noopAsync}
          isDemo={false}
          displayMode="onboarding"
          layoutOverride={layoutOverride}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-16 w-16 rounded-full border-2 border-dashed border-border" />
            <p className="text-[13px] text-tertiary">
              Your strategy map will appear here
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
