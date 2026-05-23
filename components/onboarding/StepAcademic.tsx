"use client";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { StepProps } from "./onboardingTypes";

function toList(s: string): string[] {
  return s
    .split(/[,\n]/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

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

      <Textarea
        name="currentCourses"
        label="Current courses"
        placeholder={"Algorithms, Databases, Operating Systems, Linear Algebra"}
        rows={3}
        value={value.currentCourses.join(", ")}
        onChange={(e) => onChange({ currentCourses: toList(e.target.value) })}
        error={errors.currentCourses}
        hint="Separate with commas or new lines."
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
