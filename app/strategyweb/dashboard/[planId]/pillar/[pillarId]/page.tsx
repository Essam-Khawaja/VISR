/**
 * app/strategyweb/dashboard/[planId]/pillar/[pillarId]/page.tsx
 *
 * Kanban drilldown for a single strategic pillar. The user can move pillar
 * actions through Open / Doing / Done / Skipped / At Risk states; state
 * changes flow back into the plan store so the dashboard graph reflects
 * the new posture.
 */

"use client";

import Link from "next/link";
import { KanbanBoard } from "@/components/strategyweb/dashboard/KanbanBoard";
import { Button } from "@/components/strategyweb/ui/Button";
import {
  PlanProvider,
  usePlanOptional,
} from "@/components/strategyweb/dashboard/PlanProvider";

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

  if (!ctx) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base px-6">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-card">
          <h1 className="font-display text-2xl font-semibold text-primary">
            Plan not found
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-secondary">
            This plan doesn&apos;t exist yet.
          </p>
          <div className="mt-6">
            <Link href="/">
              <Button variant="secondary">Back to home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { plan, stored, markAction, addTasks } = ctx;
  const pillarIndex = plan.strategicPillars.findIndex(
    (p) => p.id === pillarId,
  );
  const pillar = pillarIndex >= 0 ? plan.strategicPillars[pillarIndex] : null;

  if (!pillar) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base px-6">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-card">
          <h1 className="font-display text-2xl font-semibold text-primary">
            Pillar not found
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-secondary">
            This pillar doesn&apos;t exist in the current plan.
          </p>
          <div className="mt-6">
            <Link href={`/strategyweb/dashboard/${planId}`}>
              <Button variant="secondary">Back to dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-base">
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
    </div>
  );
}
