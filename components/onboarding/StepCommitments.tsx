"use client";

import { Textarea } from "@/components/ui/Textarea";
import type { StepProps } from "./onboardingTypes";

function toList(s: string): string[] {
  return s
    .split(/[,\n]/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

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

      <Textarea
        name="commitments"
        label="Current commitments"
        placeholder={
          "Student club lead, two side projects, networking events, considering research..."
        }
        rows={4}
        value={value.commitments.join("\n")}
        onChange={(e) => onChange({ commitments: toList(e.target.value) })}
        error={errors.commitments}
        hint="One per line, or comma-separated."
      />

      <Textarea
        name="constraints"
        label="Constraints"
        placeholder={
          "Can't work weekends, no car, family obligations Tuesdays..."
        }
        rows={3}
        value={value.constraints.join("\n")}
        onChange={(e) => onChange({ constraints: toList(e.target.value) })}
        error={errors.constraints}
        hint="Optional — anything that blocks certain activities."
      />
    </div>
  );
}
