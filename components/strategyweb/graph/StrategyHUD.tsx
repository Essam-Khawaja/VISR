"use client";

import Link from "next/link";
import { Badge } from "@/components/strategyweb/ui/Badge";
import { NumberDial } from "@/components/strategyweb/ui/NumberDial";
import type { RouteStatus, StrategyPlan } from "@/lib/strategyweb/types";

type Props = {
  plan: StrategyPlan;
  planId: string;
  hasBottleneck: boolean;
  onFocusBottleneck: () => void;
  isDemo: boolean;
};

const routeTone: Record<RouteStatus, "success" | "warning" | "danger"> = {
  "On Track": "success",
  "Needs Focus": "warning",
  Scattered: "warning",
  "At Risk": "danger",
};

export function StrategyHUD({
  plan,
  planId,
  hasBottleneck,
  onFocusBottleneck,
  isDemo,
}: Props) {
  return (
    <>
      <div className="pointer-events-none absolute left-4 top-4 z-20 md:left-6 md:top-6">
        <div className="pointer-events-auto inline-flex flex-col gap-2 rounded-2xl border border-border bg-surface/90 px-4 py-3 shadow-soft backdrop-blur-sm">
          <span className="text-[11px] font-medium text-tertiary">
            Route status
          </span>
          <div className="flex items-center gap-2">
            <Badge tone={routeTone[plan.routeStatus]} dot>
              {plan.routeStatus}
            </Badge>
            <span className="text-[13px] font-medium text-primary">
              {plan.currentStage}
            </span>
          </div>
          {isDemo ? (
            <Link
              href="/strategyweb/onboarding"
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:text-accent-strong"
            >
              Make it mine
              <span aria-hidden>→</span>
            </Link>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-auto absolute right-4 top-4 z-20 w-[300px] md:right-6 md:top-6">
        <div className="rounded-2xl border border-danger/30 bg-danger-soft/60 p-4 shadow-soft backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Badge tone="danger" dot>
              Bottleneck
            </Badge>
          </div>
          <p className="mt-2 text-[14px] font-semibold leading-snug text-danger">
            {plan.mainBottleneck}
          </p>
          {hasBottleneck ? (
            <button
              type="button"
              onClick={onFocusBottleneck}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-danger px-3 py-1.5 text-[11px] font-medium text-white shadow-soft transition-colors hover:bg-danger/90"
            >
              Focus the graph
              <span aria-hidden>→</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-20 md:bottom-6 md:left-6">
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-border bg-surface/90 px-4 py-3 shadow-soft backdrop-blur-sm">
          <div className="flex items-baseline gap-1">
            <NumberDial
              to={plan.alignmentScore}
              duration={1.2}
              className="font-display text-[26px] font-semibold leading-none text-primary"
            />
            <span className="font-display text-[13px] text-tertiary">/100</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-tertiary">
              Alignment
            </span>
            <span className="text-[11px] text-secondary">how on-route you are</span>
          </div>
        </div>
      </div>

      <div className="pointer-events-auto absolute right-4 top-[136px] z-20 md:right-6 md:top-[148px]">
        <Link
          href={`/strategyweb/opportunity/${planId}`}
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-[12px] font-medium text-secondary shadow-soft transition-colors hover:border-accent hover:text-accent"
        >
          Check an opportunity
          <span
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>
    </>
  );
}
