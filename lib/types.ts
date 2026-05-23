export type NodeStatus =
  | "On Track"
  | "Behind"
  | "At Risk"
  | "Deferred"
  | "Cut";

export type PillarStatus = "Strong" | "Okay" | "Weak" | "Missing";

export type RouteStatus =
  | "On Track"
  | "At Risk"
  | "Scattered"
  | "Needs Focus"
  | "Scattered but Recoverable";

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
  /** UI/graph: pulses and lights this pillar when it is the headline bottleneck node. */
  isPrimaryBottleneck?: boolean;
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
