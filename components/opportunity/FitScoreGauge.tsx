"use client";

import { motion, useReducedMotion } from "framer-motion";
import { NumberDial } from "@/components/ui/NumberDial";
import { ease } from "@/lib/motion";

type Props = {
  score: number;
  pending?: boolean;
};

const SIZE = 200;
const STROKE = 12;
const RADIUS = SIZE / 2 - STROKE;
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
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE}>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="var(--bg-elevated)"
          strokeWidth={STROKE}
          fill="none"
        />

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
            animate={reduce ? undefined : { rotate: 360 }}
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
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: reduce ? 0 : 0.8, ease }}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        )}
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
        {pending ? (
          <span className="font-display text-2xl text-tertiary">
            Evaluating
          </span>
        ) : (
          <>
            <span
              className="text-[11px] font-medium"
              style={{ color }}
            >
              Fit Score
            </span>
            <div className="flex items-baseline gap-0.5">
              <NumberDial
                to={score}
                duration={0.8}
                className="font-display text-[54px] font-semibold leading-none text-primary"
              />
              <span className="font-display text-xl text-tertiary">/100</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
