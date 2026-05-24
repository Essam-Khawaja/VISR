# PRD: Project Foundation and Data Contract

## Purpose

This feature lays down the structure that every other VISR MVP feature depends on: dependencies, environment variables, TypeScript types, Zod validation, demo data, Supabase schema, status colors, and API contracts.

This is the first solo-dev task. It should make the rest of the build feel boring in the best way: components receive typed data, API routes validate data, and the demo route has a stable plan to render.

## User Story

As the builder, I need one reliable foundation so I can implement the MVP without constantly reshaping data between onboarding, AI generation, dashboard rendering, opportunity checks, and Supabase persistence.

## Scope

- Package dependency alignment
- Environment variable contract
- Canonical TypeScript types
- Zod schemas
- Status color mappings
- Demo data
- Supabase schema/setup SQL
- Shared file naming conventions
- Data ownership rules
- API response shapes

## Non-Goals

- Building the dashboard UI
- Implementing final prompt tuning fully
- Implementing onboarding UI
- Adding auth or production RLS
- Adding normalized relational tables for every nested object

## Acceptance Criteria

- `package.json` includes all MVP dependencies.
- `lib/types.ts` exactly matches the MVP data contract.
- `lib/validation.ts` validates the same contract.
- `lib/statusColors.ts` exists and maps all enum statuses.
- `lib/demoData.ts` exports the demo profile, plan, and opportunity check.
- `lib/supabase.ts` exists with server-safe Supabase client helpers.
- Supabase setup SQL exists in docs or migration form.
- API route contracts are documented before implementation.
- Existing old data names are removed or shimmed intentionally:
  - `currentCourses` -> `courses`
  - `secondaryGoals` removed
  - `constraints: string[]` -> `constraints: string`
  - OpenAI wrapper replaced by Groq wrapper
