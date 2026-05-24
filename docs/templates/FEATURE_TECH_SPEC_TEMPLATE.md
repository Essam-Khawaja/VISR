# Feature Tech Spec: [Feature Name]

## Status
Draft / In Progress / Complete

## Related Docs
- Global PRD: `docs/architecture/PRD.md`
- Global Tech Spec: `docs/architecture/TECH_SPEC.md`
- Global Architecture: `docs/architecture/ARCHITECTURE.md`
- Feature PRD: `docs/features/[feature-folder]/PRD.md`

## Technical Summary
Briefly describe how this feature will be implemented.

## Files Expected to Change
- `src/...`
- `src/...`
- `docs/features/[feature-folder]/...`

## Components

| Component | Purpose |
|---|---|
| `[ComponentName]` | What it does |

## Data Model
Describe the data shape this feature needs.

```ts
type Example = {
  id: string;
};
```

## API / Server Logic
Describe any routes, server actions, backend functions, or external API calls.

## State Management
Describe local state, server state, form state, loading state, and error state.

## Validation
Describe input validation and expected error handling.

## Testing / Verification
This feature should be verified by:
- [ ] Running the app locally
- [ ] Completing the main user flow
- [ ] Checking empty/loading/error states
- [ ] Running typecheck/lint/build
