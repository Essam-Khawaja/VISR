"use client";

import { Input } from "@/components/ui/Input";
import type { StepProps } from "./onboardingTypes";

export function StepDestination({ value, onChange, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-3xl font-semibold leading-tight text-primary">
          What are you actually trying to achieve?
        </h2>
        <p className="mt-2 text-[14px] text-secondary">
          Be specific &mdash; we&rsquo;ll put it at the center of your map.
          Everything else connects back here.
        </p>
      </div>

      <Input
        name="targetGoal"
        label="Target Goal"
        placeholder="e.g. Software Engineering Internship Summer 2026"
        value={value.targetGoal}
        onChange={(e) => onChange({ targetGoal: e.target.value })}
        error={errors.targetGoal}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          name="university"
          label="University"
          placeholder="University of Calgary"
          value={value.university}
          onChange={(e) => onChange({ university: e.target.value })}
          error={errors.university}
        />
        <Input
          name="year"
          label="Year"
          placeholder="Second year"
          value={value.year}
          onChange={(e) => onChange({ year: e.target.value })}
          error={errors.year}
        />
      </div>

      <Input
        name="degree"
        label="Degree"
        placeholder="BSc Computer Science"
        value={value.degree}
        onChange={(e) => onChange({ degree: e.target.value })}
        error={errors.degree}
      />
    </div>
  );
}
