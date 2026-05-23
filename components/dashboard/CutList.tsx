"use client";

import { motion } from "framer-motion";
import type { CutItem } from "@/lib/types";
import { cutRecommendationColor } from "@/lib/statusColors";
import { Card } from "@/components/ui/Card";

type CutListProps = {
  items: CutItem[];
};

const delayBase = 0.04;

export function CutList({ items }: CutListProps) {
  return (
    <Card>
      <div className="p-5 space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
          Cut · defer · keep · double down
        </p>
        <div className="space-y-3">
          {items.map((item, idx) => {
            const c = cutRecommendationColor[item.recommendation];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: "easeOut", delay: idx * delayBase }}
                className="rounded-xl border border-[color:var(--border)] bg-black/35 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.2em]" style={{ color: c }}>
                    {item.recommendation}
                  </p>
                </div>
                <p className="mt-2 text-[15px] font-medium text-[color:var(--text-primary)]">{item.activity}</p>
                <p className="mt-1 text-sm leading-relaxed text-[color:var(--text-secondary)]">{item.reason}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
