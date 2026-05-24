import type { OnboardingMapState } from "@/components/2/onboarding/onboardingMapTypes";
import type {
  AcademicTerm,
  StrategyNode,
  StrategyTask,
  UniversityOnboardingProfile,
} from "@/lib/2/types";
import type { LayoutEdge, LayoutNode } from "./graphTypes";

const GOAL_NODE_RADIUS = 0.42;
const PILLAR_NODE_RADIUS = 0.28;
const TASK_NODE_RADIUS = 0.16;
const RING_RADIUS = 3.15;
const OUTER_RING_RADIUS = 5;

const PLAN_ID = "onboarding-preview";
const GOAL_PASTEL = "#AABAAE";
const YEAR_PASTEL = "#8A9A5B";
const SEMESTER_PASTELS = ["#933B5B", "#9F9679", "#B5728A", "#C4A882"];
const COURSE_PASTEL = "#AABAAE";
const COMMITMENT_PASTEL = "#B5728A";
const TASK_PASTEL = "#933B5B";
const PILLAR_PASTELS = ["#933B5B", "#8A9A5B", "#9F9679", "#C4A882"];
const TERMS: AcademicTerm[] = ["Fall", "Winter", "Spring", "Summer"];

function nowIso(): string {
  return new Date().toISOString();
}

function node(
  input: Omit<
    StrategyNode,
    "planId" | "status" | "sortOrder" | "metadata" | "createdAt" | "updatedAt"
  > &
    Partial<
      Pick<
        StrategyNode,
        "status" | "sortOrder" | "metadata" | "createdAt" | "updatedAt"
      >
    >,
): StrategyNode {
  const now = nowIso();
  return {
    ...input,
    planId: PLAN_ID,
    status: input.status ?? "open",
    sortOrder: input.sortOrder ?? 0,
    metadata: input.metadata ?? {},
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };
}

export function estimateFallWinterCourseLoad(
  profile: Partial<UniversityOnboardingProfile>,
): number {
  const total = Math.max(1, profile.totalCoursesRequired ?? 40);
  const completed = Math.max(0, profile.coursesCompleted ?? 0);
  const length = Math.max(1, profile.expectedProgramLengthYears ?? 4);
  const currentYear = Math.max(1, profile.currentYearIndex ?? 1);
  const remainingCourses = Math.max(0, total - completed);
  const remainingTerms = Math.max(1, (length - currentYear + 1) * 2);
  return Math.max(1, Math.ceil(remainingCourses / remainingTerms));
}

export function buildYearNodes(
  profile: Partial<UniversityOnboardingProfile>,
): StrategyNode[] {
  const years = Math.max(1, profile.expectedProgramLengthYears ?? 4);
  return Array.from({ length: years }, (_, i) =>
    node({
      id: `onboarding-year-${i + 1}`,
      parentNodeId: "onboarding-outcome",
      kind: "academic_year",
      title: `Year ${i + 1}`,
      subtitle:
        i + 1 === profile.currentYearIndex ? "Current year" : "Academic year",
      status: i + 1 === profile.currentYearIndex ? "doing" : "open",
      scope: "university",
      yearIndex: i + 1,
      sortOrder: i,
    }),
  );
}

export function buildSemesterNodes(
  profile: Partial<UniversityOnboardingProfile>,
  yearNodeId = `onboarding-year-${profile.currentYearIndex ?? 1}`,
): StrategyNode[] {
  const estimatedLoad = estimateFallWinterCourseLoad(profile);
  return TERMS.map((term, i) =>
    node({
      id: `onboarding-semester-${term.toLowerCase()}`,
      parentNodeId: yearNodeId,
      kind: "semester",
      title: term,
      subtitle:
        term === "Fall" || term === "Winter"
          ? `${estimatedLoad} estimated courses`
          : profile.plansSpringSummerCourses
            ? "Optional course term"
            : "Protected lighter term",
      status: term === profile.currentSemester ? "doing" : "open",
      scope: "year",
      yearIndex: profile.currentYearIndex,
      term,
      sortOrder: i,
      metadata: {
        estimatedCourses:
          term === "Fall" || term === "Winter"
            ? estimatedLoad
            : profile.plansSpringSummerCourses
              ? 1
              : 0,
      },
    }),
  );
}

