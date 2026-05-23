"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OnboardingProgress } from "./OnboardingProgress";
import { StepDestination } from "./StepDestination";
import { StepAcademic } from "./StepAcademic";
import { StepCommitments } from "./StepCommitments";
import { StepBrainDump } from "./StepBrainDump";
import { GenerationLoading } from "./GenerationLoading";
import {
  emptyForm,
  type OnboardingFormData,
  type StepErrors,
} from "./onboardingTypes";
import { demoPlanId } from "@/lib/env";
import { ease } from "@/lib/motion";
import { savePlan } from "@/lib/planStore";
import type { StrategyPlan } from "@/lib/types";

const STEPS = [
  { id: "destination", label: "Destination" },
  { id: "academic", label: "Academic" },
  { id: "commitments", label: "Commitments" },
  { id: "brain-dump", label: "Brain dump" },
] as const;

const DRAFT_KEY = "pathwise-onboarding-draft";

function validate(step: number, value: OnboardingFormData): StepErrors {
  const errors: StepErrors = {};
  if (step === 0) {
    if (!value.targetGoal.trim()) errors.targetGoal = "Required.";
    if (!value.university.trim()) errors.university = "Required.";
    if (!value.year.trim()) errors.year = "Required.";
    if (!value.degree.trim()) errors.degree = "Required.";
  }
  if (step === 1) {
    if (value.currentCourses.length === 0)
      errors.currentCourses = "Add at least one course.";
    if (value.workHoursPerWeek < 0 || value.workHoursPerWeek > 80)
      errors.workHoursPerWeek = "Must be between 0 and 80.";
  }
  if (step === 3) {
    if (value.brainDump.trim().length < 20)
      errors.brainDump = "Tell us more — at least 20 characters.";
  }
  return errors;
}

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [value, setValue] = useState<OnboardingFormData>(emptyForm);
  const [errors, setErrors] = useState<StepErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as OnboardingFormData;
      setValue({ ...emptyForm, ...draft });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(value));
  }, [value]);

  const stepErrors = useMemo(() => errors, [errors]);

  const onChange = (patch: Partial<OnboardingFormData>) => {
    setValue((v) => ({ ...v, ...patch }));
  };

  const tryNext = () => {
    const next = validate(step, value);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const submit = async () => {
    const next = validate(3, value);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: value }),
      });
      if (!res.ok) {
        if (res.status === 404) {
          // API pipeline not deployed yet — route to demo so the flow still works.
          window.sessionStorage.removeItem(DRAFT_KEY);
          router.push(`/dashboard/${demoPlanId}`);
          return;
        }
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as {
        ok?: boolean;
        planId: string;
        plan: StrategyPlan;
      };
      if (data.plan) savePlan(data.planId, data.plan);
      window.sessionStorage.removeItem(DRAFT_KEY);
      router.push(`/dashboard/${data.planId}`);
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "Something went wrong. Try again.",
      );
      setSubmitting(false);
    }
  };

  const isLast = step === STEPS.length - 1;

  if (submitting) {
    return (
      <GenerationLoading
        error={submitError}
        onRetry={() => {
          setSubmitError(null);
          submit();
        }}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
      <OnboardingProgress
        steps={STEPS as unknown as { id: string; label: string }[]}
        current={step}
      />

      <Card noHover className="min-h-[420px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease }}
          >
            {step === 0 ? (
              <StepDestination
                value={value}
                onChange={onChange}
                errors={stepErrors}
              />
            ) : null}
            {step === 1 ? (
              <StepAcademic
                value={value}
                onChange={onChange}
                errors={stepErrors}
              />
            ) : null}
            {step === 2 ? (
              <StepCommitments
                value={value}
                onChange={onChange}
                errors={stepErrors}
              />
            ) : null}
            {step === 3 ? (
              <StepBrainDump
                value={value}
                onChange={onChange}
                errors={stepErrors}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </Card>

      <div className="flex items-center justify-between">
        {step > 0 ? (
          <Button variant="ghost" onClick={back}>
            Back
          </Button>
        ) : (
          <span />
        )}
        {isLast ? (
          <Button onClick={submit}>Generate strategy</Button>
        ) : (
          <Button onClick={tryNext}>Continue</Button>
        )}
      </div>

      {submitError ? (
        <p className="text-center text-[12px] text-danger">{submitError}</p>
      ) : null}
    </div>
  );
}
