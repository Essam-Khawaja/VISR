"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GoalTreeSlot } from "./GoalTreeSlot";
import type { StrategyPlan } from "@/lib/types";

type Props = {
  plan: StrategyPlan;
  onToggleToday: () => void;
};

export function DashboardGraphCard({ plan, onToggleToday }: Props) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <Card noHover className="overflow-hidden p-0">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="accent">Strategy Map</Badge>
              <span className="text-[11px] text-tertiary">
                {plan.strategicPillars.length} pillars
              </span>
            </div>
            <h2 className="mt-2 font-display text-[22px] font-semibold text-primary">
              How your route is connected
            </h2>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
            Expand map
          </Button>
        </div>

        <div className="relative h-[330px] border-b border-border bg-elevated/70">
          <GoalTreeSlot onToggleToday={onToggleToday} displayMode="preview" />
        </div>

        <div className="grid grid-cols-3 divide-x divide-border">
          <MapStat label="Bottleneck" value={plan.mainBottleneck} tone="danger" />
          <MapStat label="Stage" value={plan.currentStage} tone="accent" />
          <MapStat label="Status" value={plan.routeStatus} tone="warning" />
        </div>
      </Card>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 bg-base/80 p-3 backdrop-blur-sm sm:p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Expanded strategy map"
          >
            <motion.div
              className="relative h-full overflow-hidden rounded-[20px] border border-border bg-surface shadow-lift"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="absolute right-4 top-4 z-40 flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={onToggleToday}>
                  Today
                </Button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-tertiary shadow-soft transition-colors hover:border-border-strong hover:text-primary"
                  aria-label="Close strategy map"
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                    <path
                      d="M3 3l9 9M12 3l-9 9"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <GoalTreeSlot onToggleToday={onToggleToday} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function MapStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "accent" | "danger" | "warning";
}) {
  const toneClass = {
    accent: "text-accent",
    danger: "text-danger",
    warning: "text-warning",
  }[tone];

  return (
    <div className="min-w-0 px-4 py-3">
      <p className={`text-[10px] font-semibold uppercase tracking-widest ${toneClass}`}>
        {label}
      </p>
      <p className="mt-1 truncate text-[12px] font-medium text-primary">{value}</p>
    </div>
  );
}
