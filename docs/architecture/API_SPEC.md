# API SPEC: Pathwise

## API Principles

- All Groq calls happen server-side.
- Groq responses must be JSON only.
- Every Groq response is parsed and validated with Zod before use.
- API errors are structured and safe to show in the UI.
- The demo plan can be served without live AI or Supabase.

---

## Groq Wrapper

File: `lib/groq.ts`

Responsibilities:

- Call Groq chat completions using `process.env.GROQ_API_KEY`.
- Export `callGroqJson(system: string, user: string, opts?: GroqOptions)`.
- Use model `llama-3.3-70b-versatile` by default.
- Keep the model string easy to change.
- Use `max_completion_tokens` high enough for the strategy plan.
- Use `temperature` around `0.3`.
- Demand JSON only in prompts.
- Strip markdown code fences if Groq returns them.
- Throw useful errors for missing API key, empty response, non-text response, and JSON parse failure.
- Groq docs source: https://console.groq.com/docs/api-reference and https://console.groq.com/docs/models.

Reference shape:

```ts
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export async function callGroqJson(
  system: string,
  user: string
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODEL,
      max_completion_tokens: 6000,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    })
  });

  if (!response.ok) return null;
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) return null;

  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}
```

---

## POST /api/generate

Purpose: accept a `StudentProfile` from onboarding, call Groq, validate the result, save it to Supabase, and return the `planId`.

Request body:

```ts
{
  profile: Omit<StudentProfile, "id" | "createdAt">
}
```

Success response:

```ts
{
  planId: string;
  studentId: string;
}
```

Internal flow:

1. Parse request body.
2. Validate the incoming profile shape.
3. Generate UUID for student profile.
4. Save profile to Supabase table `student_profiles`.
5. Build strategy prompt using `buildStrategyPrompt(profile)`.
6. Call `callGroqJson(system, user)`.
7. Validate parsed response using `StrategyPlanSchema`.
8. If validation fails, retry once with a correction prompt that includes the validation error and asks for corrected JSON only.
9. Generate UUID for strategy plan.
10. Save the validated plan to Supabase table `strategy_plans` in the `plan` JSONB column.
11. Return `planId` and `studentId`.
12. If anything fails, return a structured error response.

Error response:

```ts
{
  error: {
    code: "INVALID_REQUEST" | "PROFILE_SAVE_FAILED" | "GROK_FAILED" | "VALIDATION_FAILED" | "PLAN_SAVE_FAILED";
    message: string;
  }
}
```

---

## POST /api/opportunity

Purpose: accept an opportunity string and `planId`, fetch the existing `StrategyPlan`, call Groq, validate the opportunity analysis, save it, and return the structured result.

Request body:

```ts
{
  planId: string;
  opportunityText: string;
}
```

Success response:

```ts
{
  check: OpportunityCheck;
}
```

Internal flow:

1. Parse request body.
2. If `planId` is `demo-cs-student-001`, load demo plan from `lib/demoData.ts`.
3. Otherwise fetch strategy plan from Supabase by `planId`.
4. Build opportunity prompt using `buildOpportunityPrompt(plan, opportunityText)`.
5. Call `callGroqJson(system, user)`.
6. Validate parsed response using `OpportunityCheckSchema`.
7. Save validated result to `opportunity_checks.check` as JSONB.
8. Return `{ check }`.

Demo fallback:

- If the API key or database is missing and the plan is `demo-cs-student-001`, return the seeded robotics-club `OpportunityCheck`.
- The fallback keeps the hackathon demo reliable while preserving the real API path.

Error response:

```ts
{
  error: {
    code: "INVALID_REQUEST" | "PLAN_NOT_FOUND" | "GROK_FAILED" | "VALIDATION_FAILED" | "CHECK_SAVE_FAILED";
    message: string;
  }
}
```

---

## GET /api/plan/[planId]

Purpose: fetch a saved strategy plan by ID.

Success response:

```ts
{
  plan: StrategyPlan;
  profile?: StudentProfile;
}
```

Internal flow:

1. If `planId` is `demo-cs-student-001`, return `demoStrategyPlan` and `demoStudentProfile`.
2. Fetch plan row from `strategy_plans`.
3. Fetch linked profile row from `student_profiles` when available.
4. Map snake_case database fields to camelCase TypeScript fields.
5. Return `{ plan, profile }`.

Error response:

```ts
{
  error: {
    code: "PLAN_NOT_FOUND" | "PLAN_FETCH_FAILED";
    message: string;
  }
}
```

---

## Strategy Prompt

File: `lib/prompts/strategyPrompt.ts`

Function:

```ts
export function buildStrategyPrompt(profile: StudentProfile): string
```

Prompt requirements:

- "You are a sharp strategy advisor for ambitious university students."
- "You are not a motivational coach."
- "You are not a therapist."
- "You are not a generic productivity assistant."
- Job: identify destination, current stage, main bottleneck, priorities, cut list, risks, and next 7 days.
- Output strict JSON matching `StrategyPlan`.

Groq must:

- Identify one specific main bottleneck.
- Avoid generic advice.
- Tie every recommendation to the student's stated goal.
- Be opinionated.
- Recommend what to cut, defer, keep, and double down on.
- Include 3 to 7 concrete actions for the next 7 days.
- Make actions specific and doable.
- Include risks.
- Include at least 4 strategic pillars.
- Use exact enum values from the schema.

Tone:

- Sharp advisor, not wellness app.
- Bad: "You may want to consider exploring some projects."
- Good: "Your bottleneck is no shipped project. Everything else is secondary until one project is public."

---

## Opportunity Prompt

File: `lib/prompts/opportunityPrompt.ts`

Function:

```ts
export function buildOpportunityPrompt(
  plan: StrategyPlan,
  opportunityText: string
): string
```

Prompt requirements:

- Evaluate the opportunity against the student's current strategy.
- Do not evaluate the opportunity in isolation.
- Consider destination, current stage, bottleneck, alignment score, active priorities, cut list, risks, and next 7 days.
- Return strict JSON matching `OpportunityCheck`.

The response must include:

- `fitScore`
- `recommendation`
- `reasoning`
- `whyItFits`
- `tradeoffs`
- `conditions`
- `cutsRequired`

Groq must:

- Be willing to say no.
- If it says yes, explain what the student should cut or cap.
- If the opportunity is good but poorly timed, recommend `Defer`.
- If the opportunity is good only under constraints, recommend `Say Yes With Conditions`.

---

## Supabase Mapping

`student_profiles` stores structured profile fields using snake_case columns.

`strategy_plans` stores:

- `id`
- `student_id`
- `plan jsonb`
- `created_at`

`opportunity_checks` stores:

- `id`
- `plan_id`
- `opportunity_text`
- `check jsonb`
- `created_at`

The application types remain camelCase.
