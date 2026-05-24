"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/2/ui/Button";
import { PlanProvider, usePlanOptional } from "./PlanProvider";
import { DashboardWorkspace } from "./DashboardWorkspace";
import { TodayOverlay } from "./TodayOverlay";

type Props = {
  planId: string;
};

export function DashboardLayout({ planId }: Props) {
  return (
    <PlanProvider planId={planId}>
      <DashboardShell />
    </PlanProvider>
  );
}

function DashboardShell() {
  const ctx = usePlanOptional();
  const [todayOpen, setTodayOpen] = useState(false);
  const toggleToday = useCallback(() => setTodayOpen((v) => !v), []);

  if (!ctx) {
    return <DashboardEmpty />;
  }

  return (
    <div id="main" className="flex h-full min-h-screen flex-col bg-base">
      <div className="min-w-0 flex-1 overflow-y-auto">
        <DashboardWorkspace onToggleToday={toggleToday} />
      </div>
      <TodayOverlay open={todayOpen} onClose={() => setTodayOpen(false)} />
    </div>
  );
}

function DashboardEmpty() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-card">
        <h1 className="font-display text-2xl font-semibold text-primary">
          No plan on this device yet
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-secondary">
          Strategy plans live with the demo plan for now. Open the demo plan
          from the left sidebar, or start onboarding to build your own.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/2/onboarding">
            <Button>Start onboarding</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">Back to home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
