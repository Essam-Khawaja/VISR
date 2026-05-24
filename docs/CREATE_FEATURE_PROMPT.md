# Cursor Prompt: Create a New Feature Spec

Use this prompt when starting a new feature:

```md
Create a new feature spec folder for: [feature name]

Use the templates in `docs/templates/`.

Create the folder under:

`docs/features/[next-number]-[kebab-case-feature-name]/`

Include:
- PRD.md
- TECH_SPEC.md
- TASKS.md
- DECISIONS.md

Before filling them in, read:
- `docs/architecture/PRD.md`
- `docs/architecture/TECH_SPEC.md`
- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/TASKS.md`

The feature should align with the global architecture and hackathon MVP scope.

Do not write application code yet. Only create the feature specs.
```
