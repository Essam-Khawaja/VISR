import Link from "next/link";
import { notFound } from "next/navigation";
import { getDemoPlan } from "@/lib/plans";
import { StrategyHeader } from "@/components/dashboard/StrategyHeader";
import { BottleneckCard } from "@/components/dashboard/BottleneckCard";
import { SemesterPriorities } from "@/components/dashboard/SemesterPriorities";
import { CutList } from "@/components/dashboard/CutList";
import { NextSevenDays } from "@/components/dashboard/NextSevenDays";
import { RiskCards } from "@/components/dashboard/RiskCards";
import { GoalTree } from "@/components/graph/GoalTree";

type PageProps = { params: { planId: string } };

export default function DashboardPage({ params }: PageProps) {
  const plan = getDemoPlan(params.planId);
  if (!plan) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-[1680px] px-6 py-12">
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
            Dashboard
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-[34px]">Strategy cockpit</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--text-secondary)]">
            The graph dominates the page — everything else is supporting signal. Judges route uses cached demo
            scenario (Supabase-ready), no Claude during load.
          </p>
        </div>
        <Link
          href={`/opportunity/${params.planId}`}
          className="inline-flex h-11 items-center justify-center self-start rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-surface)] px-5 text-[13px] font-semibold text-[color:var(--accent)] backdrop-blur transition hover:border-[color:var(--accent)] hover:bg-[color:var(--bg-elevated)]"
        >
          Opportunity check
        </Link>
      </div>

      <StrategyHeader
        destination={plan.destination}
        currentStage={plan.currentStage}
        mainBottleneck={plan.mainBottleneck}
        routeStatus={plan.routeStatus}
        alignmentScore={plan.alignmentScore}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.06fr)_minmax(320px,0.74fr)] lg:items-start">
        <div className="min-w-0">
          <GoalTree plan={plan} />
          <p className="mt-3 text-[12px] text-[color:var(--text-secondary)]">
            Click a pillar to drill Goal → Pillar → Action (MVP depth). Hover nodes for concise recommendations —
            HUD popovers mimic the radial “radar chart” athlete readouts from sports stat UX.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <BottleneckCard bottleneck={plan.mainBottleneck} />
            </div>
          </div>
          <SemesterPriorities priorities={plan.semesterPriorities} />
          <CutList items={plan.cutList} />
          <NextSevenDays actions={plan.nextSevenDays} />
          <RiskCards risks={plan.risks} />
        </div>
      </div>
    </main>
  );
}
