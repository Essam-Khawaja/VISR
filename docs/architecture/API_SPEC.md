# API Spec

## Endpoints

### `POST /api/generate`

Generates a `StrategyPlan` from onboarding profile input.

**Request**
```ts
type GenerateRequest = {
  profile: {
    university: string;
    degree: string;
    year: string;
    targetGoal: string;        // 3–280 chars
    secondaryGoals: string[];
    currentCourses: string[];
    commitments: string[];
    workHoursPerWeek: number;  // 0–80
    constraints: string[];
    brainDump: string;         // 10–4000 chars
  };
};
```

**Response (200)**
```ts
type GenerateResponse = {
  ok: true;
  planId: string;
  plan: StrategyPlan;
};
```

**Errors**
- `400` — `{ ok: false, error: string }` validation failure
- `500` — unexpected server error

**Behavior**
- With `OPENAI_API_KEY`: calls OpenAI with JSON response format, validates with Zod.
- Without key or on AI failure: `buildDeterministicPlan()` personalizes by goal type and brain-dump keywords.

Client persists via `lib/planStore.ts` and redirects to `/dashboard/[planId]`.

---

### `POST /api/opportunity`

Scores an opportunity against the user's current plan.

**Request**
```ts
type OpportunityRequest = {
  planId: string;
  plan: StrategyPlan;          // sent from client localStorage
  opportunityText: string;     // 10–2000 chars
};
```

**Response (200)**
```ts
type OpportunityResponse = {
  ok: true;
  check: OpportunityCheck;
};
```

**Errors**
- `400` — `{ ok: false, error: string }`

**Behavior**
- With `OPENAI_API_KEY`: AI-scored `OpportunityCheck`.
- Fallback: `buildDeterministicOpportunity()` keyword classification.

Client may call `planStore.applyOpportunity()` to merge cuts + conditions locally.

---

## Environment

See `.env.example`:
- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL` (optional, default `gpt-4o-mini`)

## Persistence

MVP uses **localStorage** only (`pathwise.plan.{planId}`). No server-side plan storage yet.

Demo plan id (`demo-cs-student-001`) is served from `lib/fixture.ts` and is not persisted.
