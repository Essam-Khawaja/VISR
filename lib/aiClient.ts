/**
 * Tiny OpenAI wrapper used by /api/generate and /api/opportunity.
 * Returns the assistant message text or null when no key / failure.
 */

type ChatMessage = { role: "system" | "user"; content: string };

export async function callOpenAIJson(
  system: string,
  user: string,
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const body = {
    model,
    response_format: { type: "json_object" as const },
    temperature: opts.temperature ?? 0.4,
    max_tokens: opts.maxTokens ?? 2200,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ] satisfies ChatMessage[],
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18_000);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}
