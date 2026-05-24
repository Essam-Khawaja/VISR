import { z } from "zod";

const LocalDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.");

export const AcademicTermSchema = z.enum([
  "Fall",
  "Winter",
  "Spring",
  "Summer",
]);

export const StrategyGraphScopeSchema = z.enum([
  "university",
  "year",
  "semester",
  "focus",
]);

export const StrategyNodeKindSchema = z.enum([
  "university_outcome",
  "academic_year",
  "semester",
  "course",
  "club",
  "work",
  "project",
  "research",
  "strategic_pillar",
  "commitment",
  "task",
]);

export const StrategyNodeStatusSchema = z.enum([
  "open",
  "doing",
  "done",
  "skipped",
  "at_risk",
]);

export const ProfileSchema = z.object({
  university: z.string().max(120).default(""),
  degree: z.string().max(120).default(""),
  year: z.string().max(40).default(""),
  targetGoal: z.string().min(3).max(280),
  secondaryGoals: z.array(z.string().max(200)).default([]),
  currentCourses: z.array(z.string().max(120)).default([]),
  commitments: z.array(z.string().max(200)).default([]),
  workHoursPerWeek: z.number().min(0).max(80).default(0),
  constraints: z.array(z.string().max(200)).default([]),
  brainDump: z.string().min(10).max(4000),
});

export const ActionNodeSchema: z.ZodType<import("./types").ActionNode> =
  z.object({
    id: z.string(),
    name: z.string().max(80),
    status: z.enum(["On Track", "Behind", "At Risk", "Deferred", "Cut"]),
    recommendation: z.string().max(400),
    children: z.lazy(() => z.array(ActionNodeSchema)).optional(),
    dueDate: z.string().optional(),
    priority: z.enum(["High", "Medium", "Low"]).optional(),
    notes: z.string().max(1000).optional(),
  });

export const TaskGenerationRequestSchema = z.object({
  nodeId: z.string(),
  nodeName: z.string(),
  nodeDescription: z.string(),
  parentContext: z.string(),
  userPrompt: z.string().min(1).max(500),
});

export const StrategicPillarSchema = z.object({
  id: z.string(),
  name: z.string().max(60),
  status: z.enum(["Strong", "Okay", "Weak", "Missing"]),
  reason: z.string().max(400),
  actions: z.array(ActionNodeSchema).min(1).max(6),
});

export const CutItemSchema = z.object({
  id: z.string(),
  activity: z.string().max(200),
  recommendation: z.enum(["Cut", "Defer", "Keep", "Double Down"]),
  reason: z.string().max(400),
});

export const ActionItemSchema = z.object({
  id: z.string(),
  title: z.string().max(200),
  category: z.string().max(60),
  priority: z.enum(["High", "Medium", "Low"]),
});

export const RiskItemSchema = z.object({
  id: z.string(),
  title: z.string().max(200),
  severity: z.enum(["High", "Medium", "Low"]),
  explanation: z.string().max(400),
});

export const StrategyPlanSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  destination: z.string().max(280),
  currentStage: z.string().max(60),
  mainBottleneck: z.string().max(280),
  routeStatus: z.enum(["On Track", "At Risk", "Scattered", "Needs Focus"]),
  alignmentScore: z.number().min(0).max(100),
  strategicPillars: z.array(StrategicPillarSchema).min(3).max(6),
  semesterPriorities: z.array(z.string().max(200)).min(1).max(8),
  cutList: z.array(CutItemSchema).min(1).max(10),
  nextSevenDays: z.array(ActionItemSchema).min(1).max(10),
  risks: z.array(RiskItemSchema).min(1).max(8),
  createdAt: z.string(),
});

export const OpportunityRequestSchema = z.object({
  planId: z.string(),
  plan: StrategyPlanSchema,
  opportunityText: z.string().min(10).max(2000),
});

export const OpportunityCheckSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  planId: z.string(),
  opportunityText: z.string(),
  fitScore: z.number().min(0).max(100),
  recommendation: z.enum([
    "Say Yes",
    "Say No",
    "Defer",
    "Say Yes With Conditions",
  ]),
  reasoning: z.string().max(800),
  whyItFits: z.array(z.string().max(280)).max(6),
  tradeoffs: z.array(z.string().max(280)).max(6),
  conditions: z.array(z.string().max(280)).max(6),
  cutsRequired: z.array(z.string().max(200)).max(8),
  createdAt: z.string(),
});

export const GenerateRequestSchema = z.object({
  profile: ProfileSchema,
});

export const StrategyTaskStatusSchema = z.enum([
  "open",
  "doing",
  "done",
  "skipped",
]);

export const StrategyTaskSourceSchema = z.enum([
  "strategy_map",
  "daily",
  "week",
  "ai",
  "opportunity",
  "generated_plan",
]);

export const StrategyTaskParentKindSchema = z.enum(["goal", "pillar", "task"]);

export const SemesterCommitmentSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  kind: z.enum(["club", "work", "research", "project", "family", "other"]),
  semesters: z.array(AcademicTermSchema).min(1).max(4),
  hoursPerWeek: z.number().min(0).max(80).optional(),
});

export const UniversityTaskSeedSchema = z.object({
  id: z.string(),
  parentNodeId: z.string().min(1),
  title: z.string().min(1).max(200),
  dueDate: LocalDateSchema,
  priority: z.enum(["High", "Medium", "Low"]),
});

