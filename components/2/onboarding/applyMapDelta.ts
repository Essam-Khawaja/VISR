import type { OnboardingFormData } from "./onboardingTypes";
import type { OnboardingMapState } from "./onboardingMapTypes";
import type {
  AcademicTerm,
  SemesterCommitment,
  StrategyNode,
  StrategyTask,
  UniversityOnboardingProfile,
} from "@/lib/2/types";
import {
  buildCurrentSemesterNodes,
  buildSemesterNodes,
  buildYearNodes,
} from "@/components/2/graph/buildOnboardingLayout";

const PLAN_ID = "onboarding-preview";

function nowIso(): string {
  return new Date().toISOString();
}

function makeNode(
  input: Omit<
    StrategyNode,
    "planId" | "status" | "sortOrder" | "metadata" | "createdAt" | "updatedAt"
  > &
    Partial<Pick<StrategyNode, "status" | "sortOrder" | "metadata">>,
): StrategyNode {
  const now = nowIso();
  return {
    ...input,
    planId: PLAN_ID,
    status: input.status ?? "open",
    sortOrder: input.sortOrder ?? 0,
    metadata: input.metadata ?? {},
    createdAt: now,
    updatedAt: now,
  };
}

function rootNode(profile: OnboardingFormData): StrategyNode {
  return makeNode({
    id: "onboarding-outcome",
    parentNodeId: null,
    kind: "university_outcome",
    title:
      profile.endOfUniversityGoal ||
      profile.targetGoal ||
      "End of university",
    subtitle: profile.degree || "Long-range outcome",
    scope: "university",
  });
}

export function currentYearId(profile: OnboardingFormData): string {
  return `onboarding-year-${profile.currentYearIndex || 1}`;
}

export function currentSemesterId(profile: OnboardingFormData): string {
  return `onboarding-semester-${profile.currentSemester.toLowerCase()}`;
}

function recurringCommitments(value: OnboardingFormData): SemesterCommitment[] {
  if (value.recurringCommitments.length > 0) return value.recurringCommitments;
  return value.commitments.map((title, i) => ({
    id: `commitment-${i}`,
    title,
    kind: "other" as const,
    semesters: [value.currentSemester],
  }));
}

function toCompatProfile(
  profile: OnboardingFormData,
): Partial<UniversityOnboardingProfile> {
  return {
    ...profile,
    expectedGraduationYear: profile.expectedGraduationYear ?? undefined,
    constraints: Array.isArray(profile.constraints)
      ? profile.constraints.join(", ")
      : profile.constraints,
    recurringCommitments: recurringCommitments(profile),
  };
}

function taskSeedsToTasks(profile: OnboardingFormData): StrategyTask[] {
  return profile.taskSeeds.map((seed, i) => {
    const now = nowIso();
    return {
      id: seed.id,
      planId: PLAN_ID,
      studentId: null,
      parentNodeId: seed.parentNodeId,
      parentNodeKind:
        seed.parentNodeId === "onboarding-outcome" ? "goal" : "pillar",
      parentTaskId: null,
      title: seed.title,
      recommendation: "User-seeded onboarding task",
      notes: "",
      priority: seed.priority,
      status: "open",
      dueDate: seed.dueDate,
      completedAt: null,
      source: "strategy_map",
      sortOrder: i,
      createdAt: now,
      updatedAt: now,
    };
  });
}

export function applyMapDelta(
  step: number,
  profile: OnboardingFormData,
  prev: OnboardingMapState,
): OnboardingMapState {
  const root = rootNode(profile);
  const compatProfile = toCompatProfile(profile);
  const yearNodes = buildYearNodes(compatProfile);
  const semesterNodes = buildSemesterNodes(
    compatProfile,
    currentYearId(profile),
  );
  const semesterDetailNodes = buildCurrentSemesterNodes(
    compatProfile,
    currentSemesterId(profile),
  );
  const tasks = taskSeedsToTasks(profile);

  if (step === 0) {
    return {
      ...prev,
      goal: { label: root.title },
      activeLevel: "destination",
      activeNodeId: root.id,
      nodes: [root],
      tasks: [],
    };
  }
  if (step === 1) {
    return {
      ...prev,
      activeLevel: "university_timeline",
      activeNodeId: root.id,
      nodes: [root, ...yearNodes],
      tasks: [],
    };
  }
  if (step === 2) {
    return {
      ...prev,
      activeLevel: "current_year",
      activeNodeId: currentYearId(profile),
      nodes: [root, ...yearNodes, ...semesterNodes],
      tasks: [],
    };
  }
  if (step === 3 || step === 4) {
    return {
      ...prev,
      activeLevel: step === 4 ? "task_seed" : "current_semester",
      activeNodeId: currentSemesterId(profile),
      nodes: [root, ...yearNodes, ...semesterNodes, ...semesterDetailNodes],
      tasks,
    };
  }
  return {
    ...prev,
    activeLevel: "handoff",
    activeNodeId: currentSemesterId(profile),
    bottleneckPreview: profile.bottleneckConcern || prev.bottleneckPreview,
    nodes: [root, ...yearNodes, ...semesterNodes, ...semesterDetailNodes],
    tasks,
  };
}
