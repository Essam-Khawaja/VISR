import type { StudentProfile } from "@/lib/types";

export type OnboardingFormData = Omit<StudentProfile, "id" | "createdAt">;

export const emptyForm: OnboardingFormData = {
  university: "",
  degree: "",
  year: "",
  targetGoal: "",
  secondaryGoals: [],
  currentCourses: [],
  commitments: [],
  workHoursPerWeek: 0,
  constraints: [],
  brainDump: "",
};

export type StepErrors = Partial<Record<keyof OnboardingFormData, string>>;

export type StepProps = {
  value: OnboardingFormData;
  onChange: (patch: Partial<OnboardingFormData>) => void;
  errors: StepErrors;
};
