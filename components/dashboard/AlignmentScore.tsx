"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Reticle } from "@/components/signature/Reticle";
import { NumberDial } from "@/components/ui/NumberDial";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

type Props = {
  score: number;
  className?: string;
};

const TICKS = 60;
const SIZE = 240;
const STROKE = 1.25;
const RADIUS = SIZE / 2 - 16;

export function AlignmentScore({ score, className }: Props) {
  const reduce = useReducedMotion();
  const activeTicks = Math.round((score / 100) * TICKS);
  return (
    <div className={cn("relative flex flex-col gap-3", className)}>
      <span className="text-[10px] uppercase tracking-widest text-secondary">
        Alignment Score
      </span>
      <div className="relative flex items-center gap-6">
        <div
          className="relative shrink-0"
          style={{ width: SIZE, height: SIZE }}
        >
          <Reticle
            className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50"
            size={SIZE}
            strokeWidth={1}
          />
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            width={SIZE}
            height={SIZE}
            className="relative"
            aria-hidden
          >
            {Array.from({ length: TICKS }).map((_, i) => {
              const angle = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
              const inner = RADIUS - 6;
              const outer = RADIUS;
              const x1 = SIZE / 2 + Math.cos(angle) * inner;
              const y1 = SIZE / 2 + Math.sin(angle) * inner;
              const x2 = SIZE / 2 + Math.cos(angle) * outer;
              const y2 = SIZE / 2 + Math.sin(angle) * outer;
              const isActive = i < activeTicks;
              return (
                <motion.line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isActive ? "var(--accent)" : "var(--border)"}
                  strokeWidth={STROKE}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.4,
                    ease,
                    delay: isActive ? i * 0.012 : 0,
                  }}
                  style={
                    isActive
                      ? {
                          filter:
                            "drop-shadow(0 0 4px var(--accent-glow))",
                        }
                      : undefined
                  }
                />
              );
            })}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex items-baseline gap-1">
              <NumberDial
                to={score}
                duration={1.2}
                className="font-display text-[68px] font-semibold leading-none text-primary"
              />
              <span className="font-display text-2xl text-secondary">%</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest text-secondary">
            Reading
          </span>
          <p className="text-[13px] leading-relaxed text-secondary">
            Honest assessment of how your current activities map to your goal.
            Below 70 means there is signal to cut.
          </p>
        </div>
      </div>
    </div>
  );
}
