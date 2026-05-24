/**
 * lib/strategyweb/demoData.ts
 *
 * Aggregator export used by API routes and the demo dashboard. Combines
 * the static fixture plan (`fixture.ts`) with a hand-written demo student
 * profile so the GET /api/strategyweb/plan/[planId] route can return a
 * complete payload for the canonical demo id.
 */
import type { StudentProfile } from "./types";
import {
  DEMO_PLAN_ID,
  fixtureOpportunity,
  fixturePlan,
} from "./fixture";

export { DEMO_PLAN_ID };

export const demoStudentProfile: StudentProfile = {
  id: fixturePlan.studentId,
  university: "University of Calgary",
  degree: "BSc Computer Science",
  year: "Second year",
  targetGoal: fixturePlan.destination,
  secondaryGoals: [],
  currentCourses: [
    "Algorithms",
    "Databases",
    "Three additional CS and university courses",
  ],
  commitments: [
    "12 hour/week part-time job",
    "Current student club role",
    "Two unfinished side projects",
    "Networking events",
    "Considering research outreach",
    "Considering another club",
  ],
  workHoursPerWeek: 12,
  constraints: [
    "Five-course semester",
    "Part-time work schedule",
    "Needs a narrow strategy before adding commitments",
  ],
  brainDump:
    "I am a second-year CS student trying to land a software engineering internship. I am taking five courses including algorithms and databases, working 12 hours a week, helping run a student club, thinking of joining another club, working on two side projects neither of which is finished, going to networking events, and considering research outreach. My GitHub is basically empty and I have not started LeetCode. I feel scattered and behind.",
  createdAt: fixturePlan.createdAt,
};

export const demoStrategyPlan = fixturePlan;
export const demoOpportunityCheck = fixtureOpportunity;
