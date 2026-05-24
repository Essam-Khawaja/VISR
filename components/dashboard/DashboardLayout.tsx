"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Button } from "@/components/ui/Button";
import { PlanProvider, usePlanOptional } from "./PlanProvider";
import { DashboardWorkspace } from "./DashboardWorkspace";
import { TodayOverlay } from "./TodayOverlay";

type Props = {
  planId: string;
};

export function DashboardLayout({ planId }: Props) {
  return (
    <PlanProvider planId={planId}>
      <DashboardShell planId={planId} />
    </PlanProvider>
  );
}

function DashboardShell({ planId }: { planId: string }) {
  const ctx = usePlanOptional();
  const [todayOpen, setTodayOpen] = useState(false);
  const toggleToday = useCallback(() => setTodayOpen((v) => !v), []);

  if (!ctx) {
    return <DashboardEmpty />;
  }

  return (
    <main id="main" className="flex h-screen overflow-hidden bg-base">
      <DashboardSidebar planId={planId} onTodayClick={toggleToday} />
      <div className="min-w-0 flex-1 overflow-y-auto">
        <DashboardWorkspace onToggleToday={toggleToday} />
      </div>
      <TodayOverlay open={todayOpen} onClose={() => setTodayOpen(false)} />
    </main>
  );
}

function DashboardEmpty() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base px-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-card">
        <h1 className="font-display text-2xl font-semibold text-primary">
          No plan on this device yet
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-secondary">
          Strategy plans live in your browser. Start onboarding to make one of
          your own, or open the demo plan to see what Pathwise feels like.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/onboarding">
            <Button>Start onboarding</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">Back to home</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
