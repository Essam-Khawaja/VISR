"use client";

import dynamic from "next/dynamic";
import { GoalTreeLoading } from "@/components/2/graph/GoalTreeLoading";
import { useOnboardingMap } from "./useOnboardingMap";
import { OnboardingInsightStrip } from "./OnboardingInsightStrip";
import type { OnboardingMapState } from "./onboardingMapTypes";

const GoalTree = dynamic(() => import("@/components/2/graph/GoalTree"), {
  ssr: false,
  loading: () => <GoalTreeLoading />,
});

type Props = {
  mapState: OnboardingMapState;
  insight: string | null;
  isInsightLoading: boolean;
};

export function OnboardingMapPanel({ mapState, insight, isInsightLoading }: Props) {
  const { plan, layoutOverride } = useOnboardingMap(mapState);
  const hasContent = mapState.goal !== null;

  return (
    <div
      className="relative h-full w-full bg-base"
      aria-label="Strategy map preview, updating as you answer"
    >
      <div className="pointer-events-none absolute left-4 top-4 z-20 w-[min(320px,calc(100%-2rem))]">
        <div className="pointer-events-auto">
          <OnboardingInsightStrip insight={insight} isLoading={isInsightLoading} />
        </div>
      </div>

      {hasContent ? (
        <GoalTree
          plan={plan}
          planId="onboarding-preview"
          actionStates={{}}
          tasks={[]}
          rollups={{}}
          markAction={() => {}}
          onCreateTask={async () => {}}
          onMarkTask={async () => {}}
          isDemo={false}
          onToggleToday={() => {}}
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
