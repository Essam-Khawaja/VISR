/**
 * lib/strategyweb/types.ts
 *
 * Canonical Strategy Web domain types. Every layer (Zod validators, AI
 * prompts, Supabase mappers, React components) keeps the same field names
 * so a feature change is a one-file refactor, not a cross-module hunt.
 *
 * Highlights:
 *   - StudentProfile     : raw onboarding inputs.
 *   - StrategyPlan       : the AI/deterministic output rendered on the
 *                          dashboard (destination, pillars, cuts, risks).
 *   - StrategyNode       : a node in the goal graph (university, year,
 *                          semester, course, commitment, etc.).
 *   - StrategyTask       : an action item with a due date that the
 *                          Flowgram day/week views surface.
 *   - OpportunityCheck   : structured "should I take this on?" output.
 */
export type StudentProfile = {
  id: string;
  university: string;
  degree: string;
  year: string;
  targetGoal: string;
  secondaryGoals: string[];
  currentCourses: string[];
  commitments: string[];
  workHoursPerWeek: number;
  constraints: string[];
  brainDump: string;
  createdAt: string;
};

export type NodeStatus = "On Track" | "Behind" | "At Risk" | "Deferred" | "Cut";
export type PillarStatus = "Strong" | "Okay" | "Weak" | "Missing";
export type RouteStatus = "On Track" | "At Risk" | "Scattered" | "Needs Focus";
export type Recommendation =
  | "Say Yes"
  | "Say No"
  | "Defer"
  | "Say Yes With Conditions";
export type CutRecommendation = "Cut" | "Defer" | "Keep" | "Double Down";
export type Priority = "High" | "Medium" | "Low";
export type Severity = "High" | "Medium" | "Low";
export type AcademicTerm = "Fall" | "Winter" | "Spring" | "Summer";
export type StrategyGraphScope = "university" | "year" | "semester" | "focus";
export type StrategyNodeKind =
  | "university_outcome"
  | "academic_year"
  | "semester"
  | "course"
  | "club"
  | "work"
  | "project"
  | "research"
  | "strategic_pillar"
  | "commitment"
  | "task";
export type StrategyNodeStatus =
  | "open"
  | "doing"
  | "done"
  | "skipped"
  | "at_risk";
export type StrategyTaskStatus = "open" | "doing" | "done" | "skipped";
export type StrategyTaskSource =
  | "strategy_map"
  | "daily"
  | "week"
  | "ai"
  | "opportunity"
  | "generated_plan";
export type StrategyTaskParentKind = "goal" | "pillar" | "task";

export type SemesterCommitment = {
  id: string;
  title: string;
  kind: "club" | "work" | "research" | "project" | "family" | "other";
  semesters: AcademicTerm[];
  hoursPerWeek?: number;
};

export type UniversityOnboardingProfile = {
  endOfUniversityGoal: string;
  university: string;
  degree: string;
  expectedProgramLengthYears: number;
  expectedGraduationYear?: number;
  totalCoursesRequired: number;
  coursesCompleted?: number;
  currentYearIndex: number;
  currentSemester: AcademicTerm;
  typicalFallCourses?: number;
  typicalWinterCourses?: number;
  plansSpringSummerCourses: boolean;
  currentCourses: string[];
  recurringCommitments: SemesterCommitment[];
  workHoursPerWeek: number;
  constraints: string;
  bottleneckConcern: string;
  taskSeeds: Array<{
    id: string;
    parentNodeId: string;
    title: string;
    dueDate: string;
    priority: Priority;
  }>;
};

export type ActionNode = {
  id: string;
  name: string;
  status: NodeStatus;
  recommendation: string;
  children?: ActionNode[];
  dueDate?: string;
  priority?: Priority;
  notes?: string;
};

export type StrategicPillar = {
  id: string;
  name: string;
  status: PillarStatus;
  reason: string;
  actions: ActionNode[];
};

export type CutItem = {
  id: string;
  activity: string;
  recommendation: CutRecommendation;
  reason: string;
};

export type ActionItem = {
  id: string;
  title: string;
  category: string;
  priority: Priority;
};

export type RiskItem = {
  id: string;
  title: string;
  severity: Severity;
  explanation: string;
};

export type StrategyPlan = {
  id: string;
  studentId: string;
  destination: string;
  currentStage: string;
  mainBottleneck: string;
  routeStatus: RouteStatus;
  alignmentScore: number;
  strategicPillars: StrategicPillar[];
  semesterPriorities: string[];
  cutList: CutItem[];
  nextSevenDays: ActionItem[];
  risks: RiskItem[];
  createdAt: string;
};

export type OpportunityCheck = {
  id: string;
  studentId: string;
  planId: string;
  opportunityText: string;
  fitScore: number;
  recommendation: Recommendation;
  reasoning: string;
  whyItFits: string[];
  tradeoffs: string[];
  conditions: string[];
  cutsRequired: string[];
  createdAt: string;
};

export type StrategyNode = {
  id: string;
  planId: string;
  parentNodeId?: string | null;
  kind: StrategyNodeKind;
  title: string;
  subtitle?: string;
  status: StrategyNodeStatus;
  scope: StrategyGraphScope;
  yearIndex?: number;
  term?: AcademicTerm;
  startDate?: string;
  endDate?: string;
  sortOrder: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type StrategyTask = {
  id: string;
  planId: string;
  studentId?: string | null;
  parentNodeId: string;
  parentNodeKind: StrategyTaskParentKind;
  parentTaskId?: string | null;
  title: string;
  recommendation: string;
  notes: string;
  priority: Priority;
  status: StrategyTaskStatus;
  dueDate: string;
  completedAt?: string | null;
  source: StrategyTaskSource;
  sourceActionId?: string | null;
  graphNodeId?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type OnboardingGraphLevel =
  | "destination"
  | "university_timeline"
  | "current_year"
  | "current_semester"
  | "task_seed"
  | "handoff";

export type UniversityGraphDraft = {
  profile: Partial<UniversityOnboardingProfile>;
  activeLevel: OnboardingGraphLevel;
  activeNodeId: string | null;
  nodes: StrategyNode[];
  tasks: StrategyTask[];
  insights: Partial<Record<OnboardingGraphLevel, string>>;
};
