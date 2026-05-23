"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ease } from "@/lib/motion";

const MESSAGES = [
  "Reading your inputs",
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-base px-6"
    >
      <div className="relative w-full max-w-[520px] rounded-3xl border border-border bg-surface p-8 shadow-card sm:p-10">
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-medium uppercase tracking-wider text-tertiary">
            Pathwise · Generating
          </span>
          <h2 className="font-display text-3xl font-semibold leading-tight text-primary">
            Building your route
          </h2>
          <p className="text-[14px] leading-relaxed text-secondary">
            Hold on a moment — naming your bottleneck and choosing what to cut.
          </p>
        </div>

        <ul className="mt-8 flex flex-col gap-3">
          {MESSAGES.map((m, i) => {
            const isActive = i < shown;
            const isCurrent = i === shown - 1 && !error;
            return (
              <motion.li
                key={m}
                initial={reduce ? false : { opacity: 0, x: -8 }}
                animate={
                  isActive ? { opacity: 1, x: 0 } : { opacity: 0.25, x: 0 }
                }
                transition={{ duration: 0.3, ease }}
                className="flex items-center gap-3 text-[14px]"
              >
                <span
                  className={
                    "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border " +
                    (isActive && !isCurrent
                      ? "border-accent bg-accent text-white"
                      : isCurrent
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border bg-surface text-tertiary")
                  }
                  aria-hidden
                >
                  {isActive && !isCurrent ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5.2 L4.2 7.4 L8.2 2.8"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : isCurrent ? (
                    <span className="block h-1.5 w-1.5 animate-soft-pulse rounded-full bg-accent" />
                  ) : null}
                </span>
                <span
                  className={
                    isActive ? "text-primary" : "text-tertiary"
                  }
                >
                  {m}
                </span>
              </motion.li>
            );
          })}
        </ul>

        {error ? (
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-danger/30 bg-danger-soft p-4">
            <p className="text-[14px] text-danger">{error}</p>
            {onRetry ? (
              <div>
                <Button variant="secondary" onClick={onRetry}>
                  Try again
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
