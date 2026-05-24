"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NumberDial } from "@/components/ui/NumberDial";
import { EmbeddedOpportunityChecker } from "./EmbeddedOpportunityChecker";
import { GoalTreeSlot } from "./GoalTreeSlot";
import { usePlan } from "./PlanProvider";
import type { ActionState } from "@/lib/planStore";
import type {
  CutRecommendation,
  Priority,
  RouteStatus,
  Severity,
  StrategyPlan,
} from "@/lib/types";

type Props = {
  onToggleToday: () => void;
};

const routeTone: Record<RouteStatus, "success" | "warning" | "danger"> = {
  "On Track": "success",
  "At Risk": "danger",
  Scattered: "warning",
  "Needs Focus": "warning",
};

const cutTone: Record<CutRecommendation, "danger" | "warning" | "muted" | "success"> = {
  Cut: "danger",
  Defer: "warning",
  Keep: "muted",
  "Double Down": "success",
};

const priorityTone: Record<Priority, "danger" | "warning" | "muted"> = {
  High: "danger",
  Medium: "warning",
  Low: "muted",
};

const severityTone: Record<Severity, "danger" | "warning" | "muted"> = {
  High: "danger",
  Medium: "warning",
  Low: "muted",
};

const cutOrder: CutRecommendation[] = ["Cut", "Defer", "Keep", "Double Down"];

export function DashboardWorkspace({ onToggleToday }: Props) {
  const ctx = usePlan();
  const { plan, planId, stored, markAction, isDemo } = ctx;
  const [exploreOpen, setExploreOpen] = useState(false);

  const openExplore = useCallback(() => setExploreOpen(true), []);
  const closeExplore = useCallback(() => setExploreOpen(false), []);

  useEffect(() => {
    if (!exploreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [exploreOpen]);

  if (exploreOpen) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-4 py-2">
          <button
            type="button"
            onClick={closeExplore}
            className="flex h-7 items-center gap-1.5 rounded-lg border border-border bg-elevated px-2.5 text-[12px] font-medium text-secondary transition-colors hover:text-primary"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M9 3L5 7l4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Dashboard
          </button>
          <span className="text-[13px] font-semibold text-primary">
            Explore Map
          </span>
        </div>
        <div className="min-h-0 flex-1">
          <GoalTreeSlot
            onToggleToday={onToggleToday}
            displayMode="full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        {/* Overview map card */}
        <button
          type="button"
          onClick={openExplore}
          className="group relative w-full overflow-hidden rounded-2xl border border-border bg-base shadow-card transition-shadow hover:shadow-lift"
        >
          <div className="h-[520px]">
            <GoalTreeSlot
              onToggleToday={onToggleToday}
              displayMode="preview"
            />
          </div>
          <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-base/80 via-transparent to-transparent pb-5 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="flex items-center gap-2 rounded-full border border-border bg-surface/95 px-4 py-2 text-[13px] font-medium text-primary shadow-soft backdrop-blur-sm">
              Click to explore map
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M5 3l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </button>

        <InsightsContent
          plan={plan}
          isDemo={isDemo}
          actionStates={stored.actionStates}
          markAction={markAction}
          onToggleToday={onToggleToday}
        />
      </div>
    </div>
  );
}

function InsightsContent({
  plan,
  isDemo,
  actionStates,
  markAction,
  onToggleToday,
}: {
  plan: StrategyPlan;
  isDemo: boolean;
  actionStates: Record<string, ActionState>;
  markAction: (actionId: string, state: ActionState) => void;
  onToggleToday: () => void;
}) {
  const stats = getRouteStats(plan, actionStates);

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <TopBand
        plan={plan}
        isDemo={isDemo}
        stats={stats}
        onToggleToday={onToggleToday}
      />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <NextSevenDaysPanel
            plan={plan}
            actionStates={actionStates}
            markAction={markAction}
          />
        </div>
        <div className="xl:col-span-5">
          <EmbeddedOpportunityChecker />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <CutListPanel plan={plan} />
        </div>
        <div className="xl:col-span-5">
          <SemesterPrioritiesPanel plan={plan} />
        </div>
      </section>

      <section>
        <RiskPanel plan={plan} />
      </section>
    </div>
  );
}

function TopBand({
  plan,
  isDemo,
  stats,
  onToggleToday,
}: {
  plan: StrategyPlan;
  isDemo: boolean;
  stats: RouteStats;
  onToggleToday: () => void;
}) {
  return (
    <Card noHover className="overflow-hidden p-0">
      <div className="grid gap-0 lg:grid-cols-[1fr_260px]">
        <div className="p-5 sm:p-6 lg:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={routeTone[plan.routeStatus]} dot>
              {plan.routeStatus}
            </Badge>
            <Badge tone="accent">{plan.currentStage}</Badge>
            {isDemo ? <Badge tone="muted">Demo plan</Badge> : null}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-tertiary">
                Destination
              </p>
              <h1 className="mt-2 font-display text-[34px] font-semibold leading-[0.98] text-primary sm:text-[44px]">
                {plan.destination}
              </h1>
            </div>
            <div className="rounded-[14px] border border-danger/25 bg-danger-soft p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-danger">
                Main bottleneck
              </p>
              <p className="mt-2 text-[16px] font-semibold leading-snug text-primary">
                {plan.mainBottleneck}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-elevated/70 p-5 lg:border-l lg:border-t-0 lg:p-6">
          <div className="flex items-baseline gap-1">
            <NumberDial
              to={plan.alignmentScore}
              className="font-display text-[64px] font-semibold leading-none text-primary"
            />
            <span className="font-display text-[18px] text-tertiary">/100</span>
          </div>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-tertiary">
            Alignment score
          </p>
          <RouteProgress stats={stats} />
          <Button
            size="sm"
            variant="secondary"
            className="mt-4 w-full"
            onClick={onToggleToday}
          >
            Open today focus
          </Button>
        </div>
      </div>
    </Card>
  );
}

