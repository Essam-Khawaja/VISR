"use client";

import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";
import { Card } from "@/components/ui/Card";

type Props = {
  priorities: string[];
};

const delayBase = 0.04;

function StaggerItem({ index, children }: PropsWithChildren<{ index: number }>) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
        delay: index * delayBase,
      }}
      className="flex gap-3 text-sm leading-relaxed text-[color:var(--text-primary)]"
    >
      {children}
    </motion.li>
  );
}

export function SemesterPriorities({ priorities }: Props) {
  return (
    <Card>
      <div className="p-5 space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--accent)]">
          Semester priorities
        </p>
        <ol className="space-y-2">
          {priorities.map((p, idx) => (
            <StaggerItem key={`${idx}-${p}`} index={idx}>
              <span className="mt-0.5 inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-md border border-[color:var(--border)] bg-black/40 text-[11px] font-semibold text-[color:var(--text-secondary)] tabular-nums">
                {(idx + 1).toString().padStart(2, "0")}
              </span>
              <span>{p}</span>
            </StaggerItem>
          ))}
        </ol>
      </div>
    </Card>
  );
}
