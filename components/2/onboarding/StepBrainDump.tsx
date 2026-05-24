"use client";

import { Textarea } from "@/components/2/ui/Textarea";
import type { StepProps } from "./onboardingTypes";

export function StepBrainDump({ value, onChange, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-3xl font-semibold leading-tight text-primary">
          Now the honest version.
        </h2>
        <p className="mt-2 text-[14px] text-secondary">
          Be messy. What you&rsquo;re worried about, behind on, unsure of, secretly
          hoping for. The more honest, the sharper the strategy.
        </p>
      </div>

      <Textarea
        name="brainDump"
        label="Brain dump"
        placeholder={
          "I feel scattered. My GitHub is empty. I keep starting projects and not finishing them. I'm worried recruiting season will close before I'm ready..."
        }
        rows={10}
        showCount
        maxLength={2000}
        value={value.brainDump}
        onChange={(e) => onChange({ brainDump: e.target.value })}
        error={errors.brainDump}
        hint="Minimum 20 characters. No structure required."
      />
    </div>
  );
}
