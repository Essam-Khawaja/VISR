import { NextResponse } from "next/server";
import { z } from "zod";
import { callGroqJson } from "@/lib/strategyweb/groq";
import {
  taskGenerationSystemPrompt,
  taskGenerationUserPrompt,
} from "@/lib/strategyweb/prompts";
import { TaskGenerationRequestSchema } from "@/lib/strategyweb/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TaskSchema = z.object({
  name: z.string().max(80),
  recommendation: z.string().max(400),
});

const ResponseSchema = z.object({
  tasks: z.array(TaskSchema).min(1).max(8),
});

function buildFallbackTasks(
  nodeName: string,
): Array<{ name: string; recommendation: string }> {
  return [
    {
      name: `Research best practices for ${nodeName}`,
      recommendation: `Spend 30 minutes finding 3-5 reliable resources about ${nodeName}. Note key takeaways.`,
    },
    {
      name: `Create a weekly plan for ${nodeName}`,
      recommendation: `Block specific time slots this week dedicated to making progress on ${nodeName}.`,
    },
    {
      name: `Find an accountability partner for ${nodeName}`,
      recommendation: `Ask a classmate or mentor to check in weekly on your ${nodeName} progress.`,
    },
  ];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = TaskGenerationRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { nodeName, nodeDescription, parentContext, userPrompt } =
      parsed.data;

    const raw = await callGroqJson(
      taskGenerationSystemPrompt(),
      taskGenerationUserPrompt(parentContext, nodeName, nodeDescription, userPrompt),
      { temperature: 0.7, maxTokens: 1024 },
    );

    if (!raw) {
      return NextResponse.json({ tasks: buildFallbackTasks(nodeName) });
    }

    try {
      const json = JSON.parse(raw);
      const result = ResponseSchema.safeParse(json);
      if (result.success) {
        return NextResponse.json({ tasks: result.data.tasks });
      }
    } catch {}

    return NextResponse.json({ tasks: buildFallbackTasks(nodeName) });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
