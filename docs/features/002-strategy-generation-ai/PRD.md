# PRD: Strategy Generation AI

## Purpose

This feature turns a student profile into a validated `StrategyPlan`.

Pathwise must feel like a sharp strategy advisor, not a motivational coach or generic productivity assistant.

## User Story

As a student, I want Pathwise to read my messy situation and tell me my destination, current stage, main bottleneck, what to cut, and what to do over the next 7 days.

## Scope

- `POST /api/generate`
- `lib/groq.ts`
- `lib/prompts/strategyPrompt.ts`
- `lib/validation.ts`
- Supabase insert into `student_profiles`
- Supabase insert into `strategy_plans`

## Strategy Output

The generated plan must include:

- `destination`
- `currentStage`
- `mainBottleneck`
- `routeStatus`
- `alignmentScore`
- `strategicPillars`
- `semesterPriorities`
- `cutList`
- `nextSevenDays`
- `risks`

## Acceptance Criteria

- Incoming profile is saved.
- Groq returns strict JSON.
- JSON is parsed and validated with `StrategyPlanSchema`.
- Invalid output retries once with a correction prompt.
- Valid plan is saved as JSONB.
- API returns `{ planId, studentId }`.
- Structured errors are returned on failure.

