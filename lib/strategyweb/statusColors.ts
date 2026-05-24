import type {
  CutRecommendation,
  NodeStatus,
  PillarStatus,
  Priority,
  Recommendation,
  RouteStatus,
  Severity,
} from "./types";

export const pillarStatusColor: Record<PillarStatus, string> = {
  Strong: "var(--success)",
  Okay: "var(--warning)",
  Weak: "var(--danger)",
  Missing: "var(--danger)",
};

export const nodeStatusColor: Record<NodeStatus, string> = {
  "On Track": "var(--success)",
  Behind: "var(--warning)",
  "At Risk": "var(--danger)",
  Deferred: "var(--muted)",
  Cut: "var(--muted)",
};

export const cutRecommendationColor: Record<CutRecommendation, string> = {
  Cut: "var(--danger)",
  Defer: "var(--warning)",
  Keep: "var(--text-secondary)",
  "Double Down": "var(--success)",
};

export const routeStatusColor: Record<RouteStatus, string> = {
  "On Track": "var(--success)",
  "At Risk": "var(--danger)",
  Scattered: "var(--warning)",
  "Needs Focus": "var(--warning)",
};

export const recommendationColor: Record<Recommendation, string> = {
  "Say Yes": "var(--success)",
  "Say No": "var(--danger)",
  Defer: "var(--warning)",
  "Say Yes With Conditions": "var(--accent)",
};

export const priorityColor: Record<Priority, string> = {
  High: "var(--danger)",
  Medium: "var(--warning)",
  Low: "var(--text-secondary)",
};

export const severityColor: Record<Severity, string> = {
  High: "var(--danger)",
  Medium: "var(--warning)",
  Low: "var(--text-secondary)",
};
