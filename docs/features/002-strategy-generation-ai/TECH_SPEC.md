# TECH SPEC: Strategy Generation AI

## Files

```text
app/api/generate/route.ts
lib/groq.ts
lib/prompts/strategyPrompt.ts
lib/validation.ts
lib/supabase.ts
lib/types.ts
```

## API Contract

```ts
POST /api/generate

Request:
{
  profile: Omit<StudentProfile, "id" | "createdAt">
}

Response:
{
  planId: string;
  studentId: string;
}
```

## Implementation Architecture

1. Parse request body.
2. Validate required profile fields.
3. Generate `studentId` with `uuid`.
4. Save profile to `student_profiles`.
5. Construct a full `StudentProfile` with `id` and `createdAt`.
6. Build prompt with `buildStrategyPrompt(profile)`.
7. Call `callGroqJson(system, user)`.
8. Validate result with `StrategyPlanSchema.safeParse`.
9. If invalid, call Groq once more with a correction prompt.
10. Save validated plan to `strategy_plans.plan`.
11. Return `{ planId, studentId }`.

## Groq Wrapper

`callGroqJson(system: string, user: string, opts?: GroqOptions)` should:

- Return `null` when `GROQ_API_KEY` is missing so deterministic fallback can run.
- Use `process.env.GROQ_MODEL || "llama-3.3-70b-versatile"`.
- Use `temperature: 0.3`.
- Use `max_completion_tokens` around `6000`.
- Strip markdown fences.
- Parse JSON.
- Throw useful errors.

## Prompt Requirements

The prompt must state:

- You are a sharp strategy advisor for ambitious university students.
- You are not a motivational coach.
- You are not a therapist.
- You are not a generic productivity assistant.
- Output strict JSON matching `StrategyPlan`.
- Use exact enum values.
- Identify one specific main bottleneck.
- Tie every recommendation to the student's stated goal.

## Error Shape

```ts
{
  error: {
    code: "INVALID_REQUEST" | "PROFILE_SAVE_FAILED" | "GROK_FAILED" | "VALIDATION_FAILED" | "PLAN_SAVE_FAILED";
    message: string;
  }
}
```
