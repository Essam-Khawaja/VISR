import { NextResponse } from "next/server";
import { callOpenAIJson } from "@/lib/aiClient";
import { buildDeterministicPlan } from "@/lib/deterministicPlan";
import {
  strategySystemPrompt,
  strategyUserPrompt,
} from "@/lib/prompts";
import {
  GenerateRequestSchema,
  StrategyPlanSchema,
} from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function randomPlanId(): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().split("-")[0]
      : Math.random().toString(36).slice(2, 10);
  return `plan-${rnd}`;
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

  // Try AI first.
  const ai = await callOpenAIJson(
    strategySystemPrompt(),
    strategyUserPrompt(profile, planId),
    { temperature: 0.5, maxTokens: 2400 },
  );

  if (ai) {
    try {
      const raw: unknown = JSON.parse(ai);
      const result = StrategyPlanSchema.safeParse(raw);
      if (result.success) {
        const plan = {
          ...result.data,
          id: planId,
          studentId,
        };
        return NextResponse.json({ ok: true, planId, plan });
      }
    } catch {
      // fall through to deterministic
    }
  }

  // Fallback deterministic.
  const plan = buildDeterministicPlan(profile, planId, studentId);
  return NextResponse.json({ ok: true, planId, plan });
}