export function buildDeterministicPillars(
  profile: Partial<UniversityOnboardingProfile>,
  parentNodeId: string,
): StrategyNode[] {
  const goal = (profile.endOfUniversityGoal ?? "").toLowerCase();
  const softwareGoal =
    goal.includes("software") ||
    goal.includes("intern") ||
    goal.includes("engineer") ||
    goal.includes("developer");
  const titles = softwareGoal
    ? ["Portfolio Signal", "Interview Readiness", "Recruiting", "Capacity"]
    : ["Academic Foundation", "Proof Of Work", "Network", "Capacity"];
  return titles.map((title, i) =>
    node({
      id: `onboarding-pillar-${i + 1}`,
      parentNodeId,
      kind: "strategic_pillar",
      title,
      subtitle: "Strategic focus for this semester",
      status: i === titles.length - 1 ? "at_risk" : "open",
      scope: "semester",
      sortOrder: 100 + i,
    }),
  );
}

export function buildCurrentSemesterNodes(
  profile: Partial<UniversityOnboardingProfile>,
  semesterNodeId = `onboarding-semester-${(profile.currentSemester ?? "Fall").toLowerCase()}`,
): StrategyNode[] {
  const courses = (profile.currentCourses ?? []).map((course, i) =>
    node({
      id: `onboarding-course-${i}`,
      parentNodeId: semesterNodeId,
      kind: "course",
      title: course,
      subtitle: "Current course",
      status: "open",
      scope: "semester",
      sortOrder: i,
    }),
  );
  const commitments = (profile.recurringCommitments ?? [])
    .filter((commitment) =>
      commitment.semesters.includes(profile.currentSemester ?? "Fall"),
    )
    .map((commitment, i) =>
      node({
        id: `onboarding-commitment-${commitment.id}`,
        parentNodeId: semesterNodeId,
        kind:
          commitment.kind === "club" ||
          commitment.kind === "work" ||
          commitment.kind === "research" ||
          commitment.kind === "project"
            ? commitment.kind
            : "commitment",
        title: commitment.title,
        subtitle: commitment.hoursPerWeek
          ? `${commitment.hoursPerWeek} hours/week`
          : "Recurring commitment",
        status: "open",
        scope: "semester",
        sortOrder: 40 + i,
      }),
    );
  return [
    ...courses,
    ...commitments,
    ...buildDeterministicPillars(profile, semesterNodeId),
  ];
}

function nodeToLayout(
  strategyNode: StrategyNode,
  position: [number, number, number],
  index: number,
  isCenter: boolean,
): LayoutNode {
  const pastel =
    strategyNode.kind === "academic_year"
      ? YEAR_PASTEL
      : strategyNode.kind === "semester"
        ? SEMESTER_PASTELS[index % SEMESTER_PASTELS.length]
        : strategyNode.kind === "course"
          ? COURSE_PASTEL
          : strategyNode.kind === "task"
            ? TASK_PASTEL
            : strategyNode.kind === "strategic_pillar"
              ? PILLAR_PASTELS[index % PILLAR_PASTELS.length]
              : COMMITMENT_PASTEL;
  return {
    id: strategyNode.id,
    kind: isCenter ? "goal" : "pillar",
    name: strategyNode.title,
    status: strategyNode.status === "at_risk" ? "Weak" : "Okay",
    recommendation: strategyNode.subtitle ?? "",
    color: "var(--accent)",
    isBottleneck: strategyNode.status === "at_risk",
    position,
    radius: isCenter ? GOAL_NODE_RADIUS : PILLAR_NODE_RADIUS,
    parentId: strategyNode.parentNodeId ?? null,
    pastelColor: isCenter ? GOAL_PASTEL : pastel,
    progressPercent: strategyNode.status === "done" ? 1 : 0,
    actionCount: 0,
  };
}

function taskToLayout(
  task: StrategyTask,
  position: [number, number, number],
): LayoutNode {
  return {
    id: task.id,
    kind: "action",
    name: task.title,
    status: task.status === "done" ? "On Track" : "Behind",
    recommendation: task.recommendation || `Due ${task.dueDate}`,
    color: "var(--accent)",
    isBottleneck: task.priority === "High",
    position,
    radius: TASK_NODE_RADIUS,
    parentId: task.parentNodeId,
    pastelColor: task.status === "done" ? "#8A9A5B" : TASK_PASTEL,
    progressPercent: task.status === "done" ? 1 : 0,
    actionCount: 0,
  };
}

function radialLayout(
  center: StrategyNode,
  children: StrategyNode[],
  tasks: StrategyTask[],
): { nodes: LayoutNode[]; edges: LayoutEdge[] } {
  return buildRadialLayoutFromCenter(center, children, tasks);
}

