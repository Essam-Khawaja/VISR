"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { AlignmentScore } from "./AlignmentScore";
import { BottleneckCard } from "./BottleneckCard";
import { CutList } from "./CutList";
import { RiskCards } from "./RiskCards";
import { SemesterPriorities } from "./SemesterPriorities";
import { StrategyHeader } from "./StrategyHeader";
import type { StrategyPlan } from "@/lib/types";

type Props = {
  plan: StrategyPlan;
  planId: string;
};

/**
 * Bento layout shell. Card content is filled in by Phase 5 commits.
 */
export function DashboardLayout({ plan, planId }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:gap-10 lg:px-12 lg:py-10">
      <TopBar planId={planId} />

      <StrategyHeader plan={plan} />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr] lg:gap-6">
        <Card index={2} className="min-h-[420px] lg:min-h-[560px]">
          <div className="flex h-full min-h-[380px] items-center justify-center text-secondary">
            <span className="text-[11px] uppercase tracking-widest">
              Goal Tree slot — wired in Phase 5
            </span>
          </div>
        </Card>

        <div className="flex flex-col gap-4 lg:gap-6">
          <Card index={3} className="min-h-[220px]">
            <AlignmentScore score={plan.alignmentScore} />
          </Card>
          <Card
            index={4}
            className="min-h-[220px] overflow-hidden"
            bracketColor="var(--danger)"
          >
            <BottleneckCard
              bottleneck={plan.mainBottleneck}
              stage={plan.currentStage}
            />
          </Card>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <Card index={5}>
          <SemesterPriorities priorities={plan.semesterPriorities} />
        </Card>
        <Card index={6}>
          <RiskCards risks={plan.risks} />
        </Card>
      </section>

      <Card index={7}>
        <CutList items={plan.cutList} />
      </Card>

      <Card index={8} className="min-h-[200px]">
        <div className="text-[10px] uppercase tracking-widest text-secondary">
          Mission Brief — Next 7 Days
        </div>
        <p className="mt-3 text-[13px] text-secondary">
          NextSevenDays component lands in the next commit.
        </p>
      </Card>
    </div>
  );
}

function TopBar({ planId }: { planId: string }) {
  return (
    <header className="flex items-center justify-between">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-secondary transition-colors hover:text-primary"
      >
        <span aria-hidden>&larr;</span>
        Pathwise
      </Link>
      <LinkButton
        href={`/opportunity/${planId}`}
        variant="secondary"
        size="md"
      >
        Check an opportunity
      </LinkButton>
    </header>
  );
}
