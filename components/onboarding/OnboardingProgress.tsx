"use client";

import { cn } from "@/lib/cn";

type Props = {
  steps: { id: string; label: string }[];
  current: number;
  className?: string;
};

export function OnboardingProgress({ steps, current, className }: Props) {
  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <div className="flex items-stretch gap-2">
        {steps.map((step, i) => {
          const state =
            i < current ? "done" : i === current ? "active" : "pending";
          const color =
            state === "active"
              ? "var(--accent)"
              : state === "done"
                ? "var(--success)"
                : "var(--border)";
          return (
            <div key={step.id} className="flex flex-1 flex-col gap-1.5">
              <span
                className="block h-[3px] origin-left transition-colors duration-300"
                style={{
                  backgroundColor: color,
                  boxShadow:
                    state === "active"
                      ? "0 0 14px var(--accent-glow)"
                      : undefined,
                }}
              />
              <span
                className={cn(
                  "text-[10px] uppercase tracking-widest tabular",
                  state === "active"
                    ? "text-primary"
                    : state === "done"
                      ? "text-success"
                      : "text-secondary",
                )}
              >
                {String(i + 1).padStart(2, "0")} · {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
