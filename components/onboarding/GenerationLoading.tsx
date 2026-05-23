"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ScanLine } from "@/components/signature/ScanLine";
import { ease } from "@/lib/motion";

const MESSAGES = [
  "Analyzing your goal",
  "Mapping your strategic pillars",
  "Identifying your bottleneck",
  "Building your route",
];

type Props = {
  error?: string | null;
  onRetry?: () => void;
};

export function GenerationLoading({ error, onRetry }: Props) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? MESSAGES.length : 1);

  useEffect(() => {
    if (reduce || error) return;
    const id = setInterval(() => {
      setShown((s) => (s < MESSAGES.length ? s + 1 : s));
    }, 850);
    return () => clearInterval(id);
  }, [reduce, error]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center bg-base"
    >
      {!error ? <ScanLine duration={2.4} /> : null}

      <div className="relative w-full max-w-[560px] px-6">
        <ConstellationField />

        <div className="relative z-[2] flex flex-col gap-4">
          <p className="text-[10px] uppercase tracking-widest text-secondary">
            Pathwise &middot; Generating
          </p>
          <h2 className="font-display text-3xl font-semibold leading-tight text-primary">
            Building your route
          </h2>

          <ul className="mt-4 flex flex-col gap-2 font-mono text-[13px]">
            {MESSAGES.slice(0, shown).map((m, i) => (
              <motion.li
                key={m}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease }}
                className="flex items-center gap-2 text-secondary"
              >
                <span className="text-accent">{">"}</span>
                <span>{m}</span>
                {i === shown - 1 && !error ? <Cursor /> : null}
              </motion.li>
            ))}
          </ul>

          {error ? (
            <div className="mt-6 flex flex-col gap-3">
              <p className="text-[13px] text-danger">{error}</p>
              {onRetry ? (
                <div>
                  <Button variant="secondary" onClick={onRetry}>
                    Retry
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Cursor() {
  return (
    <span
      aria-hidden
      className="ml-1 inline-block h-[1em] w-[7px] animate-breathe"
      style={{ backgroundColor: "var(--accent)" }}
    />
  );
}

function ConstellationField() {
  const dots = [
    { x: 12, y: 14, d: 0.4 },
    { x: 88, y: 18, d: 0.8 },
    { x: 22, y: 78, d: 1.0 },
    { x: 78, y: 70, d: 1.2 },
    { x: 50, y: 92, d: 1.5 },
    { x: 6, y: 50, d: 0.6 },
    { x: 94, y: 50, d: 1.1 },
    { x: 50, y: 6, d: 0.2 },
    { x: 34, y: 32, d: 0.3 },
    { x: 66, y: 32, d: 0.7 },
    { x: 34, y: 60, d: 0.9 },
    { x: 66, y: 60, d: 1.3 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {dots.map((dot, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 0.5, ease, delay: dot.d }}
          className="absolute h-1 w-1 rounded-full"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            backgroundColor: "var(--accent)",
            boxShadow: "0 0 10px var(--accent-glow)",
          }}
        />
      ))}
    </div>
  );
}
