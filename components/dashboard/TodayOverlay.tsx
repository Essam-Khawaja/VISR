"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { usePlanOptional } from "./PlanProvider";
import type { ActionState } from "@/lib/planStore";

type Props = {
  open: boolean;
  onClose: () => void;
};

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 } as const;

const priorityTone = {
  High: "danger",
  Medium: "warning",
  Low: "muted",
} as const;

export function TodayOverlay({ open, onClose }: Props) {
  const ctx = usePlanOptional();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const top = useMemo(() => {
    if (!ctx) return [];
    return [...ctx.plan.nextSevenDays]
      .sort(
        (a, b) =>
          PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
      )
      .slice(0, 3);
  }, [ctx]);

  if (!ctx) return null;

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-base/70 px-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Today focus"
        >
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] rounded-3xl border border-border bg-surface p-7 shadow-lift"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-tertiary">
                Today
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-tertiary transition-colors hover:bg-elevated hover:text-primary"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 2 L12 12 M12 2 L2 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <h2 className="mt-2 font-display text-[26px] font-semibold leading-tight text-primary">
              The three things for today
            </h2>
            <p className="mt-1 text-[13px] text-tertiary">{dateLabel}</p>

            {top.length === 0 ? (
              <p className="mt-5 text-[14px] leading-relaxed text-secondary">
                Your plan has no Next 7 Days items yet. Open onboarding to
                generate them.
              </p>
            ) : (
              <ul className="mt-5 flex flex-col gap-2">
                {top.map((item, i) => {
                  const matched = ctx.plan.strategicPillars
                    .flatMap((p) => p.actions)
                    .find(
                      (a) =>
                        a.name.toLowerCase() === item.title.toLowerCase(),
                    );
                  const state: ActionState = matched
                    ? ctx.stored.actionStates[matched.id] ?? "open"
                    : "open";
                  const checked = state === "done";
                  return (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-3"
                    >
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        disabled={!matched}
                        onClick={() => {
                          if (!matched) return;
                          ctx.markAction(matched.id, checked ? "open" : "done");
                        }}
                        className={
                          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors " +
                          (checked
                            ? "border-success bg-success text-white"
                            : matched
                              ? "border-border-strong bg-surface text-transparent hover:border-primary"
                              : "cursor-not-allowed border-border bg-elevated text-transparent")
                        }
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 13 13"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M2.5 6.5 L5.5 9.5 L10.5 4"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span
                          className={
                            "text-[14px] font-medium leading-snug " +
                            (checked
                              ? "text-tertiary line-through"
                              : "text-primary")
                          }
                        >
                          <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-elevated text-[11px] font-semibold text-secondary">
                            {i + 1}
                          </span>
                          {item.title}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge tone={priorityTone[item.priority]}>
                            {item.priority}
                          </Badge>
                          <span className="text-[11px] text-tertiary">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-6 flex items-center justify-between">
              <span className="text-[11px] text-tertiary">
                Press{" "}
                <kbd className="rounded border border-border bg-elevated px-1 py-0.5 text-[10px] font-medium text-secondary">
                  Esc
                </kbd>{" "}
                or{" "}
                <kbd className="rounded border border-border bg-elevated px-1 py-0.5 text-[10px] font-medium text-secondary">
                  T
                </kbd>{" "}
                to close
              </span>
              <Button size="sm" variant="secondary" onClick={onClose}>
                Back to strategy
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
