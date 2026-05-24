/**
 * lib/strategyweb/deterministicOnboardingInsight.ts
 *
 * Per-step insight strings used when Groq is unavailable. Each onboarding
 * step has a narrow, hand-tuned response that references the student's
 * inputs (goal, courses, brain dump) so the strip never feels generic.
 * For the brain-dump step, simple keyword matching extracts a likely
 * bottleneck (no shipped project, low GPA, scattered effort, etc.).
 */

import type { OnboardingStepId } from "@/components/strategyweb/onboarding/onboardingMapTypes";

type InsightProfile = {
  targetGoal?: string;
  currentCourses?: string[];
  commitments?: string[];
  constraints?: string[];
  workHoursPerWeek?: number;
  brainDump?: string;
};

type InsightResult = {
  insight: string;
  bottleneckPreview?: string;
  concernLabels?: string[];
};

const BOTTLENECK_KEYWORDS: Array<{ re: RegExp; bottleneck: string; concern: string }> = [
  { re: /\b(github|portfolio|project|ship)\b/i, bottleneck: "No shipped project - GitHub is empty", concern: "Empty portfolio" },
  { re: /\b(leetcode|interview|mock|dsa|algorithm)\b/i, bottleneck: "Interview prep not started", concern: "Interview readiness" },
  { re: /\b(resume|cv|application)\b/i, bottleneck: "Resume needs work before applications", concern: "Resume gaps" },
  { re: /\b(network|connect|mentor|referral)\b/i, bottleneck: "No professional network built yet", concern: "Networking" },
  { re: /\b(scatter|focus|overwhelm|busy|spread thin)\b/i, bottleneck: "Spread too thin across too many things", concern: "Over-committed" },
  { re: /\b(procrastinat|lazy|behind|late|deadline)\b/i, bottleneck: "Execution gap - plans exist but nothing ships", concern: "Execution gap" },
  { re: /\b(gpa|grade|fail|academic)\b/i, bottleneck: "Academic performance at risk", concern: "GPA concerns" },
  { re: /\b(money|financial|afford|pay|debt)\b/i, bottleneck: "Financial constraints limiting options", concern: "Financial pressure" },
];

export function buildDeterministicOnboardingInsight(
  step: OnboardingStepId,
  profile: InsightProfile,
): InsightResult {
  switch (step) {
    case "destination":
      return {
        insight: `Your destination is set: ${profile.targetGoal ?? "your goal"}. Everything we add next connects back here.`,
      };

    case "courses": {
      const count = profile.currentCourses?.length ?? 0;
      if (count === 0) {
        return { insight: "No courses added yet. Each class becomes a fixed node on your map." };
      }
      const loadNote = count >= 5
        ? "That's a heavy course load - it'll constrain how much else you can take on."
        : "These are your fixed academic load - they constrain how much else you can take on.";
      return { insight: `${count} course${count === 1 ? "" : "s"} on your map. ${loadNote}` };
    }

    case "commitments": {
      const count = profile.commitments?.length ?? 0;
      if (count === 0) {
        return { insight: "No extra commitments - that's a clean slate. Your time goes straight to the goal." };
      }
      return {
        insight: `${count} commitment${count === 1 ? "" : "s"} competing for the same hours as your goal. VISR will score them against your route.`,
      };
    }

    case "constraints": {
      const hours = profile.workHoursPerWeek ?? 0;
      const constraintCount = profile.constraints?.length ?? 0;
      const parts: string[] = [];
      if (hours > 0) parts.push(`${hours}h/week working`);
      if (constraintCount > 0) parts.push(`${constraintCount} constraint${constraintCount === 1 ? "" : "s"}`);
      if (parts.length === 0) {
        return { insight: "No constraints noted. We'll have more flexibility when building your route." };
      }
      return {
        insight: `Noted: ${parts.join(", ")}. We'll respect these when recommending cuts and your next 7 days.`,
      };
    }

    case "brain-dump": {
      const text = profile.brainDump ?? "";
      const concerns: string[] = [];
      let bottleneck: string | undefined;

      for (const { re, bottleneck: bn, concern } of BOTTLENECK_KEYWORDS) {
        if (re.test(text)) {
          if (!bottleneck) bottleneck = bn;
          concerns.push(concern);
          if (concerns.length >= 3) break;
        }
      }

      if (!bottleneck) {
        return {
          insight: "Reading your honest take. We'll use this to name your biggest bottleneck and shape the strategy.",
        };
      }

      return {
        insight: `Likely bottleneck: ${bottleneck}. The strategy will address this head-on.`,
        bottleneckPreview: bottleneck,
        concernLabels: concerns.slice(0, 3),
      };
    }

    default:
      return { insight: "VISR is building your strategy map." };
  }
}
