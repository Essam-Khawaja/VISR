"use client";

import { motion } from "framer-motion";
import type { ActionItem } from "@/lib/types";
import { Card } from "@/components/ui/Card";

type NextSevenDaysProps = {
  actions: ActionItem[];
};

function priorityAccent(priority: ActionItem["priority"]) {
  switch (priority) {
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

const delayBase = 0.04;

export function NextSevenDays({ actions }: NextSevenDaysProps) {
  return (
    <Card>
      <div className="p-5 space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--accent)]">
          Next seven days
        </p>
        <ol className="space-y-3">
          {actions.map((a, idx) => (
            <motion.li
              key={a.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: idx * delayBase }}
              className="flex gap-3 rounded-xl border border-[color:var(--border)] bg-black/35 p-3"
            >
              <span className="mt-0.5 inline-flex min-w-[1.75rem] items-center justify-center rounded-md bg-[color:var(--bg-elevated)] text-[13px] font-semibold tabular-nums">
                {(idx + 1).toString()}
              </span>
              <div className="min-w-0 space-y-1">
                <p className="text-[15px] font-medium leading-snug text-[color:var(--text-primary)]">{a.title}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-[color:var(--border)] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                    {a.category}
                  </span>
                  <span
                    className="rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
                    style={{
                      border: `1px solid ${priorityAccent(a.priority)}55`,
                      color: priorityAccent(a.priority),
                      background: `${priorityAccent(a.priority)}10`,
                    }}
                  >
                    {a.priority}
                  </span>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </Card>
  );
}
