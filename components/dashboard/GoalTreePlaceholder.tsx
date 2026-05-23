"use client";

import { motion } from "framer-motion";
import { ease } from "@/lib/motion";
import { pillarStatusColor } from "@/lib/statusColors";
import type { StrategicPillar } from "@/lib/types";

type Props = {
  pillars: StrategicPillar[];
  destination: string;
  mainBottleneck: string;
  variant?: "preview" | "loading";
};

const PILLAR_RADIUS = 38;
const ACTION_RADIUS = 46;
const GOAL_RADIUS = 6;

/**
 * Renders the same radial coordinates the real Three.js Goal Tree will
 * use, but as a flat SVG constellation. Used as the slot fallback when
 * feat/graph has not merged or while the canvas mounts.
 */
export function GoalTreePlaceholder({
  pillars,
  destination,
  mainBottleneck,
  variant = "preview",
}: Props) {
  const total = pillars.length || 1;
  return (
    <div className="relative h-full w-full">
      <svg
        viewBox="-100 -100 200 200"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <radialGradient id="goal-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="0" cy="0" r="22" fill="url(#goal-glow)" />

        {pillars.map((pillar, i) => {
          const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
          const px = Math.cos(angle) * PILLAR_RADIUS;
          const py = Math.sin(angle) * PILLAR_RADIUS;
          const color = pillarStatusColor[pillar.status];

          return (
            <g key={pillar.id}>
              <motion.line
                x1="0"
                y1="0"
                x2={px}
                y2={py}
                stroke="var(--border)"
                strokeWidth="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ duration: 0.6, ease, delay: 0.1 + i * 0.06 }}
              />

              {pillar.actions.map((action, ai) => {
                const spread = (Math.PI / 8) * (ai - (pillar.actions.length - 1) / 2);
                const aAngle = angle + spread;
                const ax = Math.cos(aAngle) * ACTION_RADIUS;
                const ay = Math.sin(aAngle) * ACTION_RADIUS;
                return (
                  <g key={action.id}>
                    <motion.line
                      x1={px}
                      y1={py}
                      x2={ax}
                      y2={ay}
                      stroke="var(--border)"
                      strokeWidth="0.4"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.5 }}
                      transition={{
                        duration: 0.5,
                        ease,
                        delay: 0.25 + i * 0.06 + ai * 0.04,
                      }}
                    />
                    <motion.circle
                      cx={ax}
                      cy={ay}
                      r="1.4"
                      fill="var(--text-secondary)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.85 }}
                      transition={{
                        duration: 0.4,
                        ease,
                        delay: 0.4 + i * 0.06 + ai * 0.04,
                      }}
                    />
                  </g>
                );
              })}

              <motion.circle
                cx={px}
                cy={py}
                r="3"
                fill={color}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease, delay: 0.3 + i * 0.06 }}
                style={{
                  filter: `drop-shadow(0 0 6px ${color})`,
                }}
              />
            </g>
          );
        })}

        <motion.circle
          cx="0"
          cy="0"
          r={GOAL_RADIUS}
          fill="var(--accent)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease }}
          style={{ filter: "drop-shadow(0 0 12px var(--accent))" }}
        />
      </svg>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-[10px] uppercase tracking-widest text-secondary">
          Destination
        </div>
        <div className="mt-1 max-w-[180px] text-balance font-display text-[13px] font-semibold leading-tight text-primary">
          {destination}
        </div>
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-secondary">
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-danger"
            style={{ boxShadow: "0 0 8px var(--danger)" }}
          />
          Bottleneck
        </span>
        <span className="max-w-[60%] truncate text-right text-secondary">
          {mainBottleneck}
        </span>
      </div>

      <div className="pointer-events-none absolute right-3 top-3 text-[10px] uppercase tracking-widest text-secondary">
        {variant === "loading" ? "Mapping route…" : "Goal Tree · Preview"}
      </div>
    </div>
  );
}
