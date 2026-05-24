"use client";

import { ChipInput } from "./ChipInput";
import type { StepProps } from "./onboardingTypes";

export function StepAcademic({ value, onChange, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-3xl font-semibold leading-tight text-primary">
          What classes are you in?
        </h2>
        <p className="mt-2 text-[14px] text-secondary">
          Each one becomes a node tied to your goal. These are your fixed
          academic load &mdash; they constrain how much else you can take on.
        </p>
      </div>

      <ChipInput
        name="currentCourses"
        label="Current courses"
        placeholder="Algorithms, Databases, Operating Systems, Linear Algebra"
        value={value.currentCourses}
        onChange={(items) => onChange({ currentCourses: items })}
        error={errors.currentCourses}
        hint="Press Enter or comma to add. Backspace to remove."
        maxChips={15}
      />
    </div>
  );
}
