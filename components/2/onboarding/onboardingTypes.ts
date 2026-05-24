import type {
  AcademicTerm,
  SemesterCommitment,
  StudentProfile,
} from "@/lib/2/types";

export type OnboardingTaskSeed = {
  id: string;
  parentNodeId: string;
  title: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
};

export type OnboardingFormData = Omit<StudentProfile, "id" | "createdAt"> & {
  endOfUniversityGoal: string;
  expectedProgramLengthYears: number;
  expectedGraduationYear: number | null;
  totalCoursesRequired: number;
  coursesCompleted: number;
  currentYearIndex: number;
  currentSemester: AcademicTerm;
  typicalFallCourses: number;
  typicalWinterCourses: number;
  plansSpringSummerCourses: boolean;
  recurringCommitments: SemesterCommitment[];
  bottleneckConcern: string;
  taskSeeds: OnboardingTaskSeed[];
};

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
  endOfUniversityGoal: "",
  expectedProgramLengthYears: 4,
  expectedGraduationYear: null,
  totalCoursesRequired: 40,
  coursesCompleted: 0,
  currentYearIndex: 1,
  currentSemester: "Fall",
  typicalFallCourses: 5,
  typicalWinterCourses: 5,
  plansSpringSummerCourses: false,
  recurringCommitments: [],
  bottleneckConcern: "",
  taskSeeds: [],
};

export type StepErrors = Partial<Record<keyof OnboardingFormData, string>>;

export type StepProps = {
  value: OnboardingFormData;
  onChange: (patch: Partial<OnboardingFormData>) => void;
  errors: StepErrors;
};