function RouteProgress({ stats }: { stats: RouteStats }) {
  const width = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between text-[12px]">
        <span className="font-medium text-primary">7-day progress</span>
        <span className="tabular text-tertiary">{stats.done}/{stats.total}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-success transition-all duration-300"
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-tertiary">
        <span>{stats.open} open</span>
        <span>{stats.deferred} deferred</span>
      </div>
    </div>
  );
}

function NextSevenDaysPanel({
  plan,
  actionStates,
  markAction,
}: {
  plan: StrategyPlan;
  actionStates: Record<string, ActionState>;
  markAction: (actionId: string, state: ActionState) => void;
}) {
  return (
    <Card noHover>
      <PanelTitle
        eyebrow="Action route"
        title="Next 7 days"
        detail={`${plan.nextSevenDays.length} moves`}
      />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {plan.nextSevenDays.map((action, index) => {
          const actionId = resolveActionId(plan, action.title, action.id);
          const state = actionStates[actionId] ?? "open";
          const done = state === "done";
          const deferred = state === "skipped";
          return (
            <article
              key={action.id}
              className="rounded-[14px] border border-border bg-surface p-4 shadow-soft"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-[12px] font-semibold text-accent">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={
                      "text-[15px] font-semibold leading-snug " +
                      (done
                        ? "text-tertiary line-through"
                        : deferred
                          ? "text-secondary"
                          : "text-primary")
                    }
                  >
                    {action.title}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone={priorityTone[action.priority]}>{action.priority}</Badge>
                    <span className="text-[11px] text-tertiary">{action.category}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <StateButton active={state === "open"} onClick={() => markAction(actionId, "open")}>
                  Open
                </StateButton>
                <StateButton active={done} onClick={() => markAction(actionId, "done")}>
                  Done
                </StateButton>
                <StateButton active={deferred} onClick={() => markAction(actionId, "skipped")}>
                  Defer
                </StateButton>
              </div>
            </article>
          );
        })}
      </div>
    </Card>
  );
}

function CutListPanel({ plan }: { plan: StrategyPlan }) {
  return (
    <Card noHover>
      <PanelTitle eyebrow="Decision filter" title="Cut list" detail={`${plan.cutList.length} calls`} />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {cutOrder.map((recommendation) => {
          const items = plan.cutList.filter((item) => item.recommendation === recommendation);
          if (items.length === 0) return null;
          return (
            <section key={recommendation} className="rounded-[14px] border border-border bg-surface p-4">
              <Badge tone={cutTone[recommendation]}>{recommendation}</Badge>
              <div className="mt-3 flex flex-col gap-3">
                {items.map((item) => (
                  <div key={item.id}>
                    <p className="text-[14px] font-semibold text-primary">{item.activity}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-secondary">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Card>
  );
}

function SemesterPrioritiesPanel({ plan }: { plan: StrategyPlan }) {
  return (
    <Card noHover>
      <PanelTitle
        eyebrow="Semester filter"
        title="Priorities"
        detail={`${plan.semesterPriorities.length} active`}
      />
      <ol className="mt-4 flex flex-col gap-3">
        {plan.semesterPriorities.map((priority, index) => (
          <li key={priority} className="flex gap-3 rounded-[14px] border border-border bg-surface p-3">
            <span className="tabular text-[12px] font-semibold text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-[14px] leading-snug text-primary">{priority}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function RiskPanel({ plan }: { plan: StrategyPlan }) {
  return (
    <Card noHover>
      <PanelTitle eyebrow="Watchlist" title="Risks" detail={`${plan.risks.length} signals`} />
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {plan.risks.map((risk) => (
          <article key={risk.id} className="rounded-[14px] border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[14px] font-semibold text-primary">{risk.title}</h3>
              <Badge tone={severityTone[risk.severity]}>{risk.severity}</Badge>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-secondary">
              {risk.explanation}
            </p>
          </article>
        ))}
      </div>
    </Card>
  );
}

function PanelTitle({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-tertiary">
          {eyebrow}
        </p>
        <h2 className="mt-1 font-display text-[24px] font-semibold text-primary">
          {title}
        </h2>
      </div>
      <span className="shrink-0 text-[12px] text-tertiary">{detail}</span>
    </div>
  );
}

function StateButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors " +
        (active
          ? "border-accent bg-accent text-white"
          : "border-border bg-surface text-secondary hover:border-border-strong hover:text-primary")
      }
    >
      {children}
    </button>
  );
}

type RouteStats = {
  total: number;
  done: number;
  deferred: number;
  open: number;
};

function getRouteStats(
  plan: StrategyPlan,
  actionStates: Record<string, ActionState>,
): RouteStats {
  return plan.nextSevenDays.reduce<RouteStats>(
    (stats, action) => {
      const actionId = resolveActionId(plan, action.title, action.id);
      const state = actionStates[actionId] ?? "open";
      if (state === "done") stats.done += 1;
      else if (state === "skipped") stats.deferred += 1;
      else stats.open += 1;
      return stats;
    },
    { total: plan.nextSevenDays.length, done: 0, deferred: 0, open: 0 },
  );
}

function resolveActionId(
  plan: StrategyPlan,
  title: string,
  fallbackId: string,
): string {
  const normalized = title.trim().toLowerCase();
  const match = plan.strategicPillars
    .flatMap((pillar) => pillar.actions)
    .find((action) => action.name.trim().toLowerCase() === normalized);
  return match?.id ?? fallbackId;
}
