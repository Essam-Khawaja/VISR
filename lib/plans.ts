import type { StrategicPillar, StrategyPlan } from "@/lib/types";

/** PRD §9 demo scenario — pre-generated, cached (no AI). */
export const DEMO_PLAN_CS_STUDENT: StrategyPlan = {
  id: "plan-demo-cs-student",
  studentId: "student-demo-cs-student",
  destination: "Software Engineering Internship",
  currentStage: "Skill Signal",
  mainBottleneck: "No shipped project — GitHub is empty",
  routeStatus: "Scattered but Recoverable",
  alignmentScore: 64,
  strategicPillars: markBottleneckPillar(
    [
      {
        id: "pillar-portfolio",
        name: "Portfolio Signal",
        status: "Weak",
        reason:
          "Signals to recruiters are weakest here: there's no tangible proof of shipped work.",
        actions: [
          {
            id: "a1",
            name: "Pick one project and commit",
            status: "At Risk",
            recommendation:
              "Finish one credible project instead of juggling two unfinished ones.",
          },
          {
            id: "a2",
            name: "Push to GitHub today",
            status: "At Risk",
            recommendation:
              "Get code public today — empty GitHub collapses credibility.",
          },
          {
            id: "a3",
            name: "Write a real README",
            status: "Behind",
            recommendation:
              "Explain what it does, how to run it, and what you learned.",
          },
          {
            id: "a4",
            name: "Deploy publicly",
            status: "Behind",
            recommendation: "Deploy so it's one link away on your resume.",
          },
        ],
      },
      {
        id: "pillar-tech",
        name: "Technical Fundamentals",
        status: "Okay",
        reason: "Algorithms and databases are covered; LeetCode not started steadily.",
        actions: [],
      },
      {
        id: "pillar-apps",
        name: "Application Pipeline",
        status: "Okay",
        reason: "Resume drafts exist but need a sharper story tied to proof of work.",
        actions: [],
      },
      {
        id: "pillar-network",
        name: "Network & Presence",
        status: "Strong",
        reason: "Networking cadence exists; amplify with a credible portfolio anchor.",
        actions: [],
      },
      {
        id: "pillar-bandwidth",
        name: "Bandwidth Management",
        status: "Strong",
        reason: "You can protect focus once the portfolio bottleneck is relieved.",
        actions: [],
      },
    ],
    "Portfolio Signal",
  ),
  semesterPriorities: [
    "Ship one portfolio-grade project end-to-end",
    "Establish a repeatable LeetCode cadence matched to internship timelines",
    "Run a weekly application sprint with measurable output",
    "Cap optional commitments until the portfolio bottleneck clears",
  ],
  cutList: [
    {
      id: "c1",
      activity: "Joining another general club",
      recommendation: "Cut",
      reason:
        "It adds meetings without correcting the internship bottleneck: lack of shipped work.",
    },
    {
      id: "c2",
      activity: "Research outreach",
      recommendation: "Defer",
      reason:
        "Research is additive until you have a portfolio artifact recruiters can inspect.",
    },
    {
      id: "c3",
      activity: "Current club role",
      recommendation: "Keep",
      reason: "Keep it capped so it stays supportive, not distracting.",
    },
    {
      id: "c4",
      activity: "One complete shipped portfolio project",
      recommendation: "Double Down",
      reason:
        "This is the bottleneck removal lever — nothing else rivals its signal value.",
    },
  ],
  nextSevenDays: [
    {
      id: "n1",
      title: "Pick one project and commit to finishing it",
      category: "Portfolio",
      priority: "High",
    },
    {
      id: "n2",
      title: "Push current progress to GitHub today",
      category: "Portfolio",
      priority: "High",
    },
    {
      id: "n3",
      title: "Write a README that explains what the project does",
      category: "Portfolio",
      priority: "Medium",
    },
    {
      id: "n4",
      title: "Complete 6 LeetCode easy/medium problems",
      category: "Technical",
      priority: "Medium",
    },
    {
      id: "n5",
      title: "Apply to 5 internships with a tailored resume",
      category: "Pipeline",
      priority: "Medium",
    },
  ],
  risks: [
    {
      id: "r1",
      title: "Two half-finished projects, zero shipped artifact",
      severity: "High",
      explanation:
        "Splits focus and hides progress from recruiters — converge to one shippable line on your resume.",
    },
    {
      id: "r2",
      title: "Over-commitment erosion",
      severity: "Medium",
      explanation:
        "Networking and clubs compound unless bandwidth is guarded around the bottleneck.",
    },
  ],
  createdAt: new Date().toISOString(),
};

function markBottleneckPillar(
  pillars: StrategicPillar[],
  bottleneckName: string,
): StrategicPillar[] {
  return pillars.map((p) =>
    p.name === bottleneckName
      ? { ...p, isPrimaryBottleneck: true }
      : { ...p, isPrimaryBottleneck: false },
  );
}

export function getDemoPlan(planId: string): StrategyPlan | null {
  if (planId === "demo-cs-student-001") {
    return DEMO_PLAN_CS_STUDENT;
  }
  return null;
}
