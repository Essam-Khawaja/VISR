import type { z } from "zod";
import type { ProfileSchema } from "./validate";

type Profile = z.infer<typeof ProfileSchema>;

export function strategySystemPrompt(): string {
  return `You are Pathwise, an opinionated personal strategist for university students. You produce a structured strategy plan in JSON only — no prose, no markdown, no explanation outside the JSON.

Your voice: direct, opinionated, no hedging. Name the single biggest bottleneck. Tell the user what to cut, defer, keep, or double down on. Strategy, not a to-do list.

Return ONLY a single JSON object matching the StrategyPlan schema. Do not include backticks or any non-JSON characters.`;
}

export function strategyUserPrompt(profile: Profile, planId: string): string {
  return `Generate a StrategyPlan for this student.

planId: ${planId}
targetGoal: ${profile.targetGoal}
university: ${profile.university}
degree: ${profile.degree}
year: ${profile.year}
secondaryGoals: ${JSON.stringify(profile.secondaryGoals)}
currentCourses: ${JSON.stringify(profile.currentCourses)}
commitments: ${JSON.stringify(profile.commitments)}
workHoursPerWeek: ${profile.workHoursPerWeek}
constraints: ${JSON.stringify(profile.constraints)}
brainDump: """${profile.brainDump}"""

Rules:
- 3 to 5 strategic pillars, each with 1 to 4 actions.
- mainBottleneck must be specific (e.g. "No shipped project — GitHub is empty"), not vague.
- nextSevenDays: 4 to 6 concrete items the user can do in the next week.
- cutList: 4 to 6 items with explicit Cut / Defer / Keep / Double Down recommendations.
- risks: 3 items, with severity.
- alignmentScore: 0–100, based on how aligned current commitments are with the targetGoal.
- routeStatus: one of "On Track" | "At Risk" | "Scattered" | "Needs Focus".
- ids must be strings; use "${planId}-pillar-N" / "${planId}-action-N-M" / "cut-..." / "n7-..." / "risk-..." patterns.

Return JSON only:
{
  "id": "${planId}",
  "studentId": "<reuse planId>",
  "destination": "...",
  "currentStage": "...",
  "mainBottleneck": "...",
  "routeStatus": "...",
  "alignmentScore": 0,
  "strategicPillars": [...],
  "semesterPriorities": [...],
  "cutList": [...],
  "nextSevenDays": [...],
  "risks": [...],
  "createdAt": "${new Date().toISOString()}"
}`;
}

export function opportunitySystemPrompt(): string {
  return `You are Pathwise. You evaluate one opportunity against the user's current strategy plan and return a single JSON OpportunityCheck — no prose, no markdown.

Be opinionated. Name explicit tradeoffs, conditions, and what the user must cut to fit this in. Recommendations: "Say Yes" | "Say Yes With Conditions" | "Defer" | "Say No".`;
}

export function opportunityUserPrompt(
  planSummary: string,
  opportunityText: string,
  id: string,
  studentId: string,
  planId: string,
): string {
  return `Evaluate this opportunity against the user's current plan.

opportunityText: """${opportunityText}"""

planSummary:
${planSummary}

Return JSON only:
{
  "id": "${id}",
  "studentId": "${studentId}",
  "planId": "${planId}",
  "opportunityText": ${JSON.stringify(opportunityText)},
  "fitScore": 0,
  "recommendation": "Say Yes With Conditions",
  "reasoning": "...",
  "whyItFits": [...],
  "tradeoffs": [...],
  "conditions": [...],
  "cutsRequired": [...],
  "createdAt": "${new Date().toISOString()}"
}`;
}

export function onboardingInsightSystemPrompt(): string {
  return `You are Pathwise, a sharp personal strategist. Given a student's onboarding step data, return 1-2 sentences of direct advisor insight. No hedging. Reference their specific goal and data.

Return ONLY a JSON object: { "insight": "...", "bottleneckPreview": "..." (only for brain-dump step), "concernLabels": ["..."] (only for brain-dump step, max 3) }`;
}

export function onboardingInsightUserPrompt(
  step: string,
  profile: { targetGoal?: string; currentCourses?: string[]; commitments?: string[]; constraints?: string[]; workHoursPerWeek?: number; brainDump?: string },
): string {
  const parts = [`step: ${step}`, `targetGoal: ${profile.targetGoal ?? "not set"}`];
  if (profile.currentCourses?.length) parts.push(`courses (${profile.currentCourses.length}): ${profile.currentCourses.join(", ")}`);
  if (profile.commitments?.length) parts.push(`commitments (${profile.commitments.length}): ${profile.commitments.join(", ")}`);
  if (profile.constraints?.length) parts.push(`constraints: ${profile.constraints.join(", ")}`);
  if (profile.workHoursPerWeek) parts.push(`workHoursPerWeek: ${profile.workHoursPerWeek}`);
  if (profile.brainDump) parts.push(`brainDump: """${profile.brainDump}"""`);

  return `Generate a sharp 1-2 sentence insight for this onboarding step.\n\n${parts.join("\n")}\n\nFor brain-dump step: also return bottleneckPreview (specific bottleneck name) and concernLabels (up to 3 keyword concerns).`;
}

export function taskGenerationSystemPrompt(): string {
  return `You are Pathwise, a strategic academic advisor. Given a student's goal context and area of focus, generate 3-6 concrete, actionable tasks. Each task must have a "name" (short, action-oriented, max 60 chars) and a "recommendation" (1-2 sentences of practical guidance). Return ONLY a JSON object: { "tasks": [...] }. No other text.`;
}

export function taskGenerationUserPrompt(
  parentContext: string,
  nodeName: string,
  nodeDescription: string,
  userPrompt: string,
): string {
  return `Overall goal: ${parentContext}\nArea of focus: ${nodeName} — ${nodeDescription}\nStudent's request: ${userPrompt}\n\nGenerate concrete tasks to help with this request.`;
}

export function summarizePlan(plan: {
  destination: string;
  currentStage: string;
  mainBottleneck: string;
  routeStatus: string;
  alignmentScore: number;
  strategicPillars: Array<{ name: string; status: string; reason: string }>;
  cutList: Array<{ activity: string; recommendation: string }>;
}): string {
  return [
    `destination: ${plan.destination}`,
    `currentStage: ${plan.currentStage}`,
    `mainBottleneck: ${plan.mainBottleneck}`,
    `routeStatus: ${plan.routeStatus}`,
    `alignmentScore: ${plan.alignmentScore}`,
    `pillars:`,
    ...plan.strategicPillars.map(
      (p) => `  - ${p.name} [${p.status}]: ${p.reason}`,
    ),
    `cutList:`,
    ...plan.cutList.map(
      (c) => `  - ${c.recommendation}: ${c.activity}`,
    ),
  ].join("\n");
}
