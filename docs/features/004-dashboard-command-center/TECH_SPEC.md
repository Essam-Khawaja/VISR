# TECH SPEC: Dashboard Command Center

## Files

```text
app/dashboard/[planId]/page.tsx
app/dashboard/demo-cs-student-001/page.tsx
components/dashboard/DashboardLayout.tsx
components/dashboard/DashboardWorkspace.tsx
components/dashboard/DashboardGraphCard.tsx
components/dashboard/GoalTreeSlot.tsx
components/dashboard/EmbeddedOpportunityChecker.tsx
```

## Component Architecture

- `DashboardLayout` owns the sidebar, scroll container, and Today overlay.
- `DashboardWorkspace` renders the light dashboard grid from `usePlan`.
- `DashboardGraphCard` renders compact graph preview and opens a modal with the full graph.
- `GoalTreeSlot` accepts `displayMode: "preview" | "full"` so preview mode hides graph HUD, dock, and helper copy.
- Next 7 Days uses existing local `actionStates` for open/done/deferred controls.
- Interactive children like the graph and opportunity checker remain client components.

## Data Loading

For real plans:

1. Read `params.planId`.
2. Fetch plan from local storage, Supabase, or `GET /api/plan/[planId]` depending on what is wired.
3. Validate with `StrategyPlanSchema`.
4. Render dashboard.
5. If not found, show an error panel with demo link.

For demo:

1. Use `demo-cs-student-001`.
2. Render through the same dashboard components.
3. Do not require Groq, Supabase, or network access.

## Styling Architecture

- Page background: `--bg-base`.
- Cards: `--bg-surface`, `--border`, target 8-16px radius.
- Text: `--text-primary`, `--text-secondary`.
- Status colors come only from `lib/statusColors.ts`.
- Graph preview uses the same graph component, but it is visually subordinate to the dashboard grid.
- Avoid right-rail-only layout; the dashboard must scan as a complete workspace.

## Acceptance Notes

- The student should understand destination, bottleneck, alignment, cuts, and next actions without opening the map.
- The expanded map is for exploration, not the only usable dashboard surface.
- Opportunity Checker stays embedded on dashboard while `/opportunity/[planId]` remains a secondary route.
