"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/shared/cn";
import { cardEnter, ease } from "@/lib/shared/motion";

type CardProps = Omit<
  HTMLMotionProps<"div">,
  "variants" | "initial" | "animate" | "custom" | "whileHover" | "children"
> & {
  children?: React.ReactNode;
  /** Stagger index for entrance animation. */
  index?: number;
  /** Use the elevated background (`--bg-elevated`) instead of surface. */
  elevated?: boolean;
  /** Disable hover lift. */
  noHover?: boolean;
  /** @deprecated kept for source compatibility with feat/01; ignored in light theme. */
  noBrackets?: boolean;
  /** @deprecated kept for source compatibility with feat/01; ignored in light theme. */
  bracketColor?: string;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    className,
    children,
    index = 0,
    elevated,
    noHover,
    noBrackets: _noBrackets,
    bracketColor: _bracketColor,
    ...rest
  },
  ref,
) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      variants={cardEnter}
      initial="hidden"
      animate="show"
      custom={index}
      whileHover={
        noHover || reduce
          ? undefined
          : { y: -2, transition: { duration: 0.15, ease } }
      }
      className={cn(
        "relative isolate rounded-3xl border border-border p-5 shadow-soft transition-shadow duration-200 sm:p-6",
        elevated ? "bg-elevated" : "bg-surface",
        noHover ? "" : "hover:shadow-card",
        className,
      )}
      {...rest}
    >
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  );
});
