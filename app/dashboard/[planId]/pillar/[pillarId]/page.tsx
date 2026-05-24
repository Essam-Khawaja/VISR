"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { Button } from "@/components/ui/Button";
import {
  PlanProvider,
  usePlanOptional,
} from "@/components/dashboard/PlanProvider";
import { TodayOverlay } from "@/components/dashboard/TodayOverlay";

export const dynamic = "force-dynamic";

type Params = { params: { planId: string; pillarId: string } };

export default function PillarPage({ params }: Params) {
  const { planId, pillarId } = params;
  return (
    <PlanProvider planId={planId}>
      <PillarShell planId={planId} pillarId={pillarId} />
    </PlanProvider>
  );
}

function PillarShell({
  planId,
  pillarId,
}: {
  planId: string;
  pillarId: string;
}) {
  const ctx = usePlanOptional();
  const [todayOpen, setTodayOpen] = useState(false);
  const toggleToday = useCallback(() => setTodayOpen((v) => !v), []);

  if (!ctx) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base px-6">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-card">
          <h1 className="font-display text-2xl font-semibold text-primary">
            Plan not found
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-secondary">
            This plan doesn&apos;t exist on this device.
          </p>
          <div className="mt-6">
            <Link href="/">
              <Button variant="secondary">Back to home</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { plan, stored, markAction, addTasks } = ctx;
  const pillarIndex = plan.strategicPillars.findIndex(
    (p) => p.id === pillarId,
  );
  const pillar = pillarIndex >= 0 ? plan.strategicPillars[pillarIndex] : null;

  if (!pillar) {
    return (
      <main className="flex h-screen overflow-hidden bg-base">
        <DashboardSidebar planId={planId} onTodayClick={toggleToday} />
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-card">
            <h1 className="font-display text-2xl font-semibold text-primary">
              Pillar not found
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-secondary">
              This pillar doesn&apos;t exist in the current plan.
            </p>
            <div className="mt-6">
              <Link href={`/dashboard/${planId}`}>
                <Button variant="secondary">Back to dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen overflow-hidden bg-base">
      <DashboardSidebar planId={planId} onTodayClick={toggleToday} />
      <div className="min-w-0 flex-1">
        <KanbanBoard
          pillar={pillar}
          pillarIndex={pillarIndex}
          planId={planId}
          actionStates={stored.actionStates}
          markAction={markAction}
          addTasks={addTasks}
        />
      </div>
      <TodayOverlay open={todayOpen} onClose={() => setTodayOpen(false)} />
    </main>
  );
}
