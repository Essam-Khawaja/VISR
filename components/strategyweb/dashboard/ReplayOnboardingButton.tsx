"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/strategyweb/ui/Button";
import { resetPlanForReplay } from "@/lib/strategyweb/replayOnboarding";
import { usePlan } from "./PlanProvider";

const CONFIRM_MESSAGE =
  "Clear this plan’s saved graph and tasks, then start onboarding again? This cannot be undone.";

export function DemoReplayStrip({ className = "" }: { className?: string }) {
  return (
    <div
      className={
        "flex flex-col gap-3 rounded-xl border border-dashed border-border bg-elevated/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between " +
        className
      }
    >
      <p className="text-[12px] leading-relaxed text-secondary">
        Demo: reset graph and re-run onboarding (clears local and cloud data for
        this plan)
      </p>
      <ReplayOnboardingButton />
    </div>
  );
}

export function ReplayOnboardingButton() {
  const { planId } = usePlan();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleReplay = useCallback(async () => {
    if (!window.confirm(CONFIRM_MESSAGE)) return;
    setLoading(true);
    try {
      await resetPlanForReplay(planId);
      router.replace("/strategyweb/onboarding");
    } finally {
      setLoading(false);
    }
  }, [planId, router]);

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => void handleReplay()}
      disabled={loading}
      className="shrink-0"
    >
      {loading ? "Resetting…" : "Replay onboarding"}
    </Button>
  );
}
