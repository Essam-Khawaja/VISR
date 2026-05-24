# TASKS: Project Foundation and Data Contract

## Dependencies

- [ ] Use direct HTTP to Groq chat completions
- [ ] Add `@supabase/supabase-js`
- [ ] Add `uuid`
- [ ] Add `@types/uuid`
- [ ] Confirm existing `next`, `react`, `tailwindcss`, `framer-motion`, `three`, `@types/three`, `zod`, and `typescript`

## Environment

- [ ] Add `.env.example` or setup docs with required environment variables
- [ ] Confirm no server secrets are referenced in client components
- [ ] Set default Groq model string to `llama-3.3-70b-versatile`

## Types

- [ ] Update `lib/types.ts` to the MVP contract
- [ ] Remove `secondaryGoals`
- [ ] Rename `currentCourses` to `courses`
- [ ] Convert `constraints` to `string`
- [ ] Remove AI-facing `id`, `studentId`, and `createdAt` from `StrategyPlan`
- [ ] Remove persistence metadata from `OpportunityCheck`
- [ ] Add stored wrapper types if needed

## Validation

- [ ] Create or rename to `lib/validation.ts`
- [ ] Export `StudentProfileSchema`
- [ ] Export `StrategyPlanSchema`
- [ ] Export `OpportunityCheckSchema`
- [ ] Export request schemas for generate and opportunity routes
- [ ] Enforce all MVP min/max constraints
- [ ] Temporarily re-export from `lib/validate.ts` if old imports need migration time

## Demo Data

- [ ] Create or rename to `lib/demoData.ts`
- [ ] Export `DEMO_PLAN_ID`
- [ ] Export `demoStudentProfile`
- [ ] Export `demoStrategyPlan`
- [ ] Export `demoOpportunityCheck`
- [ ] Keep `lib/fixture.ts` as a compatibility re-export only if needed

## Status Colors

- [ ] Confirm `lib/statusColors.ts` maps all status enums
- [ ] Use light MVP token values
- [ ] Ensure labels still show status text and do not rely only on color

## Supabase

- [ ] Create `lib/supabase.ts`
- [ ] Add anon client helper
- [ ] Add service client helper
- [ ] Add SQL setup file or docs section
- [ ] Use JSONB schema from this feature spec
- [ ] Document hackathon RLS posture

## Groq

- [ ] Create `lib/groq.ts`
- [ ] Use direct HTTP to `https://api.groq.com/openai/v1/chat/completions`
- [ ] Export `callGroqJson(system: string, user: string, opts?: GroqOptions)`
- [ ] Strip markdown code fences
- [ ] Throw useful errors
- [ ] Stop using OpenAI-specific `lib/aiClient.ts`

## API Contracts

- [ ] Align `POST /api/generate` request and response shape
- [ ] Align `POST /api/opportunity` request and response shape
- [ ] Add `GET /api/plan/[planId]`
- [ ] Ensure demo ID bypasses Supabase and AI
- [ ] Return structured errors

## Verification

- [ ] Run `npm run typecheck`
- [ ] Run `npm run lint`
- [ ] Confirm `/dashboard/demo-cs-student-001` can render from demo data after dashboard work starts
