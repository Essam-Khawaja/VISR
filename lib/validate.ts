import { z } from "zod";

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
