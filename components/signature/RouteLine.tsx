"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Fragment } from "react";
import { cn } from "@/lib/cn";
import { dur, ease } from "@/lib/motion";

export type RouteLineWaypoint = {
  label: string;
  value: string;
  tone?: "default" | "danger" | "warning" | "success" | "accent";
};

type Props = {
  waypoints: RouteLineWaypoint[];
  className?: string;
  delay?: number;
};

const toneColor: Record<NonNullable<RouteLineWaypoint["tone"]>, string> = {
  default: "var(--text-secondary)",
  accent: "var(--accent)",
  danger: "var(--danger)",
  warning: "var(--warning)",
  success: "var(--success)",
};

export function RouteLine({ waypoints, className, delay = 0 }: Props) {
  const reduce = useReducedMotion();
  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 sm:gap-5 md:gap-7",
        className,
      )}
    >
      {waypoints.map((wp, i) => {
        const isLast = i === waypoints.length - 1;
        const dotColor = toneColor[wp.tone ?? "default"];
        return (
          <Fragment key={`${wp.label}-${i}`}>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-center gap-2">
                <motion.span
                  initial={reduce ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.25,
                    ease,
                    delay: delay + i * 0.08,
                  }}
                  className="inline-block rounded-full"
                  style={{
                    width: "var(--route-dot)",
                    height: "var(--route-dot)",
                    backgroundColor: dotColor,
                    boxShadow:
                      wp.tone && wp.tone !== "default"
                        ? `0 0 0 3px ${dotColor}22, 0 0 14px -2px ${dotColor}`
                        : undefined,
                  }}
                />
                <span className="text-[10px] uppercase tracking-widest text-secondary">
                  {wp.label}
                </span>
              </div>
              <span
                className="truncate text-sm font-medium text-primary md:text-[15px]"
                style={
                  wp.tone && wp.tone !== "default"
                    ? { color: dotColor }
                    : undefined
                }
                title={wp.value}
              >
                {wp.value}
              </span>
            </div>
            {!isLast ? (
              <motion.span
                aria-hidden
                initial={reduce ? false : { scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{
                  duration: dur.route,
                  ease,
                  delay: delay + i * 0.08 + 0.05,
                }}
                className="block h-px flex-1 origin-left bg-border"
              />
            ) : null}
          </Fragment>
        );
      })}
    </div>
  );
}
