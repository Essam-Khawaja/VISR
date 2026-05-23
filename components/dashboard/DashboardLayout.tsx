"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
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
          <Card index={3} className="min-h-[180px]">
            <div className="text-[10px] uppercase tracking-widest text-secondary">
              Alignment Score
            </div>
            <div className="mt-3 font-display text-[80px] leading-none text-primary tabular">
              {plan.alignmentScore}
              <span className="text-secondary">%</span>
            </div>
          </Card>
          <Card index={4} className="min-h-[200px]">
            <div className="text-[10px] uppercase tracking-widest text-secondary">
              Main Bottleneck
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-primary">
              {plan.mainBottleneck}
            </p>
          </Card>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:gap-6">
        <Card index={5} className="min-h-[200px]">
          <div className="text-[10px] uppercase tracking-widest text-secondary">
            Decision Manifest
          </div>
          <p className="mt-3 text-[13px] text-secondary">
            CutList component lands in the dashboard-cards commit set.
          </p>
        </Card>
        <Card index={6} className="min-h-[200px]">
          <div className="text-[10px] uppercase tracking-widest text-secondary">
            Mission Brief — Next 7 Days
          </div>
          <p className="mt-3 text-[13px] text-secondary">
            NextSevenDays component lands in the dashboard-cards commit set.
          </p>
        </Card>
      </section>
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
