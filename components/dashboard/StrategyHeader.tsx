"use client";

import type { RouteStatus } from "@/lib/types";
import { routeStatusColor } from "@/lib/statusColors";
import { AlignmentScore } from "@/components/dashboard/AlignmentScore";

type StrategyHeaderProps = {
  destination: string;
  currentStage: string;
  mainBottleneck: string;
  routeStatus: RouteStatus;
  alignmentScore: number;
};

export function StrategyHeader({
  destination,
  currentStage,
  mainBottleneck,
  routeStatus,
  alignmentScore,
}: StrategyHeaderProps) {
  const statusColor =
    routeStatusColor[routeStatus] ?? routeStatusColor["Needs Focus"];

  return (
    <header className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--bg-surface)]/70 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
            Destination
          </p>
          <h1 className="max-w-xl font-display text-4xl leading-tight sm:text-[40px]">
            {destination}
          </h1>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
                Current stage
              </p>
              <p className="mt-1 text-base text-[color:var(--text-primary)]">{currentStage}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
                Main bottleneck
              </p>
              <p className="mt-1 text-base leading-snug text-[color:var(--danger)]">{mainBottleneck}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
              Route status
            </span>
            <span
              className="rounded-full px-4 py-1 text-[13px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: statusColor ?? "#FFB547", boxShadow: `0 0 0 1px ${statusColor ?? "#FFB547"}40` }}
            >
              {routeStatus}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4 lg:w-[clamp(244px,32vw,360px)]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
            Alignment score
          </span>
          <AlignmentScore score={alignmentScore} />
          <div className="h-px w-full bg-[color:var(--border)]" aria-hidden />
          <p className="text-xs leading-relaxed text-[color:var(--text-secondary)]">
            A single glance indicator for how cleanly your commitments line up toward the internship.
          </p>
        </div>
      </div>
    </header>
  );
}
