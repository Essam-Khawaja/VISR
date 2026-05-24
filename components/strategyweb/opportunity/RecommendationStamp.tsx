"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Stamp } from "@/components/strategyweb/ui/Stamp";
import { recommendationColor } from "@/lib/strategyweb/statusColors";
import type { Recommendation } from "@/lib/strategyweb/types";

type Props = {
  recommendation: Recommendation;
};

const labelMap: Record<Recommendation, string> = {
  "Say Yes": "Say Yes",
  "Say No": "Say No",
  Defer: "Defer",
  "Say Yes With Conditions": "Yes · With Conditions",
};

export function RecommendationStamp({ recommendation }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { scale: 1.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 360, damping: 22 }}
      className="inline-flex"
    >
      <Stamp
        label={labelMap[recommendation]}
        color={recommendationColor[recommendation]}
      />
    </motion.div>
  );
}
