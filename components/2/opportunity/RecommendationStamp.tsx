"use client";

import { motion, useReducedMotion } from "framer-motion";
import { recommendationColor } from "@/lib/2/statusColors";
import type { Recommendation } from "@/lib/2/types";

type Props = {
  recommendation: Recommendation;
};

const labelMap: Record<Recommendation, string> = {
  "Say Yes": "Say Yes",
  "Say No": "Say No",
  Defer: "Defer",
  "Say Yes With Conditions": "Yes, with conditions",
};

export function RecommendationStamp({ recommendation }: Props) {
  const reduce = useReducedMotion();
  const color = recommendationColor[recommendation];
  return (
    <motion.div
      initial={reduce ? false : { scale: 1.08, opacity: 0, y: 4 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="inline-flex items-center gap-3"
    >
      <span
        aria-hidden
        className="inline-block h-2.5 w-2.5 rounded-full shadow-[0_0_0_4px_var(--tw-glow)]"
        style={{
          backgroundColor: color,
          ["--tw-glow" as never]: `${color}1f`,
        }}
      />
      <span
        className="font-display text-[34px] font-semibold leading-none tracking-tight sm:text-[44px]"
        style={{ color }}
      >
        {labelMap[recommendation]}
      </span>
    </motion.div>
  );
}
