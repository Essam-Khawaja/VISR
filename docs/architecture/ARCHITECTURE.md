# Architecture

## Overview
StraighterNoodles is a Next.js App Router application with API routes backed by Supabase PostgreSQL. The frontend renders a vertical timeline dashboard with weather integration and a "Before You Leave" checklist.

## Main App Flow
1. User opens the app and sees a greeting + weather summary
2. "Before You Leave" checklist shows all items needed for today
3. Vertical timeline displays today's events in chronological order
4. User can create/edit events, attach items, and find free time slots

## Frontend Architecture
- **Dashboard (/)**: Main page with Header, WeatherBanner, BeforeYouLeave checklist, Timeline, and FreeTimeFinder
- **Settings (/settings)**: User preferences form (city, timezone, category default items)
- Components are organized by feature: timeline/, checklist/, weather/, events/, free-time/, layout/, settings/

## Backend Architecture
- **API Routes**: Next.js route handlers under src/app/api/
- **Database**: Supabase PostgreSQL with tables for events, items, event_items, category_default_items, user_settings
- **Weather**: Proxy route to OpenWeather API, returns normalized WeatherData
- **Free Time**: Computes gaps between events for a given day

## Data Flow
1. Dashboard page fetches today's events, items, weather, and settings on mount
2. Events are sorted chronologically and rendered as timeline cards
3. Checklist aggregates items from category defaults, event-specific items, and weather advice
4. Event creation/editing triggers API calls that persist to Supabase

## Error Handling
- API routes return appropriate HTTP status codes
- UI shows loading skeletons during data fetch
- Empty states shown when no events exist for today
- Weather failures gracefully degrade (no weather shown, no crash)

## Deployment
- Vercel deployment with environment variables for Supabase and OpenWeather
