# DECISIONS: Supabase Persistence and API

## D1: JSONB for Hackathon Speed

Use JSONB for plans and opportunity checks because the nested schema may change during the 24-hour build.

## D2: Server Writes

Profile, plan, and opportunity writes happen through API routes so secrets stay server-side.

## D3: No Production Privacy Claim

Without auth and RLS, this is a hackathon demo persistence layer only.

## D4: Write-Through Sync

planStore uses localStorage as the primary read path for speed. Writes (action state changes, task additions) are fire-and-forget synced to Supabase via the anon client. Demo and onboarding-preview plans are excluded from sync.

## D5: Generate Route Persistence

The POST /api/generate route now inserts both student_profiles and strategy_plans rows via the service client after plan creation. Supabase failures are caught and ignored -- localStorage is always written client-side.

