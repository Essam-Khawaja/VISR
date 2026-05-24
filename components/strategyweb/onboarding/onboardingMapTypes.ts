import type {
  OnboardingGraphLevel,
  StrategyNode,
  StrategyTask,
} from "@/lib/strategyweb/types";

export type OnboardingNodeKind = "goal" | "course" | "commitment" | "concern";

export type OnboardingStepId =
  | "destination"
  | "university"
  | "year"
  | "semester"
  | "tasks"
  // Legacy aliases retained so older drafts keep typechecking:
  | "courses"
  | "commitments"
  | "constraints"
  | "brain-dump"
  | OnboardingGraphLevel;

export type OnboardingMapState = {
  goal: { label: string } | null;
  courses: { id: string; label: string }[];
  commitments: { id: string; label: string }[];
  concerns: { id: string; label: string }[];
  bottleneckPreview: string | null;
  insights: Partial<Record<OnboardingStepId, string>>;
  activeLevel: OnboardingGraphLevel;
  activeNodeId: string | null;
  nodes: StrategyNode[];
  tasks: StrategyTask[];
};

export const emptyMapState: OnboardingMapState = {
  goal: null,
  courses: [],
  commitments: [],
  concerns: [],
  bottleneckPreview: null,
  insights: {},
  activeLevel: "destination",
  activeNodeId: null,
  nodes: [],
  tasks: [],
};
