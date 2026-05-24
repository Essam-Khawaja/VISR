import type {
  OpportunityCheck,
  Recommendation,
  StrategyPlan,
} from "./types";

type OpportunityKind = "club" | "research" | "internship" | "course" | "side-project" | "other";

const KIND_RE: Array<{ kind: OpportunityKind; re: RegExp }> = [
  { kind: "research", re: /\b(research|lab|pi|publish|paper)\b/i },
  { kind: "internship", re: /\b(internship|coop|co-op|placement|fellowship)\b/i },
  { kind: "club", re: /\b(club|society|chapter|exec|hackathon)\b/i },
  { kind: "course", re: /\b(course|class|elective|seminar|workshop)\b/i },
  { kind: "side-project", re: /\b(side project|build|app|startup|build a project)\b/i },
];

function classify(text: string): OpportunityKind {
  for (const { kind, re } of KIND_RE) if (re.test(text)) return kind;
  return "other";
}

function categoryAffinity(plan: StrategyPlan, text: string): number {
  // Higher if the opportunity mentions concepts close to current pillars / bottleneck.
  const lower = text.toLowerCase();
  let score = 0;
  for (const pillar of plan.strategicPillars) {
    if (lower.includes(pillar.name.toLowerCase())) score += 15;
  }
  if (lower.includes(plan.mainBottleneck.toLowerCase().slice(0, 20))) score += 10;
  return score;
}

function loadHoursEstimate(text: string): number {
  const m = text.match(/(\d{1,2})\s*(?:hours?|hrs?)/i);
  if (!m) return 6;
  return Math.max(1, Math.min(40, parseInt(m[1], 10)));
}

function pickRecommendation(
  kind: OpportunityKind,
  fitScore: number,
  hours: number,
  plan: StrategyPlan,
): Recommendation {
  const tight = plan.routeStatus === "Scattered" || plan.routeStatus === "At Risk";
  if (fitScore >= 78) {
    return tight && hours > 6 ? "Say Yes With Conditions" : "Say Yes";
  }
  if (fitScore >= 60) {
    return tight ? "Say Yes With Conditions" : "Say Yes With Conditions";
  }
  if (fitScore >= 45) return "Defer";
  return "Say No";
}

export function buildDeterministicOpportunity(
  plan: StrategyPlan,
  opportunityText: string,
  id: string,
): OpportunityCheck {
  const kind = classify(opportunityText);
  const affinity = categoryAffinity(plan, opportunityText);
  const hours = loadHoursEstimate(opportunityText);
  let fit = 50 + affinity - Math.max(0, hours - 8) * 2;
  if (kind === "internship") fit += 25;
  if (kind === "research") fit += 12;
  if (kind === "course") fit -= 6;
  if (kind === "club") fit -= 5;
  if (kind === "side-project") {
    // Side projects compete with the anchor unless they ARE the anchor
    const lower = opportunityText.toLowerCase();
    fit += lower.includes(plan.destination.toLowerCase().slice(0, 8)) ? 10 : -10;
  }
  fit = Math.max(15, Math.min(92, fit));

  const recommendation = pickRecommendation(kind, fit, hours, plan);

  const whyItFits: string[] = [];
  const tradeoffs: string[] = [];
  const conditions: string[] = [];
  const cutsRequired: string[] = [];

  if (kind === "internship") {
    whyItFits.push("An internship is high-density signal for your target.");
    whyItFits.push("Real-world reps compress your skill ramp.");
  }
  if (kind === "research") {
    whyItFits.push("Research is a credible differentiator most peers won't have.");
  }
  if (kind === "club") {
    whyItFits.push("Network and visibility, if you take a real role (not membership).");
  }
  if (kind === "course") {
    whyItFits.push("Builds a base, but doesn't replace shipped work.");
  }
  if (kind === "side-project") {
    whyItFits.push("Side projects only count when one of them is your anchor.");
  }

  if (hours > 8) {
    tradeoffs.push(`At ~${hours} hrs/week, this will compete directly with your anchor.`);
  } else {
    tradeoffs.push("Manageable on top of your current load.");
  }
  if (plan.routeStatus === "Scattered") {
    tradeoffs.push("You're already scattered - adding more without a hard cap will hurt.");
  }

  if (recommendation === "Say Yes With Conditions" || recommendation === "Defer") {
    conditions.push(`Cap participation at ${Math.min(6, hours)} hours per week.`);
    conditions.push("Set a 30-day checkpoint and drop if it's not delivering signal.");
    if (kind === "club") {
      conditions.push("Take a specific named role within 3 weeks, not just attend.");
    }
  }

  // Recommend cutting whatever the plan already flagged as cut-worthy
  for (const cut of plan.cutList) {
    if (cut.recommendation === "Cut" || cut.recommendation === "Defer") {
      cutsRequired.push(cut.activity);
    }
    if (cutsRequired.length >= 3) break;
  }

  const reasoning =
    recommendation === "Say Yes"
      ? `This is a strong fit. Your current bottleneck is ${plan.mainBottleneck.toLowerCase()}, and this opportunity advances it. Take it.`
      : recommendation === "Say Yes With Conditions"
        ? `Worth taking only with discipline. Your current bottleneck is ${plan.mainBottleneck.toLowerCase()}, and an uncapped commitment here will delay it. Cap it.`
        : recommendation === "Defer"
          ? `Strong move, wrong timing. Your current bottleneck is ${plan.mainBottleneck.toLowerCase()}. Come back to this once it's unstuck.`
          : `This pulls you away from the bottleneck. ${plan.mainBottleneck} is what matters this term - keep the focus.`;

  return {
    id,
    studentId: plan.studentId,
    planId: plan.id,
    opportunityText,
    fitScore: Math.round(fit),
    recommendation,
    reasoning,
    whyItFits,
    tradeoffs,
    conditions,
    cutsRequired,
    createdAt: new Date().toISOString(),
  };
}
