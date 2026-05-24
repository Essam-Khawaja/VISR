"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OnboardingProgress } from "./OnboardingProgress";
import { StepDestination } from "./StepDestination";
import { StepAcademic } from "./StepAcademic";
import { StepCommitments } from "./StepCommitments";
import { StepConstraints } from "./StepConstraints";
import { StepBrainDump } from "./StepBrainDump";
import type { OnboardingFormData, StepErrors } from "./onboardingTypes";
import type { OnboardingMapState } from "./onboardingMapTypes";
import { ease } from "@/lib/motion";

const STEPS = [
  { id: "destination", label: "Destination", mapHint: "Setting your goal at the center" },
  { id: "courses", label: "Classes", mapHint: "Adding your classes to the map" },
  { id: "commitments", label: "Commitments", mapHint: "Connecting your commitments" },
  { id: "constraints", label: "Constraints", mapHint: "Noting what limits your route" },
  { id: "brain-dump", label: "Brain dump", mapHint: "Reading your honest take" },
];

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
  }
  if (step === 4) {
    if (value.brainDump.trim().length < 20)
      errors.brainDump = "Tell us more — at least 20 characters.";
  }
  return errors;
}

function applyMapDelta(
  step: number,
  profile: OnboardingFormData,
  prev: OnboardingMapState,
): OnboardingMapState {
  switch (step) {
    case 0:
      return {
        ...prev,
        goal: profile.targetGoal.trim()
          ? { label: profile.targetGoal.trim() }
          : prev.goal,
      };
    case 1:
      return {
        ...prev,
        courses: profile.currentCourses.map((c, i) => ({
          id: `course-${i}`,
          label: c,
        })),
      };
    case 2:
      return {
        ...prev,
        commitments: profile.commitments.map((c, i) => ({
          id: `commitment-${i}`,
          label: c,
        })),
      };
    default:
      return prev;
  }
}

type Props = {
  profile: OnboardingFormData;
  onProfileChange: (patch: Partial<OnboardingFormData>) => void;
  mapState: OnboardingMapState;
  onMapStateChange: (next: OnboardingMapState) => void;
  currentStep: number;
  onStepChange: (step: number) => void;
  onInsightFetch: (step: number) => void;
  submitting: boolean;
  onSubmit: () => void;
};

export function OnboardingForm({
  profile,
  onProfileChange,
  mapState,
  onMapStateChange,
  currentStep,
  onStepChange,
  onInsightFetch,
  submitting,
  onSubmit,
}: Props) {
  const [errors, setErrors] = useState<StepErrors>({});
  const stepErrors = useMemo(() => errors, [errors]);

  const tryNext = () => {
    const next = validate(currentStep, profile);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const updatedMap = applyMapDelta(currentStep, profile, mapState);
    onMapStateChange(updatedMap);
    const nextStep = Math.min(STEPS.length - 1, currentStep + 1);
    onStepChange(nextStep);
    onInsightFetch(currentStep);
  };

  const back = () => {
    setErrors({});
    onStepChange(Math.max(0, currentStep - 1));
  };

  const handleSubmit = () => {
    const next = validate(4, profile);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit();
  };

  const isLast = currentStep === STEPS.length - 1;

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6">
      <OnboardingProgress steps={STEPS} current={currentStep} />

      <Card noHover className="min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease }}
          >
            {currentStep === 0 ? (
              <StepDestination
                value={profile}
                onChange={onProfileChange}
                errors={stepErrors}
              />
            ) : null}
            {currentStep === 1 ? (
              <StepAcademic
                value={profile}
                onChange={onProfileChange}
                errors={stepErrors}
              />
            ) : null}
            {currentStep === 2 ? (
              <StepCommitments
                value={profile}
                onChange={onProfileChange}
                errors={stepErrors}
              />
            ) : null}
            {currentStep === 3 ? (
              <StepConstraints
                value={profile}
                onChange={onProfileChange}
                errors={stepErrors}
              />
            ) : null}
            {currentStep === 4 ? (
              <StepBrainDump
                value={profile}
                onChange={onProfileChange}
                errors={stepErrors}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </Card>

      <div className="flex items-center justify-between">
        {currentStep > 0 ? (
          <Button variant="ghost" onClick={back} disabled={submitting}>
            Back
          </Button>
        ) : (
          <span />
        )}
        {isLast ? (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Generating..." : "Generate strategy"}
          </Button>
        ) : (
          <Button onClick={tryNext}>Continue</Button>
        )}
      </div>
    </div>
  );
}
