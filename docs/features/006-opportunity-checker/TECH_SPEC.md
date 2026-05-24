# TECH SPEC: Opportunity Checker

## Files

```text
components/OpportunityChecker.tsx
components/OpportunityResult.tsx
app/api/opportunity/route.ts
lib/prompts/opportunityPrompt.ts
lib/groq.ts
lib/demoData.ts
lib/validation.ts
```

## Component Architecture

`OpportunityChecker`:

- Client component.
- Props: `{ planId: string }`.
- Local state: `opportunityText`, `isLoading`, `error`, `check`.
- Calls `POST /api/opportunity`.
- Renders `OpportunityResult` after success.

`OpportunityResult`:

- Props: `{ check: OpportunityCheck }`.
- Shows recommendation as visual headline.
- Shows fit score gauge.
- Shows reasoning, why it fits, tradeoffs, conditions, and cuts required.

## API Architecture

```ts
POST /api/opportunity
{
  planId: string;
  opportunityText: string;
}
```

Flow:

1. Validate request body.
2. Load plan from demo data or Supabase.
3. Build prompt with `buildOpportunityPrompt(plan, opportunityText)`.
4. Call Groq.
5. Validate with `OpportunityCheckSchema`.
6. Save to `opportunity_checks`.
7. Return `{ check }`.

## Prompt Architecture

The prompt must include:

- Destination
- Current stage
- Main bottleneck
- Alignment score
- Semester priorities
- Cut list
- Risks
- Next 7 days
- Opportunity text

The prompt must say: do not evaluate the opportunity in isolation.

## Demo Fallback

If `planId === "demo-cs-student-001"` and the API key or Supabase is missing, return `demoOpportunityCheck`. This keeps the judging path reliable.

