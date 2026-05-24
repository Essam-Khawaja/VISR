# PRD: Opportunity Checker

## Purpose

The Opportunity Checker evaluates a new opportunity against the student's current strategy. It must not judge the opportunity in isolation.

## User Story

As a student, I want to ask whether I should say yes to something new and understand the tradeoff, conditions, and cuts required.

## Scope

- `OpportunityChecker.tsx`
- `OpportunityResult.tsx`
- `POST /api/opportunity`
- `lib/prompts/opportunityPrompt.ts`
- Demo fallback for robotics-club input

## Output

- Fit score
- Recommendation
- Reasoning
- Why it fits
- Tradeoffs
- Conditions
- Cuts required

## Acceptance Criteria

- User can enter freeform opportunity text.
- API evaluates against current `StrategyPlan`.
- Recommendation is one of the allowed enum values.
- Result includes opportunity cost.
- If the answer is yes, it explains what to cut or cap.
- Demo fallback works if API key is missing.

