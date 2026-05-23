"use client";

import { motion } from "framer-motion";
import { RouteLine } from "@/components/signature/RouteLine";
import { ease } from "@/lib/motion";
import type { StrategyPlan } from "@/lib/types";
import { routeStatusColor } from "@/lib/statusColors";

type Props = {
  plan: StrategyPlan;
};

const statusTone: Record<
  StrategyPlan["routeStatus"],
  "success" | "warning" | "danger"
> = {
  "On Track": "success",
  "At Risk": "danger",
  Scattered: "warning",
  "Needs Focus": "warning",
};

export function StrategyHeader({ plan }: Props) {
  const tone = statusTone[plan.routeStatus];
  return (
    <section
      aria-label="Strategy Header"
      className="flex w-full flex-col gap-5"
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease, delay: 0.1 }}
        className="flex flex-wrap items-center justify-between gap-3 text-[10px] uppercase tracking-widest text-secondary"
      >
        <span>Pathwise &middot; Strategy Map</span>
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 animate-breathe rounded-full"
            style={{
              backgroundColor: routeStatusColor[plan.routeStatus],
              boxShadow: `0 0 10px ${routeStatusColor[plan.routeStatus]}`,
            }}
          />
          Route &middot;{" "}
          <span
            className="font-medium tracking-widest"
            style={{ color: routeStatusColor[plan.routeStatus] }}
          >
            {plan.routeStatus}
          </span>
        </span>
      </motion.div>

      <RouteLine
        delay={0.15}
        waypoints={[
          { label: "Destination", value: plan.destination, tone: "accent" },
          { label: "Stage", value: plan.currentStage },
          {
            label: "Bottleneck",
            value: plan.mainBottleneck,
            tone: "danger",
          },
          {
            label: "Status",
            value: plan.routeStatus,
            tone,
          },
        ]}
      />
    </section>
  );
}