/** Shared semester/year radial layout (onboarding + dashboard preview). */
export function buildRadialLayoutFromCenter(
  center: StrategyNode,
  children: StrategyNode[],
  tasks: StrategyTask[],
): { nodes: LayoutNode[]; edges: LayoutEdge[] } {
  const centerPos: [number, number, number] = [0, 0, 0];
  const nodes: LayoutNode[] = [nodeToLayout(center, centerPos, 0, true)];
  const edges: LayoutEdge[] = [];
  const orbitItems = [
    ...children.map((child) => ({ type: "node" as const, item: child })),
    ...tasks.map((task) => ({ type: "task" as const, item: task })),
  ];
  orbitItems.forEach((entry, i) => {
    const angle = (i / Math.max(orbitItems.length, 1)) * Math.PI * 2 - Math.PI / 2;
    const radius = orbitItems.length > 6 ? OUTER_RING_RADIUS : RING_RADIUS;
    const pos: [number, number, number] = [
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      0,
    ];
    const layoutNode =
      entry.type === "node"
        ? nodeToLayout(entry.item, pos, i, false)
        : taskToLayout(entry.item, pos);
    nodes.push(layoutNode);
    edges.push({
      id: `onboarding-edge-${center.id}-${layoutNode.id}`,
      from: center.id,
      to: layoutNode.id,
      kind: "goal-pillar",
      parentPillarId: layoutNode.id,
      points: [centerPos, pos],
    });
  });
  return { nodes, edges };
}

function timelineLayout(nodes: StrategyNode[]): {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
} {
  const root = nodes.find((n) => n.kind === "university_outcome");
  const years = nodes.filter((n) => n.kind === "academic_year");
  if (!root) return { nodes: [], edges: [] };
  const all = [root, ...years];
  const spacing = 2.35;
  const start = -((all.length - 1) * spacing) / 2;
  const layoutNodes = all.map((item, i) =>
    nodeToLayout(item, [start + i * spacing, 0, 0], i, i === 0),
  );
  const edges: LayoutEdge[] = [];
  for (let i = 0; i < layoutNodes.length - 1; i++) {
    edges.push({
      id: `onboarding-edge-${layoutNodes[i].id}-${layoutNodes[i + 1].id}`,
      from: layoutNodes[i].id,
      to: layoutNodes[i + 1].id,
      kind: "goal-pillar",
      parentPillarId: layoutNodes[i + 1].id,
      points: [layoutNodes[i].position, layoutNodes[i + 1].position],
    });
  }
  return { nodes: layoutNodes, edges };
}

function legacyNodes(mapState: OnboardingMapState): StrategyNode[] {
  if (!mapState.goal) return [];
  const root = node({
    id: "onboarding-outcome",
    parentNodeId: null,
    kind: "university_outcome",
    title: mapState.goal.label,
    scope: "university",
  });
  const courses = mapState.courses.map((course, i) =>
    node({
      id: `onboarding-course-${course.id}`,
      parentNodeId: root.id,
      kind: "course",
      title: course.label,
      scope: "semester",
      sortOrder: i,
    }),
  );
  const commitments = mapState.commitments.map((commitment, i) =>
    node({
      id: `onboarding-commitment-${commitment.id}`,
      parentNodeId: root.id,
      kind: "commitment",
      title: commitment.label,
      scope: "semester",
      sortOrder: 30 + i,
    }),
  );
  const concerns = mapState.concerns.map((concern, i) =>
    node({
      id: `onboarding-concern-${concern.id}`,
      parentNodeId: root.id,
      kind: "commitment",
      title: concern.label,
      status: "at_risk",
      scope: "semester",
      sortOrder: 60 + i,
    }),
  );
  return [root, ...courses, ...commitments, ...concerns];
}

export function buildOnboardingLayout(mapState: OnboardingMapState): {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
} {
  const graphNodes = mapState.nodes.length > 0 ? mapState.nodes : legacyNodes(mapState);
  if (graphNodes.length === 0) return { nodes: [], edges: [] };
  if (mapState.activeLevel === "university_timeline") {
    return timelineLayout(graphNodes);
  }
  const center =
    graphNodes.find((node) => node.id === mapState.activeNodeId) ??
    graphNodes.find((node) => node.kind === "university_outcome") ??
    graphNodes[0];
  const childNodes = graphNodes.filter(
    (node) => (node.parentNodeId ?? null) === center.id,
  );
  const childTasks = mapState.tasks.filter(
    (task) => task.parentNodeId === center.id || task.parentTaskId === center.id,
  );
  return radialLayout(center, childNodes, childTasks);
}
