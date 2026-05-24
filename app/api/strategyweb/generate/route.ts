/**
 * POST /api/strategyweb/generate
 *
 * Generates a personalised StrategyPlan from an onboarding profile.
 *
 * Flow:
 *   1. Validate the request body with `GenerateRequestWithSeedsSchema`.
 *   2. Call Groq with a strict JSON-only prompt and a fast model.
 *   3. Parse + Zod-validate the response.
 *   4. If anything in step 2 or 3 fails (no API key, timeout, bad JSON, schema
 *      mismatch), fall back to `buildDeterministicPlan` so the demo never
 *      breaks in front of judges.
 *   5. Best-effort persist to Supabase (profile, plan, seed nodes, tasks).
 *      Failures here are logged but never surface as a 500: the client also
 *      writes to localStorage and merges on next read.
 *
 * Returns the plan plus seed nodes/tasks re-IDed to the new plan ID.
 */

import { NextResponse } from "next/server";
import { callGroqJson } from "@/lib/strategyweb/groq";
import { buildDeterministicPlan } from "@/lib/strategyweb/deterministicPlan";
import {
  createSupabaseAnonClient,
  createSupabaseServiceClient,
} from "@/lib/shared/supabase";
import {
  strategySystemPrompt,
  strategyUserPrompt,
} from "@/lib/strategyweb/prompts";
import {
  GenerateRequestWithSeedsSchema,
  StrategyPlanSchema,
} from "@/lib/strategyweb/validate";
import type {
  StrategyNode,
  StrategyPlan,
  StrategyTask,
} from "@/lib/strategyweb/types";
import {
  materializeStrategyTasks,
  taskToRow,
} from "@/lib/strategyweb/taskStore";
import { nodeToRow } from "@/lib/strategyweb/nodeStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function randomUUID(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
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
  reIdedSeedNodes: StrategyNode[],
  reIdedSeedTasks: StrategyTask[],
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
    const { error: profileError } = await sb.from("student_profiles").upsert({
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
    if (profileError && process.env.NODE_ENV !== "production") {
      console.warn("[generate] student_profiles upsert error", profileError);
    }

    const { error: planError } = await sb.from("strategy_plans").upsert({
      id: plan.id,
      student_id: studentId,
      plan,
      state: {},
    });
    if (planError && process.env.NODE_ENV !== "production") {
      console.warn("[generate] strategy_plans upsert error", planError);
    }

    if (reIdedSeedNodes.length > 0) {
      const { error: nodeError } = await sb
        .from("strategy_nodes")
        .upsert(reIdedSeedNodes.map(nodeToRow), { onConflict: "id" });
      if (nodeError && process.env.NODE_ENV !== "production") {
        console.warn("[generate] strategy_nodes upsert error", nodeError);
      }
    }

    const aiTasks = materializeStrategyTasks(plan);
    const allTasks = [...reIdedSeedTasks, ...aiTasks];
    if (allTasks.length > 0) {
      const { error: taskError } = await sb
        .from("strategy_tasks")
        .upsert(allTasks.map(taskToRow), { onConflict: "id" });
      if (taskError && process.env.NODE_ENV !== "production") {
        console.warn("[generate] strategy_tasks upsert error", taskError);
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[generate] persistToSupabase threw", err);
    }
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
  const parse = GenerateRequestWithSeedsSchema.safeParse(parsedBody);
  if (!parse.success) {
    return NextResponse.json(
      { ok: false, error: parse.error.issues[0]?.message ?? "Bad request" },
      { status: 400 },
    );
  }
  const { profile: rawProfile, seedNodes = [], seedTasks = [] } = parse.data;

  // The onboarding form posts `endOfUniversityGoal` and a `bottleneckConcern`
  // mapped to `brainDump`. Ensure both legacy fields are populated so the
  // deterministic plan and the AI prompt always have non-empty inputs.
  const extras = rawProfile as Record<string, unknown>;
  const endGoal = String(
    extras.endOfUniversityGoal ?? rawProfile.targetGoal ?? "",
  ).trim();
  const profile = {
    ...rawProfile,
    targetGoal: rawProfile.targetGoal?.trim() || endGoal || "Finish university with a clear plan",
    brainDump:
      rawProfile.brainDump?.trim() ||
      String(extras.bottleneckConcern ?? "").trim() ||
      "Time pressure and uncertainty about what to focus on next.",
  };

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

  if (endGoal) {
    plan = { ...plan, destination: endGoal };
  }

  // Re-ID seed nodes/tasks so they belong to the freshly minted planId.
  // The client side will save the same structure to localStorage so the dashboard
  // and flowgram can read them whether or not Supabase is reachable.
  const reIdedSeedNodes: StrategyNode[] = seedNodes.map((node) => ({
    ...node,
    planId,
  }));
  const reIdedSeedTasks: StrategyTask[] = seedTasks.map((task) => ({
    ...task,
    planId,
    studentId: task.studentId ?? studentId,
  }));

  await persistToSupabase(
    profile as Record<string, unknown>,
    plan,
    studentId,
    reIdedSeedNodes,
    reIdedSeedTasks,
  );

  return NextResponse.json({
    ok: true,
    planId,
    studentId,
    plan,
    seedNodes: reIdedSeedNodes,
    seedTasks: reIdedSeedTasks,
  });
}
