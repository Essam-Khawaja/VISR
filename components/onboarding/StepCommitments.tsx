"use client";

import { ChipInput } from "./ChipInput";
import type { StepProps } from "./onboardingTypes";

export function StepCommitments({ value, onChange, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-3xl font-semibold leading-tight text-primary">
          What&rsquo;s already on your route?
        </h2>
        <p className="mt-2 text-[14px] text-secondary">
          Clubs, side projects, jobs, anything taking your time. We need the
          whole map.
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

      <ChipInput
        name="constraints"
        label="Constraints"
        placeholder="Can't work weekends, no car, family obligations Tuesdays"
        value={value.constraints}
        onChange={(items) => onChange({ constraints: items })}
        error={errors.constraints}
        hint="Optional — anything that blocks certain activities."
        maxChips={10}
      />
    </div>
  );
}
