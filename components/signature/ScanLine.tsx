"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

type Props = {
  /** Loop animation continuously instead of running once on mount. */
  loop?: boolean;
  className?: string;
  /** Total cycle duration in seconds. */
  duration?: number;
  color?: string;
};

export function ScanLine({
  loop = true,
  className,
  duration = 2.5,
  color = "var(--accent)",
}: Props) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden
      initial={{ y: "-100%", opacity: 0 }}
      animate={{ y: "100vh", opacity: [0, 0.7, 0] }}
      transition={{
        duration,
        ease: "linear",
        repeat: loop ? Infinity : 0,
      }}
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-10 h-px",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
        boxShadow: `0 0 24px 0 ${color}`,
      }}
    />
  );
}
