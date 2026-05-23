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
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium text-secondary">
          Step {current + 1} of {steps.length}
        </span>
        <span className="text-[12px] text-tertiary">
          {steps[current]?.label}
        </span>
      </div>
      <div className="flex items-stretch gap-1.5">
        {steps.map((step, i) => {
          const state =
            i < current ? "done" : i === current ? "active" : "pending";
          return (
            <span
              key={step.id}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                state === "active"
                  ? "bg-accent"
                  : state === "done"
                    ? "bg-accent/70"
                    : "bg-elevated",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
