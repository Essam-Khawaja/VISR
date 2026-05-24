"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/strategyweb/ui/Badge";
import type { StrategyTask, StrategyTaskStatus } from "@/lib/strategyweb/types";

type Props = {
  tasks: StrategyTask[];
  onMarkTask: (taskId: string, state: StrategyTaskStatus) => void;
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
 * Bottom-edge dock that surfaces the next 7 days of real strategy tasks.
 */
export function IntelligenceDock({
  tasks,
  onMarkTask,
  open,
  onToggle,
  isDemo,
}: Props) {
  const reduce = useReducedMotion();
  const doneCount = tasks.filter((task) => task.status === "done").length;

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
          {doneCount}/{tasks.length}
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

              {tasks.length === 0 ? (
                <p className="mt-3 text-[12px] text-tertiary">
                  No strategy tasks due in the next 7 days.
                </p>
              ) : (
                <ul className="mt-3 flex flex-col gap-1.5">
                  {tasks.map((task) => (
                    <DockItem key={task.id} task={task} onMarkTask={onMarkTask} />
                  ))}
                </ul>
              )}

              <p className="mt-3 text-[11px] text-tertiary">
                {isDemo
                  ? "Demo plan - progress is in-session only."
                  : "Synced from your strategy map."}
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function DockItem({
  task,
  onMarkTask,
}: {
  task: StrategyTask;
  onMarkTask: (taskId: string, state: StrategyTaskStatus) => void;
}) {
  const checked = task.status === "done";
  return (
    <li className="flex items-start gap-2 rounded-xl border border-border bg-surface px-2.5 py-2">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={`Mark "${task.title}" as ${checked ? "open" : "done"}`}
        onClick={() => onMarkTask(task.id, checked ? "open" : "done")}
        className={
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors " +
          (checked
            ? "border-success bg-success text-white"
            : "border-border-strong bg-surface text-transparent hover:border-primary")
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
          {task.title}
        </span>
        <div className="flex items-center gap-1.5">
          <Badge tone={priorityTone[task.priority]}>{task.priority}</Badge>
          <span className="text-[11px] text-tertiary">Due {task.dueDate}</span>
        </div>
      </div>
    </li>
  );
}
