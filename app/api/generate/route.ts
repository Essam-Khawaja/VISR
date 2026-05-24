import { NextResponse } from "next/server";
import { callGroqJson } from "@/lib/groq";
import { buildDeterministicPlan } from "@/lib/deterministicPlan";
import { createSupabaseServiceClient } from "@/lib/supabase";
import {
  strategySystemPrompt,
  strategyUserPrompt,
} from "@/lib/prompts";
import {
  GenerateRequestSchema,
  StrategyPlanSchema,
} from "@/lib/validate";
import type { StrategyPlan } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function randomPlanId(): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().split("-")[0]
      : Math.random().toString(36).slice(2, 10);
  return `plan-${rnd}`;
}

async function persistToSupabase(
  profile: Record<string, unknown>,
  plan: StrategyPlan,
  studentId: string,
): Promise<void> {
  const sb = createSupabaseServiceClient();
  if (!sb) return;

  try {
    await sb.from("student_profiles").upsert({
      id: studentId,
      degree: profile.degree ?? "",
      year: profile.year ?? "",
      university: profile.university ?? "",
      target_goal: profile.targetGoal ?? "",
      courses: profile.courses ?? [],
      commitments: profile.commitments ?? [],
      work_hours_per_week: profile.workHoursPerWeek ?? 0,
      constraints: profile.constraints ?? "",
      brain_dump: profile.brainDump ?? "",
    });

    await sb.from("strategy_plans").upsert({
      id: plan.id,
      student_id: studentId,
      plan,
    });
  } catch {
    // Non-critical -- localStorage is the primary store
  }
}

export async function POST(req: Request) {
  let parsedBody: unknown;
  try {
    parsedBody = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }
  const parse = GenerateRequestSchema.safeParse(parsedBody);
  if (!parse.success) {
    return NextResponse.json(
      { ok: false, error: parse.error.issues[0]?.message ?? "Bad request" },
      { status: 400 },
    );
  }
  const { profile } = parse.data;
  const planId = randomPlanId();
  const studentId = planId.replace("plan-", "student-");

  const ai = await callGroqJson(
    strategySystemPrompt(),
    strategyUserPrompt(profile, planId),
    { temperature: 0.5, maxTokens: 2400 },
  );

  let plan: StrategyPlan;

  if (ai) {
    try {
      const raw: unknown = JSON.parse(ai);
      const result = StrategyPlanSchema.safeParse(raw);
      if (result.success) {
        plan = { ...result.data, id: planId, studentId };
      } else {
        plan = buildDeterministicPlan(profile, planId, studentId);
      }
    } catch {
      plan = buildDeterministicPlan(profile, planId, studentId);
    }
  } else {
    plan = buildDeterministicPlan(profile, planId, studentId);
  }

  await persistToSupabase(profile as Record<string, unknown>, plan, studentId);

  return NextResponse.json({ ok: true, planId, plan });
}
