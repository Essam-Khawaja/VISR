"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { CornerBrackets } from "@/components/signature/CornerBrackets";
import { cn } from "@/lib/cn";
import { cardEnter, ease } from "@/lib/motion";

type CardProps = Omit<
  HTMLMotionProps<"div">,
  "variants" | "initial" | "animate" | "custom" | "whileHover" | "children"
> & {
  children?: React.ReactNode;
  /** Stagger index for entrance animation. */
  index?: number;
  /** Use the elevated background (`--bg-elevated`) instead of surface. */
  elevated?: boolean;
  /** Disable corner brackets (e.g. when nested inside another framed surface). */
  noBrackets?: boolean;
  /** Disable hover lift. */
  noHover?: boolean;
  /** Accent color override for corner brackets. */
  bracketColor?: string;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    className,
    children,
    index = 0,
    elevated,
    noBrackets,
    noHover,
    bracketColor,
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
        "relative isolate p-5 sm:p-6",
        elevated ? "bg-elevated" : "bg-surface",
        "shadow-[0_1px_0_0_var(--border)_inset,0_-1px_0_0_var(--border)_inset]",
        className,
      )}
      {...rest}
    >
      {!noBrackets ? <CornerBrackets color={bracketColor} /> : null}
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  );
});
