/**
 * lib/strategyweb/fixture.ts
 *
 * Static demo plan and opportunity check used by `/strategyweb/dashboard/
 * demo-cs-student-001` and the landing page CTA. The plan describes a
 * canonical second-year CS student aiming for a software engineering
 * internship: bottleneck "no shipped project", five strategic pillars,
 * cuts, risks, and a next-seven-days route. The opportunity check answers
 * "Should I join the robotics club?" with conditions and required cuts.
 *
 * The demo path bypasses Supabase entirely so judging works with no env
 * variables configured.
 */
import type { OpportunityCheck, StrategyPlan } from "./types";
import { DEMO_PLAN_ID } from "@/lib/shared/env";

export { DEMO_PLAN_ID };

export const fixturePlan: StrategyPlan = {
  id: DEMO_PLAN_ID,
  studentId: "demo-student-001",
  destination: "Software Engineering Internship",
  currentStage: "Skill Signal",
  mainBottleneck: "No shipped project - GitHub is empty",
  routeStatus: "Scattered",
  alignmentScore: 64,
  strategicPillars: [
    {
      id: "pillar-skill",
      name: "Skill Signal",
      status: "Weak",
      reason:
        "GitHub is empty and no project is shipped. Recruiters have nothing to evaluate.",
      actions: [
        {
          id: "action-portfolio",
          name: "Portfolio Project",
          status: "At Risk",
          recommendation:
            "Pick one project and ship it. A finished simple project beats two unfinished complex ones.",
        },
        {
          id: "action-github",
          name: "GitHub Activity",
          status: "Behind",
          recommendation:
            "Push daily. Even small commits. An empty GitHub is a red flag.",
        },
        {
          id: "action-resume",
          name: "Resume",
          status: "Behind",
          recommendation:
            "Resume needs a shipped project before it is worth sending anywhere.",
        },
      ],
    },
    {
      id: "pillar-interview",
      name: "Interview Readiness",
      status: "Missing",
      reason:
        "LeetCode not started. No mock interviews. This will become a blocker in 6 weeks.",
      actions: [
        {
          id: "action-dsa",
          name: "DSA Practice",
          status: "At Risk",
          recommendation:
            "Start with 6 easy LeetCode problems this week. Build the habit before the volume.",
        },
        {
          id: "action-mock",
          name: "Mock Interviews",
          status: "Deferred",
          recommendation:
            "Defer until DSA foundation is 4 weeks in. Premature mock interviews build bad habits.",
        },
      ],
    },
    {
      id: "pillar-recruiting",
      name: "Recruiting",
      status: "Okay",
      reason:
        "Applications started but low volume. Career fair attended which is good signal.",
      actions: [
        {
          id: "action-apps",
          name: "Applications",
          status: "Behind",
          recommendation:
            "Target 5 applications per week minimum. Volume matters at this stage.",
        },
        {
          id: "action-careerfair",
          name: "Career Fair",
          status: "On Track",
          recommendation: "Keep attending. This is already working.",
        },
      ],
    },
    {
      id: "pillar-network",
      name: "Network",
      status: "Okay",
      reason:
        "Attending events but not converting to meaningful connections or referrals.",
      actions: [
        {
          id: "action-events",
          name: "Tech Events",
          status: "On Track",
          recommendation:
            "Keep attending, but start asking for coffee chats after.",
        },
        {
          id: "action-referrals",
          name: "Referrals",
          status: "Deferred",
          recommendation:
            "Message 2 upper-year students this week. A referral is worth 20 cold applications.",
        },
      ],
    },
    {
      id: "pillar-academics",
      name: "Academics",
      status: "Strong",
      reason:
        "GPA is strong and courses are relevant. This pillar is not your bottleneck.",
      actions: [
        {
          id: "action-courses",
          name: "Relevant Courses",
          status: "On Track",
          recommendation:
            "Algorithms and databases are directly relevant. Keep going.",
        },
        {
          id: "action-gpa",
          name: "GPA Risk",
          status: "On Track",
          recommendation:
            "No action needed. GPA is not your bottleneck. Do not over-invest here.",
        },
      ],
    },
  ],
  semesterPriorities: [
    "Ship one complete portfolio project",
    "Establish daily LeetCode habit (6 problems/week minimum)",
    "Send 5 internship applications per week",
    "Message 2 upper-year students for coffee chats",
    "Cap all non-goal activities at 3 hours/week",
  ],
  cutList: [
    {
      id: "cut-1",
      activity: "Joining another general club",
      recommendation: "Cut",
      reason:
        "You are already scattered. A general club adds zero signal to a software internship application.",
    },
    {
      id: "cut-2",
      activity: "Pursuing research this semester",
      recommendation: "Defer",
      reason:
        "Research is a strong long-term move but not while your GitHub is empty. Revisit after you ship.",
    },
    {
      id: "cut-3",
      activity: "Current club role",
      recommendation: "Keep",
      reason:
        "Leadership signal is valuable. Keep it, but hard cap at 3 hours per week.",
    },
    {
      id: "cut-4",
      activity: "Second side project",
      recommendation: "Cut",
      reason:
        "Two unfinished projects are worse than one finished one. Cut it now and finish the first.",
    },
    {
      id: "cut-5",
      activity: "One portfolio project",
      recommendation: "Double Down",
      reason:
        "This is your entire bottleneck. Every hour you can find goes here until it ships.",
    },
  ],
  nextSevenDays: [
    {
      id: "day-1",
      title: "Pick one project and commit to finishing it this month",
      category: "Skill Signal",
      priority: "High",
    },
    {
      id: "day-2",
      title: "Push current project progress to GitHub today",
      category: "Skill Signal",
      priority: "High",
    },
    {
      id: "day-3",
      title: "Write a README that clearly explains what the project does",
      category: "Skill Signal",
      priority: "High",
    },
    {
      id: "day-4",
      title: "Complete 6 LeetCode easy problems - build the habit",
      category: "Interview Readiness",
      priority: "High",
    },
    {
      id: "day-5",
      title: "Apply to 5 internships with your current resume",
      category: "Recruiting",
      priority: "Medium",
    },
    {
      id: "day-6",
      title:
        "Message 2 upper-year CS students asking for a 20-minute coffee chat",
      category: "Network",
      priority: "Medium",
    },
  ],
  risks: [
    {
      id: "risk-1",
      title: "Saying yes to more commitments before shipping",
      severity: "High",
      explanation:
        "Every new commitment delays the portfolio project. Your bottleneck gets worse, not better.",
    },
    {
      id: "risk-2",
      title: "Recruiting season closes before GitHub is ready",
      severity: "High",
      explanation:
        "Most internship applications close in October-November. An empty GitHub in September is a crisis.",
    },
    {
      id: "risk-3",
      title: "LeetCode gap becomes an interview blocker",
      severity: "Medium",
      explanation:
        "If you land an interview without DSA practice, you will fail the technical screen. Start now.",
    },
  ],
  createdAt: "2026-05-23T00:00:00.000Z",
};

export const fixtureOpportunity: OpportunityCheck = {
  id: "opportunity-demo-001",
  studentId: fixturePlan.studentId,
  planId: fixturePlan.id,
  opportunityText: "Should I join the robotics club?",
  fitScore: 78,
  recommendation: "Say Yes With Conditions",
  reasoning:
    "Robotics is a strong adjacent signal to a software internship, but only if it does not eat the hours your portfolio project needs. Take it with a hard cap, not as an open-ended commitment.",
  whyItFits: [
    "Hardware-adjacent software work is a credible portfolio direction.",
    "You will meet upper-year CS students who can refer you.",
    "Demonstrates initiative beyond coursework.",
  ],
  tradeoffs: [
    "May delay portfolio project by 2 weeks if uncapped.",
    "Robotics meetings often run long and unscheduled.",
  ],
  conditions: [
    "Cap participation at 4 hours per week.",
    "Pause the second side project before joining.",
  ],
  cutsRequired: [
    "Second side project",
    "Any additional general club commitments",
  ],
  createdAt: "2026-05-23T00:00:00.000Z",
};
