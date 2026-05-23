"use client";

import { motion } from "framer-motion";
import { Stamp } from "@/components/ui/Stamp";
import { cutRecommendationColor } from "@/lib/statusColors";
import { ease, stagger } from "@/lib/motion";
import type { CutItem, CutRecommendation } from "@/lib/types";

type Props = {
  items: CutItem[];
};

const order: CutRecommendation[] = ["Cut", "Defer", "Keep", "Double Down"];

const stampLabel: Record<CutRecommendation, string> = {
  Cut: "Cut",
  Defer: "Defer",
  Keep: "Keep",
  "Double Down": "Double Down",
};

export function CutList({ items }: Props) {
  const groups = order.map((rec) => ({
    rec,
    items: items.filter((it) => it.recommendation === rec),
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-secondary">
          Decision Manifest
        </span>
        <span className="text-[10px] uppercase tracking-widest text-secondary tabular">
          {items.length} verdicts
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        {groups.map((group, gi) => {
          const color = cutRecommendationColor[group.rec];
          return (
            <div key={group.rec} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Stamp
                  label={stampLabel[group.rec]}
                  color={color}
                  rotation={gi % 2 === 0 ? -2 : 2}
                />
                <span
                  className="text-[10px] uppercase tracking-widest tabular"
                  style={{ color }}
                >
                  {group.items.length}
                </span>
              </div>
              <ul className="flex flex-col gap-3">
                {group.items.length === 0 ? (
                  <li className="text-[12px] text-secondary opacity-70">
                    None.
                  </li>
                ) : null}
                {group.items.map((it, i) => (
                  <motion.li
                    key={it.id}
                    initial={{ opacity: 0, y: 4 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.3,
                      ease,
                      delay: i * stagger.brief,
                    }}
                    className="relative pl-4"
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-1 block h-full w-px"
                      style={{ backgroundColor: color }}
                    />
                    <p
                      className={
                        "text-[14px] leading-snug" +
                        (group.rec === "Cut"
                          ? " text-secondary line-through decoration-secondary/40"
                          : " text-primary")
                      }
                    >
                      {it.activity}
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-secondary">
                      {it.reason}
                    </p>
                  </motion.li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
