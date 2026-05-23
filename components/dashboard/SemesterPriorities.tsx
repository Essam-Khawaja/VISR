"use client";

import { motion } from "framer-motion";
import { ease, stagger } from "@/lib/motion";

type Props = {
  priorities: string[];
};

export function SemesterPriorities({ priorities }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-secondary">
          Semester Priorities
        </span>
        <span className="text-[10px] uppercase tracking-widest text-secondary tabular">
          {priorities.length}
        </span>
      </div>
      <ul className="flex flex-col">
        {priorities.map((p, i) => (
          <motion.li
            key={p}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.3,
              ease,
              delay: 0.25 + i * stagger.brief,
            }}
            className="flex items-start gap-3 border-t border-border py-3 first:border-t-0"
          >
            <span className="mt-1.5 inline-block h-1 w-3 shrink-0 bg-accent" />
            <span className="text-[14px] leading-relaxed text-primary">
              {p}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
