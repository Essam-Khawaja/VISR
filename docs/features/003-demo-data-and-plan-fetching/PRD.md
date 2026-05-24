# PRD: Demo Data and Plan Fetching

## Purpose

This feature guarantees the hackathon demo works instantly and reliably.

## User Story

As a judge, I can open the demo dashboard and immediately understand the product without waiting for AI generation.

## Scope

- Static demo data in `lib/demoData.ts`
- Demo dashboard route
- Optional `/demo` redirect
- `GET /api/plan/[planId]`
- Plan fetching behavior for real and demo plans

## Demo ID

```ts
demo-cs-student-001
```

## Acceptance Criteria

- `/dashboard/demo-cs-student-001` loads without AI.
- Demo data matches the CS student scenario.
- `GET /api/plan/demo-cs-student-001` returns the demo plan.
- Normal UUID plan IDs fetch from Supabase.
- Missing plans return a structured error.

