# Feature Tech Spec: User Foundation Layer

## Status
Draft

## Related Docs
- Global PRD: `docs/architecture/PRD.md`
- Global Data Model: `docs/architecture/DATA_MODEL.md`
- Feature PRD: `docs/features/001-user-foundation/PRD.md`

## Technical Summary
Onboarding UI collects student data; API validates and persists a `UserProfile` record. Interests stored as string tags. Single primary goal for MVP.

## Files Expected to Change
- `src/app/onboarding/` (or equivalent route)
- `src/components/onboarding/`
- `src/lib/types.ts` — `UserProfile` type
- `src/lib/db/` or API route for profile CRUD
- `docs/features/001-user-foundation/`

## Components

| Component | Purpose |
|-----------|---------|
| `OnboardingWizard` | Multi-step form container |
| `DegreeStep` | Degree, year, university |
| `GoalsStep` | Primary goal, interests tags |
| `ConstraintsStep` | Hours/week, difficulty (optional) |
| `ProfileSummary` | Review before save |

## Data Model

```ts
type UserProfile = {
  id: string;
  userId: string;
  degree: string;
  yearOfStudy: number; // 1–4+
  university?: string;
  interests: string[]; // tags
  primaryGoal: string;
  constraints?: {
    hoursPerWeek?: number;
    difficultyPreference?: "light" | "balanced" | "intensive";
  };
  createdAt: string;
  updatedAt: string;
};
```

## API / Server Logic
- `POST /api/profile` — create or replace profile after onboarding
- `GET /api/profile` — fetch current user profile
- `PATCH /api/profile` — partial update (post-MVP)

## State Management
- Wizard step index in local React state
- Form fields controlled per step
- Submit: loading → success redirect or error toast
- Auth session provides `userId`

## Validation
| Field | Rule |
|-------|------|
| `degree` | Required, non-empty string |
| `primaryGoal` | Required, min 3 characters |
| `yearOfStudy` | Required, integer 1–6 |
| `interests` | Optional, array of strings, max 20 tags |

## Testing / Verification
- [ ] Complete onboarding with valid data → profile in DB
- [ ] Submit without degree or goal → validation errors
- [ ] Reload app → profile available via GET
- [ ] Run typecheck/lint/build
