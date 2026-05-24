"use client";

import { ChipInput } from "./ChipInput";
import type { StepProps } from "./onboardingTypes";

export function StepCommitments({ value, onChange, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-3xl font-semibold leading-tight text-primary">
          What else is on your plate?
        </h2>
        <p className="mt-2 text-[14px] text-secondary">
          Clubs, jobs, side projects &mdash; each one gets a node. These compete
          for the same hours as your goal.
        </p>
      </div>

      <ChipInput
        name="commitments"
        label="Current commitments"
        placeholder="Student club lead, two side projects, networking events"
        value={value.commitments}
        onChange={(items) => onChange({ commitments: items })}
        error={errors.commitments}
        hint="Press Enter or comma to add. Backspace to remove."
        maxChips={20}
      />
    </div>
  );
}
