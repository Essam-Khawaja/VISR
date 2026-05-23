"use client";

import { motion } from "framer-motion";
import { ease, stagger } from "@/lib/motion";
import { severityColor } from "@/lib/statusColors";
import type { RiskItem } from "@/lib/types";

type Props = {
  risks: RiskItem[];
};

export function RiskCards({ risks }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-secondary">
          Risk Watch
        </span>
        <span className="text-[10px] uppercase tracking-widest text-secondary tabular">
          {risks.length}
        </span>
      </div>
      <ul className="flex flex-col gap-3">
        {risks.map((r, i) => {
          const color = severityColor[r.severity];
          return (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                ease,
                delay: 0.3 + i * stagger.brief,
              }}
              className="relative pl-4"
            >
              <span
                aria-hidden
                className="absolute left-0 top-1 block h-full w-px"
                style={{ backgroundColor: color }}
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-medium text-primary">
                  {r.title}
                </span>
                <span
                  className="text-[10px] uppercase tracking-widest tabular"
                  style={{ color }}
                >
                  {r.severity}
                </span>
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-secondary">
                {r.explanation}
              </p>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
