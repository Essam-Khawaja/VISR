# DECISIONS: Strategy Generation AI

## D1: JSON-Only AI Boundary

Groq output is never rendered directly. It must parse as JSON and pass Zod validation.

## D2: Retry Once

Validation failures retry once with the schema error. More retries create latency and demo risk.

## D3: Store Whole Plan JSONB

The generated plan is saved as a single JSONB object for MVP speed. Normalization can happen later.

