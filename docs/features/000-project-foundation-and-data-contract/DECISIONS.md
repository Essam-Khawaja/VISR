# DECISIONS: Project Foundation and Data Contract

## D1: Foundation Comes Before Feature Work

The MVP should not start with UI screens until the data contract is stable. Types, validation, demo data, and API shapes come first.

## D2: AI Objects Stay Clean

`StrategyPlan` and `OpportunityCheck` should match Groq's JSON output and UI needs. Database metadata belongs in wrapper types or route responses.

## D3: JSONB for Hackathon Speed

Use JSONB for `strategy_plans.plan` and `opportunity_checks.check` to avoid over-normalizing nested strategy data during a 24-hour build.

## D4: Demo Data Must Not Depend on Infrastructure

The demo route should work even if Groq, Supabase, or network access fails.

## D5: Compatibility Re-Exports Are Allowed Temporarily

If renaming `fixture.ts` to `demoData.ts` or `validate.ts` to `validation.ts` would cause too much churn in one pass, keep the old files as re-export shims while migrating imports.

## D6: Solo Build Bias

Because one person is building the MVP, prefer fewer abstractions, direct helpers, and stable contracts over clever layering.
