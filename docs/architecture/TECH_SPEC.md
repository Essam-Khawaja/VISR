# Global Tech Spec

## Stack
- Frontend: Next.js 15 (App Router) + React 19
- Styling: Tailwind CSS v4
- Database: Supabase (PostgreSQL)
- Auth: None (single-user MVP)
- APIs: OpenWeather API, Browser Web Speech API
- Deployment: Vercel

## Technical Goals
- Build a reliable MVP.
- Prioritize demo-critical functionality.
- Keep architecture simple.
- Avoid unnecessary dependencies.

## Project Structure
- `src/app`: pages/routes and API routes
- `src/components`: reusable UI components
- `src/lib`: utilities, Supabase client, helpers
- `src/types`: shared TypeScript types

## Global Constraints
- Use TypeScript.
- Prefer small, readable components.
- Avoid overengineering.
- Do not add major dependencies without documenting the reason.
- City and user preferences must be configurable, never hardcoded.
