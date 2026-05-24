# PRD: Supabase Persistence and API

## Purpose

This feature gives Pathwise enough persistence for the full MVP loop while keeping the schema flexible for hackathon iteration.

## User Story

As a student, I want my generated strategy and opportunity checks to be saved so I can open the dashboard by URL.

## Scope

- Supabase schema
- `lib/supabase.ts`
- Profile persistence
- Strategy plan persistence
- Opportunity check persistence
- Server-safe environment variable usage

## Acceptance Criteria

- Tables exist: `student_profiles`, `strategy_plans`, `opportunity_checks`.
- Strategy plans store the full plan in JSONB.
- Opportunity checks store the full result in JSONB.
- API routes can write without exposing secrets to the client.
- Setup instructions or migration SQL exists.

