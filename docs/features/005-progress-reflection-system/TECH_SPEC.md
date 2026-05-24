# Feature Tech Spec: Progress + Reflection System

## Status
Draft

## Related Docs
- Feature PRD: `docs/features/005-progress-reflection-system/PRD.md`
- Upstream: `004-weekly-execution-system`, `002-degree-roadmap-engine`

## Technical Summary
PATCH task status endpoints; on transition to `completed`, require reflection body. Transactionally update roadmap node status and append reflection row.

## Files Expected to Change
- `src/app/api/tasks/[id]/route.ts`
- `src/app/api/reflections/route.ts`
- `src/components/tasks/CompleteTaskModal.tsx`
- `src/components/dashboard/ProgressSummary.tsx`
- `src/lib/progress/updateNodeFromTask.ts`

## Data Model

```ts
type Reflection = {
  id: string;
  studentId: string;
  taskId: string;
  linkedNodeId: string;
  content: string; // min 50 chars enforced
  artifactUrl?: string;
  createdAt: string;
};

type ProgressSummary = {
  tasksCompletedThisWeek: number;
  tasksTotalThisWeek: number;
  nodesCompleted: number;
  nodesTotal: number;
};
```

## API / Server Logic
- `PATCH /api/tasks/:id` — body: `{ status }`; if `completed`, require `reflection` in same request or two-step flow
- `POST /api/reflections` — optional separate create linked to task
- `GET /api/progress/summary` — aggregates for dashboard widget
- Internal: `updateNodeFromTask(roadmapId, linkedNodeId, status)`

## Node Update Rules
| Tasks completed for node | Node status |
|--------------------------|-------------|
| 0 | `not_started` |
| Some in_progress | `in_progress` |
| Required task(s) completed + reflection | `completed` |

(MVP: one task per node simplifies to binary completion.)

## State Management
- Modal local state for reflection draft
- On success: invalidate weekly plan + roadmap queries
- Error: show retry if node update fails after task save (use transaction)

## Validation
- Reflection `content` min length 50 characters
- Task must belong to authenticated student
- Cannot complete already `completed` task

## Testing / Verification
- [ ] Complete without reflection → 400
- [ ] Complete with reflection → task + node updated
- [ ] Progress summary counts correct
- [ ] Typecheck/lint/build pass
