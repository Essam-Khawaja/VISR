"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { ease, stagger } from "@/lib/motion";
import type { ActionItem, Priority } from "@/lib/types";

type Props = {
  actions: ActionItem[];
};

const priorityTone: Record<Priority, "danger" | "warning" | "muted"> = {
  High: "danger",
  Medium: "warning",
  Low: "muted",
};

export function NextSevenDays({ actions }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-secondary">
            Mission Brief
          </span>
          <h3 className="mt-1 font-display text-xl font-semibold leading-snug text-primary">
            Next 7 days
          </h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-secondary tabular">
          {actions.length} steps
        </span>
      </div>

      <ol className="flex flex-col">
        {actions.map((a, i) => (
          <motion.li
            key={a.id}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.3,
              ease,
              delay: i * stagger.brief,
            }}
            className="grid grid-cols-[40px_1fr_auto] items-start gap-4 border-t border-border py-4 first:border-t-0"
          >
            <span className="font-display text-base font-semibold text-accent tabular">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-medium leading-snug text-primary">
                {a.title}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-secondary">
                {a.category}
              </span>
            </div>
            <Badge tone={priorityTone[a.priority]}>{a.priority}</Badge>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
