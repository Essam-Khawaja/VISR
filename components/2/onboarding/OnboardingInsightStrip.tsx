"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ease } from "@/lib/shared/motion";

type Props = {
  insight: string | null;
  isLoading: boolean;
};

export function OnboardingInsightStrip({ insight, isLoading }: Props) {
  return (
    <div
      aria-live="polite"
      className="rounded-2xl border border-border bg-surface/90 px-4 py-3 shadow-soft backdrop-blur-sm"
    >
      <span className="text-[11px] font-semibold uppercase tracking-widest text-accent">
        Pathwise Insight
      </span>
      <AnimatePresence mode="wait">
        <motion.p
          key={isLoading ? "loading" : insight ?? "default"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25, ease }}
          className="mt-1.5 text-[13px] leading-relaxed text-primary"
        >
          {isLoading ? (
            <span className="inline-block animate-soft-pulse text-tertiary">
              Pathwise is thinking&hellip;
            </span>
          ) : (
            insight ?? "Answer the questions above to start building your strategy map."
          )}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
