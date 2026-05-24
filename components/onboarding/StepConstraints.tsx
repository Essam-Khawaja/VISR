"use client";

import { Input } from "@/components/ui/Input";
import { ChipInput } from "./ChipInput";
import type { StepProps } from "./onboardingTypes";

export function StepConstraints({ value, onChange, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-3xl font-semibold leading-tight text-primary">
          What limits your route?
        </h2>
        <p className="mt-2 text-[14px] text-secondary">
          Work hours, schedule blocks, family obligations &mdash; we&rsquo;ll
          respect these when recommending cuts and your next 7 days.
        </p>
      </div>

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

      <ChipInput
        name="constraints"
        label="Constraints"
        placeholder="Can't work weekends, no car, family obligations Tuesdays"
        value={value.constraints}
        onChange={(items) => onChange({ constraints: items })}
        error={errors.constraints}
        hint="Optional — press Enter to add each constraint."
        maxChips={10}
      />
    </div>
  );
}
