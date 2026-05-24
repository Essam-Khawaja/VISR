import { NextResponse } from "next/server";
import { callGrokJson } from "@/lib/grok";
import { buildDeterministicOpportunity } from "@/lib/deterministicOpportunity";
import {
  opportunitySystemPrompt,
  opportunityUserPrompt,
  summarizePlan,
} from "@/lib/prompts";
import {
  OpportunityCheckSchema,
  OpportunityRequestSchema,
} from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function randomOpportunityId(): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().split("-")[0]
      : Math.random().toString(36).slice(2, 10);
  return `opp-${rnd}`;
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
  const parse = OpportunityRequestSchema.safeParse(parsedBody);
  if (!parse.success) {
    return NextResponse.json(
      { ok: false, error: parse.error.issues[0]?.message ?? "Bad request" },
      { status: 400 },
    );
  }
  const { plan, opportunityText, planId } = parse.data;
  const id = randomOpportunityId();
  const studentId = plan.studentId;

  const ai = await callGrokJson(
    opportunitySystemPrompt(),
    opportunityUserPrompt(
      summarizePlan(plan),
      opportunityText,
      id,
      studentId,
      planId,
    ),
    { temperature: 0.4, maxTokens: 1100 },
  );

  if (ai) {
    try {
      const raw: unknown = JSON.parse(ai);
      const result = OpportunityCheckSchema.safeParse(raw);
      if (result.success) {
        return NextResponse.json({ ok: true, check: result.data });
      }
    } catch {
      // fall through to deterministic
    }
  }

  const check = buildDeterministicOpportunity(plan, opportunityText, id);
  return NextResponse.json({ ok: true, check });
}