export const UniversityOnboardingProfileSchema = z.object({
  endOfUniversityGoal: z.string().min(3).max(280),
  university: z.string().min(1).max(120),
  degree: z.string().min(1).max(120),
  expectedProgramLengthYears: z.number().int().min(1).max(8),
  expectedGraduationYear: z.number().int().min(2020).max(2100).optional(),
  totalCoursesRequired: z.number().int().min(1).max(120),
  coursesCompleted: z.number().int().min(0).max(120).optional(),
  currentYearIndex: z.number().int().min(1).max(8),
  currentSemester: AcademicTermSchema,
  typicalFallCourses: z.number().int().min(0).max(10).optional(),
  typicalWinterCourses: z.number().int().min(0).max(10).optional(),
  plansSpringSummerCourses: z.boolean().default(false),
  currentCourses: z.array(z.string().min(1).max(120)).default([]),
  recurringCommitments: z.array(SemesterCommitmentSchema).default([]),
  workHoursPerWeek: z.number().min(0).max(80).default(0),
  constraints: z.string().max(2000).default(""),
  bottleneckConcern: z.string().max(2000).default(""),
  taskSeeds: z.array(UniversityTaskSeedSchema).default([]),
});

export const StrategyNodeSchema = z.object({
  id: z.string(),
  planId: z.string(),
  parentNodeId: z.string().nullable().optional(),
  kind: StrategyNodeKindSchema,
  title: z.string().min(1).max(200),
  subtitle: z.string().max(280).optional(),
  status: StrategyNodeStatusSchema.default("open"),
  scope: StrategyGraphScopeSchema,
  yearIndex: z.number().int().optional(),
  term: AcademicTermSchema.optional(),
  startDate: LocalDateSchema.optional(),
  endDate: LocalDateSchema.optional(),
  sortOrder: z.number().int().default(0),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const StrategyNodeCreateSchema = z.object({
  planId: z.string().min(1),
  parentNodeId: z.string().nullable().optional(),
  kind: StrategyNodeKindSchema,
  title: z.string().min(1).max(200),
  subtitle: z.string().max(280).optional(),
  status: StrategyNodeStatusSchema.default("open"),
  scope: StrategyGraphScopeSchema,
  yearIndex: z.number().int().optional(),
  term: AcademicTermSchema.optional(),
  startDate: LocalDateSchema.optional(),
  endDate: LocalDateSchema.optional(),
  sortOrder: z.number().int().default(0),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const StrategyNodeUpdateSchema = StrategyNodeCreateSchema.omit({
  planId: true,
  kind: true,
  scope: true,
}).partial();

export const StrategyTaskSchema = z.object({
  id: z.string(),
  planId: z.string(),
  studentId: z.string().nullable().optional(),
  parentNodeId: z.string(),
  parentNodeKind: StrategyTaskParentKindSchema,
  parentTaskId: z.string().nullable().optional(),
  title: z.string().min(1).max(200),
  recommendation: z.string().max(800).default(""),
  notes: z.string().max(2000).default(""),
  priority: z.enum(["High", "Medium", "Low"]).default("Medium"),
  status: StrategyTaskStatusSchema.default("open"),
  dueDate: LocalDateSchema,
  completedAt: z.string().nullable().optional(),
  source: StrategyTaskSourceSchema.default("strategy_map"),
  sourceActionId: z.string().nullable().optional(),
  graphNodeId: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const StrategyTaskQuerySchema = z.object({
  planId: z.string().min(1),
  date: LocalDateSchema.optional(),
  dateFrom: LocalDateSchema.optional(),
  dateTo: LocalDateSchema.optional(),
  parentNodeId: z.string().optional(),
  parentTaskId: z.string().optional(),
});

export const StrategyTaskCreateSchema = z.object({
  planId: z.string().min(1),
  studentId: z.string().nullable().optional(),
  parentNodeId: z.string().min(1),
  parentNodeKind: StrategyTaskParentKindSchema,
  parentTaskId: z.string().nullable().optional(),
  title: z.string().min(1).max(200),
  recommendation: z.string().max(800).default(""),
  notes: z.string().max(2000).default(""),
  priority: z.enum(["High", "Medium", "Low"]).default("Medium"),
  dueDate: LocalDateSchema,
  source: StrategyTaskSourceSchema.default("strategy_map"),
  sourceActionId: z.string().nullable().optional(),
  graphNodeId: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
});

export const StrategyTaskUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  dueDate: LocalDateSchema.optional(),
  priority: z.enum(["High", "Medium", "Low"]).optional(),
  status: StrategyTaskStatusSchema.optional(),
  notes: z.string().max(2000).optional(),
  recommendation: z.string().max(800).optional(),
  graphNodeId: z.string().nullable().optional(),
});

export const UniversityGraphDraftSchema = z.object({
  profile: UniversityOnboardingProfileSchema.partial(),
  activeLevel: z.enum([
    "destination",
    "university_timeline",
    "current_year",
    "current_semester",
    "task_seed",
    "handoff",
  ]),
  activeNodeId: z.string().nullable(),
  nodes: z.array(StrategyNodeSchema),
  tasks: z.array(StrategyTaskSchema),
  insights: z.record(z.string(), z.string()).default({}),
});

export const OnboardingInsightRequestSchema = z.object({
  step: z.enum(["destination", "courses", "commitments", "constraints", "brain-dump"]),
  profile: z.object({
    targetGoal: z.string().max(280).default(""),
    university: z.string().max(120).default(""),
    degree: z.string().max(120).default(""),
    year: z.string().max(40).default(""),
    currentCourses: z.array(z.string().max(120)).default([]),
    commitments: z.array(z.string().max(200)).default([]),
    workHoursPerWeek: z.number().min(0).max(80).default(0),
    constraints: z.array(z.string().max(200)).default([]),
    brainDump: z.string().max(4000).default(""),
  }),
  map: z.object({
    goal: z.object({ label: z.string() }).nullable().default(null),
    courses: z.array(z.object({ id: z.string(), label: z.string() })).default([]),
    commitments: z.array(z.object({ id: z.string(), label: z.string() })).default([]),
  }).optional(),
});
