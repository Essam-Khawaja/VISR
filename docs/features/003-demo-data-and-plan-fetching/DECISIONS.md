# DECISIONS: Demo Data and Plan Fetching

## D1: Demo Data Lives in Code

The judging path must not depend on network, database, or AI. `lib/demoData.ts` is the source of truth for demo rendering.

## D2: Same Dashboard Components

The demo route and real route must render the same dashboard components so the demo does not drift from the product.

## D3: Validate Stored JSON

Even though Supabase stores JSONB, fetched plans should be validated before rendering to avoid dashboard crashes.

