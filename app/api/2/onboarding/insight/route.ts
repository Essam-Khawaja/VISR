import { NextResponse } from "next/server";
import { callGroqJson } from "@/lib/2/groq";
import { buildDeterministicOnboardingInsight } from "@/lib/2/deterministicOnboardingInsight";
import {
  onboardingInsightSystemPrompt,
  onboardingInsightUserPrompt,
} from "@/lib/2/prompts";
import { OnboardingInsightRequestSchema } from "@/lib/2/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const parse = OnboardingInsightRequestSchema.safeParse(parsedBody);
  if (!parse.success) {
    return NextResponse.json(
      { ok: false, error: parse.error.issues[0]?.message ?? "Bad request" },
      { status: 400 },
    );
  }

  const { step, profile } = parse.data;

  const ai = await callGroqJson(
    onboardingInsightSystemPrompt(),
    onboardingInsightUserPrompt(step, profile),
    { temperature: 0.5, maxTokens: 200 },
  );

  if (ai) {
    try {
      const data = JSON.parse(ai) as {
        insight?: string;
        bottleneckPreview?: string;
        concernLabels?: string[];
      };
      if (data.insight && typeof data.insight === "string") {
        return NextResponse.json({
          ok: true,
          insight: data.insight,
          bottleneckPreview: data.bottleneckPreview ?? undefined,
          concernLabels: Array.isArray(data.concernLabels)
            ? data.concernLabels.filter((l): l is string => typeof l === "string").slice(0, 3)
            : undefined,
        });
      }
    } catch {
      // fall through to deterministic
    }
  }

  const result = buildDeterministicOnboardingInsight(step, profile);
  return NextResponse.json({ ok: true, ...result });
}
