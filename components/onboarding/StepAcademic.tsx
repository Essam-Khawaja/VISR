"use client";

import { Input } from "@/components/ui/Input";
import { ChipInput } from "./ChipInput";
import type { StepProps } from "./onboardingTypes";

export function StepAcademic({ value, onChange, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-3xl font-semibold leading-tight text-primary">
          What&rsquo;s on your plate academically?
        </h2>
        <p className="mt-2 text-[14px] text-secondary">
          Courses give us context. Work hours tell us what time you actually
          have.
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

      <Input
        name="workHoursPerWeek"
        label="Work hours per week"
        placeholder="12"
        inputMode="numeric"
        value={value.workHoursPerWeek === 0 ? "" : String(value.workHoursPerWeek)}
        onChange={(e) => {
          const n = Number(e.target.value.replace(/[^0-9]/g, ""));
          onChange({ workHoursPerWeek: isNaN(n) ? 0 : Math.min(80, n) });
        }}
        error={errors.workHoursPerWeek}
        hint="Set to 0 if you do not work."
      />
    </div>
  );
}
