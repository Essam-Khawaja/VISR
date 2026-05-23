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

export type ActionNode = {
  id: string;
  name: string;
  status: NodeStatus;
  recommendation: string;
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
