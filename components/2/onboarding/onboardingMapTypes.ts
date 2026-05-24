export type OnboardingNodeKind = "goal" | "course" | "commitment" | "concern";

export type OnboardingStepId =
  | "destination"
  | "courses"
  | "commitments"
  | "constraints"
  | "brain-dump";

export type OnboardingMapState = {
  goal: { label: string } | null;
  courses: { id: string; label: string }[];
  commitments: { id: string; label: string }[];
  concerns: { id: string; label: string }[];
  bottleneckPreview: string | null;
  insights: Partial<Record<OnboardingStepId, string>>;
};

export const emptyMapState: OnboardingMapState = {
  goal: null,
  courses: [],
  commitments: [],
  concerns: [],
  bottleneckPreview: null,
  insights: {},
};
