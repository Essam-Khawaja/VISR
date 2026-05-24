"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { NumberDial } from "@/components/ui/NumberDial";
import type {
  CutRecommendation,
  Priority,
  RouteStatus,
  Severity,
  StrategyPlan,
} from "@/lib/types";

type Props = {
  plan: StrategyPlan;
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

export function StrategyPanels({ plan }: Props) {
  return (
    <aside className="relative z-20 flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-base/92 p-4 backdrop-blur md:w-[430px] md:p-5">
      <HeaderSummary plan={plan} />
      <SemesterPrioritiesPanel plan={plan} />
      <CutListPanel plan={plan} />
      <NextSevenDaysPanel plan={plan} />
      <RiskPanel plan={plan} />
    </aside>
  );
}

function HeaderSummary({ plan }: Props) {
  return (
    <Card noHover className="border-accent/30 bg-surface/95">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-widest text-tertiary">
            Destination
          </span>
          <h1 className="mt-2 font-display text-[28px] font-semibold leading-none text-primary">
            {plan.destination}
          </h1>
        </div>
        <div className="text-right">
          <NumberDial
            to={plan.alignmentScore}
            className="font-display text-[54px] font-semibold leading-none text-primary"
          />
          <p className="mt-1 text-[11px] uppercase tracking-widest text-tertiary">
            Alignment
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Badge tone={routeTone[plan.routeStatus]} dot>
          {plan.routeStatus}
        </Badge>
        <Badge tone="accent">{plan.currentStage}</Badge>
      </div>

      <div className="mt-5 rounded-2xl border border-danger/30 bg-danger-soft p-4">
        <p className="text-[11px] font-medium uppercase tracking-widest text-danger">
          Main bottleneck
        </p>
        <p className="mt-2 text-[15px] font-semibold leading-snug text-primary">
          {plan.mainBottleneck}
        </p>
      </div>
    </Card>
  );
}

function SemesterPrioritiesPanel({ plan }: Props) {
  return (
    <Card index={1} noHover>
      <PanelTitle label="Semester priorities" count={plan.semesterPriorities.length} />
      <ol className="mt-3 flex flex-col gap-2">
        {plan.semesterPriorities.map((priority, index) => (
          <li key={priority} className="flex gap-3 rounded-xl border border-border bg-elevated px-3 py-2">
            <span className="tabular text-[12px] font-semibold text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-[13px] leading-snug text-primary">{priority}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function CutListPanel({ plan }: Props) {
  return (
    <Card index={2} noHover>
      <PanelTitle label="Cut list" count={plan.cutList.length} />
      <div className="mt-3 flex flex-col gap-3">
        {cutOrder.map((recommendation) => {
          const items = plan.cutList.filter(
            (item) => item.recommendation === recommendation,
          );
          if (items.length === 0) return null;
          return (
            <section key={recommendation} className="flex flex-col gap-2">
              <Badge tone={cutTone[recommendation]}>{recommendation}</Badge>
              {items.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-elevated px-3 py-2">
                  <p className="text-[13px] font-semibold text-primary">{item.activity}</p>
                  <p className="mt-1 text-[12px] leading-snug text-secondary">{item.reason}</p>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </Card>
  );
}

function NextSevenDaysPanel({ plan }: Props) {
  return (
    <Card index={3} noHover>
      <PanelTitle label="Next 7 days" count={plan.nextSevenDays.length} />
      <ol className="mt-3 flex flex-col gap-2">
        {plan.nextSevenDays.map((action, index) => (
          <li key={action.id} className="rounded-xl border border-border bg-elevated px-3 py-2">
            <div className="flex items-start gap-3">
              <span className="tabular text-[12px] font-semibold text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold leading-snug text-primary">{action.title}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone={priorityTone[action.priority]}>{action.priority}</Badge>
                  <span className="text-[11px] text-tertiary">{action.category}</span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function RiskPanel({ plan }: Props) {
  return (
    <Card index={4} noHover>
      <PanelTitle label="Risks" count={plan.risks.length} />
      <div className="mt-3 flex flex-col gap-2">
        {plan.risks.map((risk) => (
          <div key={risk.id} className="rounded-xl border border-border bg-elevated px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-semibold text-primary">{risk.title}</p>
              <Badge tone={severityTone[risk.severity]}>{risk.severity}</Badge>
            </div>
            <p className="mt-1 text-[12px] leading-snug text-secondary">
              {risk.explanation}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PanelTitle({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-display text-[18px] font-semibold text-primary">{label}</h2>
      <span className="tabular text-[11px] text-tertiary">{count}</span>
    </div>
  );
}
