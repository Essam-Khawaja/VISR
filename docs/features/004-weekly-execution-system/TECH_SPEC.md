# Feature Tech Spec: Weekly Execution System

## Status
Draft

## Related Docs
- Feature PRD: `docs/features/004-weekly-execution-system/PRD.md`
- Upstream: `002-degree-roadmap-engine`, `001-user-foundation`

## Technical Summary
`generateWeeklyPlan(roadmap, profile, progressSnapshot): WeeklyPlan` selects nodes ready for action, materializes human-readable task titles, persists plan per student per ISO week.

## Files Expected to Change
- `src/lib/tasks/weeklyGenerator.ts`
- `src/app/api/weekly-plan/route.ts`
- `src/app/dashboard/page.tsx`
- `src/components/tasks/WeeklyTaskList.tsx`
- `src/lib/types.ts` — `WeeklyPlan`, `Task`

## Data Model

```ts
type TaskStatus = "pending" | "in_progress" | "completed" | "skipped";

type Task = {
  id: string;
  weeklyPlanId: string;
  title: string;
  description?: string;
  linkedNodeId: string;
  difficulty: "easy" | "medium" | "hard";
  status: TaskStatus;
  dueWeek: number; // ISO week or app week index
  createdAt: string;
};

type WeeklyPlan = {
  id: string;
  studentId: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  tasks: Task[];
  createdAt: string;
};
```

## Generator Logic (MVP)
1. Determine current academic context from `profile.yearOfStudy` and roadmap year focus.
2. Filter nodes: `not_started` or `in_progress`, dependencies satisfied (prerequisite nodes completed).
3. Sort by `priority` desc, then year relevance.
4. Take top N nodes; map to task templates by `node.type`:
   - `club` → "Research and attend an info session for [label]"
   - `project` → "Define scope and first milestone for [label]"
   - `skill` → "Complete intro module / 2h practice for [label]"
   - `course` → "Review syllabus and block study time for [label]"
5. Persist plan; return to client.

## API / Server Logic
- `GET /api/weekly-plan/current` — get or create plan for current week
- `POST /api/weekly-plan/generate` — force regenerate (dev/admin)
- `PATCH /api/tasks/:id` — update task status (may live in Feature 005)

## State Management
- Server owns canonical plan for the week
- Client optimistic updates on status change
- Cron or on-demand: new week triggers new plan if none exists

## Validation
- `linkedNodeId` must exist on student's roadmap
- Max tasks per week enforced server-side

## Testing / Verification
- [ ] First visit of week creates plan with 3–7 tasks
- [ ] Second GET same week returns same plan (idempotent)
- [ ] Tasks reference valid nodes
- [ ] Typecheck/lint/build pass
