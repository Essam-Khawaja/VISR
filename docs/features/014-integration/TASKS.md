# TASKS: Integration

## 1. Documentation And Schema

- [ ] Add `strategy_tasks` to `db/schema.sql`.
- [ ] Make `docs/supabase-schema.sql` point to or mirror `db/schema.sql`.
- [ ] Document setup steps in feature docs and README.
- [ ] Add TypeScript `StrategyTask` types.
- [ ] Add Zod schemas for task create/update/query.

## 2. App Shell Unification

- [ ] Replace the root two-perspective landing page with one Pathwise entry.
- [ ] Add unified navigation: Today, Week, Strategy Map, Opportunities, Settings.
- [ ] Keep `/1` and `/2` route compatibility with redirects during transition.
- [ ] Remove language that describes the product as two separate perspectives.

## 3. Task Store

- [ ] Create task store helpers for local cache and Supabase sync.
- [ ] Implement `loadTasks`, `fetchTasksFromSupabase`, `createStrategyTask`, `updateStrategyTask`, `deleteStrategyTask`.
- [ ] Add task filters for date, date range, parent node, and parent task.
- [ ] Add localStorage migration from plan actions / recursive children / actionStates to canonical tasks.
- [ ] Keep demo fallback working without Supabase.

## 4. API Routes

- [ ] Add `GET /api/2/tasks`.
- [ ] Add `POST /api/2/tasks`.
- [ ] Add `PATCH /api/2/tasks/[taskId]`.
- [ ] Validate all task request bodies with Zod.
- [ ] Return structured errors.
- [ ] Keep all service-role writes server-side if needed.

## 5. Strategy Map Task Dialog

- [ ] Require due date when adding a task from any node.
- [ ] Add priority selector.
- [ ] Show task due date and overdue state.
- [ ] Add mark done/reopen controls.
- [ ] Make AI-generated tasks editable for due date before insertion.
- [ ] Write new tasks to canonical `strategy_tasks`, not `ActionNode.children`.

## 6. Graph Rollup And Progress

- [ ] Compute node rollups from canonical tasks.
- [ ] Mark parent node complete when all direct children are done.
- [ ] Replace linear progress with circular ring around nodes.
- [ ] Use darker ring color than node fill.
- [ ] Update graph node status visuals from rollup.
- [ ] Ensure goal, pillar, and task nodes all support ring rendering.

## 7. Text-In-Node Graph Rendering

- [ ] Replace floating primary labels with text inside nodes.
- [ ] Add text measurement/wrapping helper.
- [ ] Dynamically size node dimensions by label length.
- [ ] Update layout spacing to account for measured node size.
- [ ] Apply to full map, preview map, onboarding map, and focused maps.
- [ ] Test long labels at desktop and mobile widths.

## 8. Daily / Week Sync

- [x] Add Strategy Tasks section to Today view.
- [x] Fetch tasks by selected date from active plan (not AI `nextSevenDays`).
- [x] Mark done/reopen from Today.
- [x] Add strategy task chips to Week view day cells.
- [x] Fetch tasks by week range from active plan.
- [ ] Clicking a strategy task opens task detail or Strategy Map context.
- [ ] Confirm date mapping avoids timezone off-by-one errors.

## 9. Task Source Unification (Dashboard)

- [x] Dashboard Next 7 days reads real `StrategyTask[]` due in next 7 days.
- [x] Semester progress replaces alignment score on dashboard.
- [x] Open today focus navigates to `/1` (not overlay).
- [x] Remove Opportunities from sidebar (embedded on dashboard).
- [x] Stop materializing AI `nextSevenDays` for real plans.
- [x] Intelligence dock uses real strategy tasks.

## 9. Verification

- [ ] Add task on Strategy Map for today -> appears Today.
- [ ] Add task on Strategy Map for future date -> appears Week on correct day.
- [ ] Complete in Today -> graph node ring updates.
- [ ] Complete in graph -> Today/Week updates.
- [ ] All child tasks done -> parent node visually complete.
- [ ] Long node text remains inside node.
- [ ] Demo works without Supabase.
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`

