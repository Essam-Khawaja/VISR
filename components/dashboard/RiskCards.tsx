"use client";

import { motion } from "framer-motion";
import type { RiskItem } from "@/lib/types";
import { Card } from "@/components/ui/Card";

type RiskCardsProps = {
  risks: RiskItem[];
};

function severityAccent(sev: RiskItem["severity"]) {
  switch (sev) {
    case "High":
      return "#FF4D6D";
    case "Medium":
      return "#FFB547";
    case "Low":
      return "#4FACFE";
    default:
      return "#6B7FA3";
  }
}

const delayBase = 0.045;

export function RiskCards({ risks }: RiskCardsProps) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--danger)] px-1">
        Risk warnings
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        {risks.map((risk, idx) => {
          const c = severityAccent(risk.severity);
          return (
            <motion.div key={risk.id}>
              <Card>
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-3">
                    <span
                      className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
                      style={{
                        color: c,
                        border: `1px solid ${c}55`,
                        backgroundColor: `${c}12`,
                      }}
                    >
                      {risk.severity}
                    </span>
                  </div>
                  <motion.h4
                    className="font-display text-[17px] leading-snug"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: idx * delayBase }}
                  >
                    {risk.title}
                  </motion.h4>
                  <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">{risk.explanation}</p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
