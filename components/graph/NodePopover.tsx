"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { HoverState } from "./useGraphScene";

type Props = {
  hover: HoverState;
};

export function NodePopover({ hover }: Props) {
  return (
    <AnimatePresence>
      {hover ? (
        <motion.div
          key={hover.node.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="pointer-events-none fixed z-50 max-w-[300px] rounded-2xl border border-border bg-surface p-4 shadow-card"
          style={{
            left: Math.min(
              hover.x + 16,
              typeof window !== "undefined"
                ? window.innerWidth - 320
                : hover.x,
            ),
            top: Math.min(
              hover.y + 16,
              typeof window !== "undefined"
                ? window.innerHeight - 220
                : hover.y,
            ),
          }}
          role="tooltip"
        >
          <p className="text-[11px] font-medium text-tertiary">
            {hover.node.kind === "goal"
              ? "Destination"
              : hover.node.kind === "pillar"
                ? "Strategic pillar"
                : "Action"}
            {hover.node.isBottleneck ? " · Bottleneck" : ""}
          </p>
          <p className="mt-1 text-[15px] font-semibold leading-snug text-primary">
            {hover.node.name}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-secondary">
            {hover.node.recommendation}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
