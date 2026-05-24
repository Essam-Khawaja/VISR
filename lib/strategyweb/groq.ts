/**
 * Tiny Groq wrapper used by /api/generate and /api/opportunity.
 * Returns the assistant message text or null when no key / failure.
 *
 * Groq exposes an OpenAI-compatible chat completions surface, so we keep this
 * wrapper intentionally small and dependency-free for hackathon reliability.
 */

type ChatMessage = { role: "system" | "user"; content: string };

type GroqOptions = {
  temperature?: number;
  maxTokens?: number;
};

function stripMarkdownFences(text: string): string {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

export async function callGroqJson(
  system: string,
  user: string,
  opts: GroqOptions = {},
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const body = {
    model,
    response_format: { type: "json_object" as const },
    temperature: opts.temperature ?? 0.4,
    max_completion_tokens: opts.maxTokens ?? 2200,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ] satisfies ChatMessage[],
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18_000);
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
    const content = data.choices?.[0]?.message?.content;
    return content ? stripMarkdownFences(content) : null;
  } catch {
    return null;
  }
}
