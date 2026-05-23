"use client";

import { motion, useReducedMotion } from "framer-motion";
import { NumberDial } from "@/components/ui/NumberDial";
import { Reticle } from "@/components/signature/Reticle";
import { ease } from "@/lib/motion";

type Props = {
  score: number;
  /** Show a "scanning" pulse instead of the filled arc. */
  pending?: boolean;
};

const SIZE = 220;
const STROKE = 4;
const RADIUS = SIZE / 2 - STROKE * 2;
const CIRC = 2 * Math.PI * RADIUS;

function scoreColor(score: number): string {
  if (score >= 70) return "var(--success)";
  if (score >= 40) return "var(--warning)";
  return "var(--danger)";
}

export function FitScoreGauge({ score, pending }: Props) {
  const reduce = useReducedMotion();
  const color = scoreColor(score);
  const offset = CIRC * (1 - score / 100);

  return (
    <div
      className="relative shrink-0"
      style={{ width: SIZE, height: SIZE }}
      aria-label={`Fit score ${score}`}
      role="img"
    >
      <Reticle
        className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40"
        size={SIZE}
        strokeWidth={0.8}
      />
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE}>
        <defs>
          <linearGradient id="gauge-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.55" />
          </linearGradient>
        </defs>

        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="var(--border)"
          strokeWidth={STROKE}
          fill="none"
        />
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
          const inner = RADIUS - 9;
          const outer = RADIUS - 5;
          const x1 = SIZE / 2 + Math.cos(a) * inner;
          const y1 = SIZE / 2 + Math.sin(a) * inner;
          const x2 = SIZE / 2 + Math.cos(a) * outer;
          const y2 = SIZE / 2 + Math.sin(a) * outer;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--border)"
              strokeWidth="0.8"
            />
          );
        })}

        {pending ? (
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${CIRC * 0.18} ${CIRC * 0.82}`}
            animate={
              reduce
                ? undefined
                : {
                    rotate: 360,
                  }
            }
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 1.6,
            }}
            style={{ transformOrigin: "50% 50%" }}
          />
        ) : (
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="url(#gauge-fill)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: reduce ? offset : offset }}
            transition={{ duration: reduce ? 0 : 0.8, ease }}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
          />
        )}
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
        {pending ? (
          <span className="font-display text-2xl text-secondary">
            Evaluating
          </span>
        ) : (
          <>
            <span
              className="text-[10px] uppercase tracking-widest"
              style={{ color }}
            >
              Fit Score
            </span>
            <div className="flex items-baseline gap-1">
              <NumberDial
                to={score}
                duration={0.8}
                className="font-display text-[58px] font-semibold leading-none text-primary"
              />
              <span className="font-display text-2xl text-secondary">%</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
