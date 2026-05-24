import { NextResponse } from "next/server";
import { callGroqJson } from "@/lib/2/groq";
import { buildDeterministicPlan } from "@/lib/2/deterministicPlan";
import {
  createSupabaseAnonClient,
  createSupabaseServiceClient,
} from "@/lib/shared/supabase";
import {
  strategySystemPrompt,
  strategyUserPrompt,
} from "@/lib/2/prompts";
import {
  GenerateRequestSchema,
  StrategyPlanSchema,
} from "@/lib/2/validate";
import type { StrategyPlan } from "@/lib/2/types";
import {
  materializeStrategyTasks,
  taskToRow,
} from "@/lib/2/taskStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function randomUUID(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // RFC4122-ish fallback for older runtimes
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function persistToSupabase(
  profile: Record<string, unknown>,
  plan: StrategyPlan,
  studentId: string,
): Promise<void> {
  // Prefer the service role client when configured (bypasses RLS in prod);
  // otherwise fall back to the anon client (RLS is permissive in the demo).
  const sb = createSupabaseServiceClient() ?? createSupabaseAnonClient();
  if (!sb) return;

  const asArray = (v: unknown): unknown[] =>
    Array.isArray(v)
      ? v
      : typeof v === "string" && v.trim().length
        ? [v]
        : [];

  try {
    await sb.from("student_profiles").upsert({
      id: studentId,
      degree: String(profile.degree ?? ""),
      year: String(profile.year ?? ""),
      university: String(profile.university ?? ""),
      target_goal: String(profile.targetGoal ?? ""),
      courses: asArray(profile.courses),
      commitments: asArray(profile.commitments),
      work_hours_per_week: Number(profile.workHoursPerWeek ?? 0),
      constraints: asArray(profile.constraints),
      brain_dump: String(profile.brainDump ?? ""),
    });

    await sb.from("strategy_plans").upsert({
      id: plan.id,
      student_id: studentId,
      plan,
      state: {},
    });

    const tasks = materializeStrategyTasks(plan);
    if (tasks.length > 0) {
      await sb
        .from("strategy_tasks")
        .upsert(tasks.map(taskToRow), { onConflict: "id" });
    }
  } catch {
    // Non-critical -- localStorage stays in sync as the demo fallback
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
  const planId = randomUUID();
  const studentId = randomUUID();

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

  const profileFields = profile as Record<string, unknown>;
  const endGoal = String(
    profileFields.endOfUniversityGoal ?? profile.targetGoal ?? "",
  ).trim();
  if (endGoal) {
    plan = { ...plan, destination: endGoal };
  }

  await persistToSupabase(profile as Record<string, unknown>, plan, studentId);

  return NextResponse.json({ ok: true, planId, plan });
}
