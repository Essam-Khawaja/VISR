import { NextResponse } from "next/server";
import { callGroqJson } from "@/lib/2/groq";
import { buildDeterministicOpportunity } from "@/lib/2/deterministicOpportunity";
import {
  opportunitySystemPrompt,
  opportunityUserPrompt,
  summarizePlan,
} from "@/lib/2/prompts";
import {
  OpportunityCheckSchema,
  OpportunityRequestSchema,
} from "@/lib/2/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function randomOpportunityId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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

  const ai = await callGroqJson(
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
