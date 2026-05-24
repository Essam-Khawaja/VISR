# TECH SPEC: Demo Data and Plan Fetching

## Files

```text
lib/demoData.ts
app/dashboard/demo-cs-student-001/page.tsx
app/demo/page.tsx
app/api/plan/[planId]/route.ts
app/dashboard/[planId]/page.tsx
```

## Demo Exports

```ts
export const DEMO_PLAN_ID = "demo-cs-student-001";
export const demoStudentProfile: StudentProfile;
export const demoStrategyPlan: StrategyPlan;
export const demoOpportunityCheck: OpportunityCheck;
```

## Implementation Architecture

- The demo page imports `demoStrategyPlan` directly and renders the dashboard shell.
- `/demo` uses `redirect("/dashboard/demo-cs-student-001")`.
- `GET /api/plan/[planId]` returns demo data when `planId === DEMO_PLAN_ID`.
- Otherwise, fetch from `strategy_plans` and optionally `student_profiles`.
- Keep Supabase row mapping in one helper if it grows.

## Supabase Plan Query

```ts
const { data, error } = await supabase
  .from("strategy_plans")
  .select("id, student_id, plan, created_at")
  .eq("id", planId)
  .single();
```

The API returns `data.plan` as the `StrategyPlan` after validating it with `StrategyPlanSchema`.

## Error Shape

```ts
{
  error: {
    code: "PLAN_NOT_FOUND" | "PLAN_FETCH_FAILED";
    message: string;
  }
}
```

