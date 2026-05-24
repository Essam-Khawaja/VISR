"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/2/ui/Badge";
import type { ActionState } from "@/lib/2/planStore";
import type { ActionItem, StrategyPlan } from "@/lib/2/types";

type Props = {
  plan: StrategyPlan;
  actionStates: Record<string, ActionState>;
  onToggleAction: (actionId: string, state: ActionState) => void;
  open: boolean;
  onToggle: () => void;
  isDemo: boolean;
};

const priorityTone = {
  High: "danger",
  Medium: "warning",
  Low: "muted",
} as const;

/**
 * Bottom-edge dock that surfaces the full Next 7 days list with checkboxes.
 * Collapsed by default; toggles via the button.
 */
export function IntelligenceDock({
  plan,
  actionStates,
  onToggleAction,
  open,
  onToggle,
  isDemo,
}: Props) {
  const reduce = useReducedMotion();
  const doneCount = plan.nextSevenDays.filter((n) => {
    // We don't have action-style state for next7 items; treat them as
    // done if a matching pillar action with same title exists and is done.
    const matched = plan.strategicPillars
      .flatMap((p) => p.actions)
      .find((a) => a.name.toLowerCase() === n.title.toLowerCase());
    return matched ? actionStates[matched.id] === "done" : false;
  }).length;

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="pointer-events-auto absolute bottom-12 right-4 z-20 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-medium text-secondary shadow-soft transition-colors hover:border-border-strong hover:text-primary md:bottom-16 md:right-6"
      >
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
        />
        Next 7 days
        <span className="text-tertiary">·</span>
        <span className="tabular text-tertiary">
          {doneCount}/{plan.nextSevenDays.length}
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="pointer-events-auto absolute bottom-24 right-4 z-30 w-[min(360px,calc(100vw-2rem))] md:bottom-28 md:right-6"
            role="dialog"
            aria-label="Next 7 days intelligence dock"
          >
            <div className="rounded-3xl border border-border bg-surface p-4 shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-tertiary">
                    This week
                  </span>
                  <h3 className="font-display text-[16px] font-semibold leading-tight text-primary">
                    Next 7 days
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onToggle}
                  aria-label="Close dock"
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

              <ul className="mt-3 flex flex-col gap-1.5">
                {plan.nextSevenDays.map((n) => (
                  <DockItem
                    key={n.id}
                    item={n}
                    pillars={plan.strategicPillars}
                    actionStates={actionStates}
                    onToggleAction={onToggleAction}
                  />
                ))}
              </ul>

              <p className="mt-3 text-[11px] text-tertiary">
                {isDemo
                  ? "Demo plan - progress is in-session only."
                  : "Saved locally on this device."}
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function DockItem({
  item,
  pillars,
  actionStates,
  onToggleAction,
}: {
  item: ActionItem;
  pillars: StrategyPlan["strategicPillars"];
  actionStates: Record<string, ActionState>;
  onToggleAction: (id: string, s: ActionState) => void;
}) {
  // Find matching action by title (best-effort)
  const matched = pillars
    .flatMap((p) => p.actions)
    .find((a) => a.name.toLowerCase() === item.title.toLowerCase());
  const state: ActionState = matched
    ? actionStates[matched.id] ?? "open"
    : "open";
  const checked = state === "done";
  return (
    <li className="flex items-start gap-2 rounded-xl border border-border bg-surface px-2.5 py-2">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={`Mark "${item.title}" as ${checked ? "open" : "done"}`}
        disabled={!matched}
        onClick={() => {
          if (!matched) return;
          onToggleAction(matched.id, checked ? "open" : "done");
        }}
        className={
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors " +
          (checked
            ? "border-success bg-success text-white"
            : matched
              ? "border-border-strong bg-surface text-transparent hover:border-primary"
              : "cursor-not-allowed border-border bg-elevated text-transparent")
        }
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
          <path
            d="M2 5.5 L4.5 8 L9 3"
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
            "text-[12.5px] leading-snug " +
            (checked ? "text-tertiary line-through" : "text-primary")
          }
        >
          {item.title}
        </span>
        <div className="flex items-center gap-1.5">
          <Badge tone={priorityTone[item.priority]}>{item.priority}</Badge>
          <span className="text-[11px] text-tertiary">{item.category}</span>
        </div>
      </div>
    </li>
  );
}
