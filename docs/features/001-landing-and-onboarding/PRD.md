# PRD: Landing and Onboarding

> **Note:** Onboarding UX (multi-step form + map) is superseded by **[008-progressive-onboarding-strategy-map](../008-progressive-onboarding-strategy-map/)**, which specifies live strategy-map building per step. This doc still applies to the **landing page** and high-level onboarding entry.

## Purpose

This feature gets the student from curiosity to a complete `StudentProfile`. The experience must feel like building a student command center, not filling out an administrative form.

## User Story

As an overwhelmed ambitious student, I want to describe my goal, workload, constraints, and messy thoughts so Pathwise can identify what actually matters.

## Scope

- Landing page at `/`
- Multi-step onboarding at `/onboarding`
- Generation loading state
- Redirect to `/dashboard/[planId]` after successful strategy generation
- Error path with a clear demo escape hatch

## Landing Page Requirements

Hero:

- Headline: "Stop organizing chaos. Find the route."
- Subheading: "Pathwise turns a messy student life into a clear bottleneck, cut list, and 7-day strategy."
- Primary CTA: "Build My Route" to `/onboarding`
- Secondary CTA: "View Demo" to `/dashboard/demo-cs-student-001` or `/demo`

Sections:

- The problem: Students do not need another task list. They need to know what actually matters.
- What Pathwise gives you: Main bottleneck, Strategy Map, Cut list, Next 7 days, Opportunity Check.
- Demo preview: Destination, Bottleneck, Alignment 64%.

## Onboarding Requirements

Steps:

1. Goal: `targetGoal`
2. Academic context: `degree`, `year`, `university`, `courses`
3. Current plate: `commitments`
4. Constraints: `workHoursPerWeek`, `constraints`
5. Brain dump: `brainDump`

The brain dump is critical. Students should be able to paste scattered thoughts without cleaning them up.

## Acceptance Criteria

- Landing page works and has both CTAs.
- Onboarding captures all required fields for `Omit<StudentProfile, "id" | "createdAt">`.
- Submit button says "Build My Route".
- Loading screen cycles through the five strategy-generation messages.
- Successful submit redirects to `/dashboard/[planId]`.
- Failed submit shows: "Strategy generation failed. Try again or open the demo."

