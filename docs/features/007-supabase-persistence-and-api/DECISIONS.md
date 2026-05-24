# DECISIONS: Supabase Persistence and API

## D1: JSONB for Hackathon Speed

Use JSONB for plans and opportunity checks because the nested schema may change during the 24-hour build.

## D2: Server Writes

Profile, plan, and opportunity writes happen through API routes so secrets stay server-side.

## D3: No Production Privacy Claim

Without auth and RLS, this is a hackathon demo persistence layer only.

