import { createSupabaseAnonClient } from "@/lib/shared/supabase";
import type {
  ActionItem,
  Priority,
  StrategyPlan,
  StrategyTask,
  StrategyTaskParentKind,
  StrategyTaskSource,
  StrategyTaskStatus,
} from "./types";

export type TaskFilters = {
  planId: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  parentNodeId?: string;
  parentTaskId?: string;
};

export type CreateStrategyTaskInput = {
  planId: string;
  studentId?: string | null;
  parentNodeId: string;
  parentNodeKind: StrategyTaskParentKind;
  parentTaskId?: string | null;
  title: string;
  recommendation?: string;
  notes?: string;
  priority?: Priority;
  dueDate: string;
  source?: StrategyTaskSource;
  sourceActionId?: string | null;
  graphNodeId?: string | null;
  sortOrder?: number;
};

export type UpdateStrategyTaskInput = Partial<
  Pick<
    StrategyTask,
    "title" | "recommendation" | "notes" | "priority" | "status" | "dueDate"
    | "graphNodeId"
  >
>;

export type NodeRollup = {
  childCount: number;
  doneCount: number;
  completionRatio: number;
  derivedStatus: StrategyTaskStatus;
};

type MatchedAction = {
  pillarId: string;
  actionId: string;
};

const KEY_MIGRATED = "pathwise.tasks.migrated.v1";
const taskKey = (planId: string) => `pathwise.tasks.${planId}`;

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function nowIso(): string {
  return new Date().toISOString();
}

function isDemoOrPreview(planId: string): boolean {
  return planId.startsWith("demo-") || planId === "onboarding-preview";
}

export function loadTasks(planId: string): StrategyTask[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(taskKey(planId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((task): task is StrategyTask => isStrategyTaskLike(task))
      : [];
  } catch {
    return [];
  }
}

export function saveTasks(planId: string, tasks: StrategyTask[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(taskKey(planId), JSON.stringify(tasks));
  } catch {}
}

export async function fetchTasksFromSupabase(
  filters: TaskFilters,
): Promise<StrategyTask[]> {
  if (isDemoOrPreview(filters.planId)) return loadTasks(filters.planId);
  const sb = createSupabaseAnonClient();
  if (!sb) return loadTasks(filters.planId);

  try {
    let query = sb
      .from("strategy_tasks")
      .select("*")
      .eq("plan_id", filters.planId)
      .order("due_date", { ascending: true })
      .order("sort_order", { ascending: true });

    if (filters.date) query = query.eq("due_date", filters.date);
    if (filters.dateFrom) query = query.gte("due_date", filters.dateFrom);
    if (filters.dateTo) query = query.lte("due_date", filters.dateTo);
    if (filters.parentNodeId) {
      query = query.eq("parent_node_id", filters.parentNodeId);
    }
    if (filters.parentTaskId) query = query.eq("parent_task_id", filters.parentTaskId);

    const { data, error } = await query;
    if (error || !data) return applyFilters(loadTasks(filters.planId), filters);
    const tasks = data.map(rowToTask).filter(Boolean) as StrategyTask[];
    const merged = mergeTasks(loadTasks(filters.planId), tasks);
    saveTasks(filters.planId, merged);
    return applyFilters(merged, filters);
  } catch {
    return applyFilters(loadTasks(filters.planId), filters);
  }
}

export async function createStrategyTask(
  input: CreateStrategyTaskInput,
): Promise<StrategyTask> {
  const now = nowIso();
  const task: StrategyTask = {
    id: randomId(),
    planId: input.planId,
    studentId: input.studentId ?? null,
    parentNodeId: input.parentNodeId,
    parentNodeKind: input.parentNodeKind,
    parentTaskId: input.parentTaskId ?? null,
    title: input.title,
    recommendation: input.recommendation ?? "",
    notes: input.notes ?? "",
    priority: input.priority ?? "Medium",
    status: "open",
    dueDate: input.dueDate,
    completedAt: null,
    source: input.source ?? "strategy_map",
    sourceActionId: input.sourceActionId ?? null,
    graphNodeId: input.graphNodeId ?? null,
    sortOrder: input.sortOrder ?? 0,
    createdAt: now,
    updatedAt: now,
  };

  const next = mergeTasks(loadTasks(input.planId), [task]);
  saveTasks(input.planId, next);
  void upsertTask(task);
  return task;
}

export async function updateStrategyTask(
  planId: string,
  taskId: string,
  patch: UpdateStrategyTaskInput,
): Promise<StrategyTask | null> {
  const tasks = loadTasks(planId);
  const existing = tasks.find((task) => task.id === taskId);
  if (!existing) return null;
  const status = patch.status ?? existing.status;
  const nextTask: StrategyTask = {
    ...existing,
    ...patch,
    status,
    completedAt:
      status === "done"
        ? existing.completedAt ?? nowIso()
        : status === "open" || status === "doing"
          ? null
          : existing.completedAt,
    updatedAt: nowIso(),
  };
  saveTasks(planId, mergeTasks(tasks.filter((task) => task.id !== taskId), [nextTask]));
  void upsertTask(nextTask);
  return nextTask;
}

export async function deleteStrategyTask(
  planId: string,
  taskId: string,
): Promise<void> {
  saveTasks(
    planId,
    loadTasks(planId).filter(
      (task) => task.id !== taskId && task.parentTaskId !== taskId,
    ),
  );
  if (isDemoOrPreview(planId)) return;
  const sb = createSupabaseAnonClient();
  if (!sb) return;
  try {
    await sb.from("strategy_tasks").delete().eq("id", taskId);
  } catch {}
}

export function tasksForDate(tasks: StrategyTask[], date: string): StrategyTask[] {
  return tasks.filter((task) => task.dueDate === date);
}

export function tasksForRange(
  tasks: StrategyTask[],
  dateFrom: string,
  dateTo: string,
): StrategyTask[] {
  return tasks.filter((task) => task.dueDate >= dateFrom && task.dueDate <= dateTo);
}

export function tasksForNode(
  tasks: StrategyTask[],
  nodeId: string,
): StrategyTask[] {
  return tasks.filter(
    (task) => task.parentNodeId === nodeId || task.parentTaskId === nodeId,
  );
}

export function computeNodeRollup(
  nodeId: string,
  tasks: StrategyTask[],
): NodeRollup {
  const children = tasksForNode(tasks, nodeId);
  const childCount = children.length;
  const doneCount = children.filter((task) => task.status === "done").length;
  const skippedCount = children.filter((task) => task.status === "skipped").length;
  const doingCount = children.filter((task) => task.status === "doing").length;
  const completionRatio = childCount > 0 ? doneCount / childCount : 0;
  const derivedStatus: StrategyTaskStatus =
    childCount === 0
      ? "open"
      : doneCount === childCount
        ? "done"
        : skippedCount === childCount
          ? "skipped"
          : doingCount > 0 || doneCount > 0
            ? "doing"
            : "open";

  return { childCount, doneCount, completionRatio, derivedStatus };
}

export function hasMigratedStrategyTasks(): boolean {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(KEY_MIGRATED) === "1";
}

export function markStrategyTasksMigrated(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(KEY_MIGRATED, "1");
  } catch {}
}

export function todayLocalDate(): string {
  const d = new Date();
  return formatLocalDate(d);
}

export function addLocalDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + days);
  return formatLocalDate(d);
}

export function materializeStrategyTasks(
  plan: StrategyPlan,
  baseDate = todayLocalDate(),
): StrategyTask[] {
  return plan.nextSevenDays.map((item, index) => {
    const now = nowIso();
    const match = findMatchingAction(plan, item);
    const dueDate = dueDateForAction(item.priority, index, baseDate);
    return {
      id: stableTaskId(plan.id, item.id, index),
      planId: plan.id,
      studentId: plan.studentId,
      parentNodeId: match?.pillarId ?? "goal",
      parentNodeKind: match ? "pillar" : "goal",
      parentTaskId: null,
      title: item.title,
      recommendation: "",
      notes: "",
      priority: item.priority,
      status: "open",
      dueDate,
      completedAt: null,
      source: "generated_plan",
      sourceActionId: match?.actionId ?? item.id,
      sortOrder: index,
      createdAt: now,
      updatedAt: now,
    };
  });
}

export function ensureMaterializedTasks(plan: StrategyPlan): StrategyTask[] {
  const existing = loadTasks(plan.id);
  if (existing.length > 0) return existing;
  const tasks = materializeStrategyTasks(plan);
  saveTasks(plan.id, tasks);
  return tasks;
}

export function migrateActionStatesToTasks(
  planId: string,
  actionStates: Record<string, StrategyTaskStatus>,
): StrategyTask[] {
  const tasks = loadTasks(planId);
  if (tasks.length === 0) return tasks;
  let changed = false;
  const next = tasks.map((task) => {
    const legacyState =
      actionStates[task.sourceActionId ?? ""] ?? actionStates[task.id];
    if (!legacyState || legacyState === task.status) return task;
    changed = true;
    return {
      ...task,
      status: legacyState,
      completedAt: legacyState === "done" ? task.completedAt ?? nowIso() : null,
      updatedAt: nowIso(),
    };
  });
  if (changed) saveTasks(planId, next);
  return next;
}

function mergeTasks(
  existing: StrategyTask[],
  incoming: StrategyTask[],
): StrategyTask[] {
  const map = new Map<string, StrategyTask>();
  for (const task of existing) map.set(task.id, task);
  for (const task of incoming) map.set(task.id, task);
  return [...map.values()].sort(
    (a, b) =>
      a.dueDate.localeCompare(b.dueDate) ||
      a.sortOrder - b.sortOrder ||
      a.createdAt.localeCompare(b.createdAt),
  );
}

function formatLocalDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function stableTaskId(planId: string, actionItemId: string, index: number): string {
  return `${planId}-task-${actionItemId || index}`.replace(/[^a-zA-Z0-9-]/g, "-");
}

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

function findMatchingAction(
  plan: StrategyPlan,
  item: ActionItem,
): MatchedAction | null {
  const title = normalizeTitle(item.title);
  for (const pillar of plan.strategicPillars) {
    for (const action of pillar.actions) {
      if (normalizeTitle(action.name) === title) {
        return { pillarId: pillar.id, actionId: action.id };
      }
    }
  }
  return null;
}

function dueDateForAction(
  priority: Priority,
  index: number,
  baseDate: string,
): string {
  if (priority === "High") return addLocalDays(baseDate, Math.min(index, 1));
  if (priority === "Medium") return addLocalDays(baseDate, 2 + (index % 4));
  return addLocalDays(baseDate, 5 + (index % 3));
}

function applyFilters(tasks: StrategyTask[], filters: TaskFilters): StrategyTask[] {
  let result = tasks.filter((task) => task.planId === filters.planId);
  if (filters.date) result = tasksForDate(result, filters.date);
  if (filters.dateFrom && filters.dateTo) {
    result = tasksForRange(result, filters.dateFrom, filters.dateTo);
  } else if (filters.dateFrom) {
    result = result.filter((task) => task.dueDate >= filters.dateFrom!);
  } else if (filters.dateTo) {
    result = result.filter((task) => task.dueDate <= filters.dateTo!);
  }
  if (filters.parentNodeId) {
    result = result.filter((task) => task.parentNodeId === filters.parentNodeId);
  }
  if (filters.parentTaskId) {
    result = result.filter((task) => task.parentTaskId === filters.parentTaskId);
  }
  return result;
}

async function upsertTask(task: StrategyTask): Promise<void> {
  if (isDemoOrPreview(task.planId)) return;
  const sb = createSupabaseAnonClient();
  if (!sb) return;
  try {
    await sb.from("strategy_tasks").upsert(taskToRow(task), { onConflict: "id" });
  } catch {}
}

function isStrategyTaskLike(value: unknown): value is StrategyTask {
  if (!value || typeof value !== "object") return false;
  const task = value as Partial<StrategyTask>;
  return Boolean(task.id && task.planId && task.title && task.dueDate);
}

export function taskToRow(task: StrategyTask) {
  return {
    id: task.id,
    plan_id: task.planId,
    student_id: task.studentId ?? null,
    parent_node_id: task.parentNodeId,
    parent_node_kind: task.parentNodeKind,
    parent_task_id: task.parentTaskId ?? null,
    title: task.title,
    recommendation: task.recommendation,
    notes: task.notes,
    priority: task.priority,
    status: task.status,
    due_date: task.dueDate,
    completed_at: task.completedAt ?? null,
    source: task.source,
    source_action_id: task.sourceActionId ?? null,
    graph_node_id: task.graphNodeId ?? null,
    sort_order: task.sortOrder,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  };
}

export function rowToTask(row: Record<string, unknown>): StrategyTask | null {
  if (!row.id || !row.plan_id || !row.title || !row.due_date) return null;
  return {
    id: String(row.id),
    planId: String(row.plan_id),
    studentId: row.student_id ? String(row.student_id) : null,
    parentNodeId: String(row.parent_node_id ?? "goal"),
    parentNodeKind: String(row.parent_node_kind ?? "goal") as StrategyTaskParentKind,
    parentTaskId: row.parent_task_id ? String(row.parent_task_id) : null,
    title: String(row.title),
    recommendation: String(row.recommendation ?? ""),
    notes: String(row.notes ?? ""),
    priority: String(row.priority ?? "Medium") as Priority,
    status: String(row.status ?? "open") as StrategyTaskStatus,
    dueDate: String(row.due_date),
    completedAt: row.completed_at ? String(row.completed_at) : null,
    source: String(row.source ?? "strategy_map") as StrategyTaskSource,
    sourceActionId: row.source_action_id ? String(row.source_action_id) : null,
    graphNodeId: row.graph_node_id ? String(row.graph_node_id) : null,
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: String(row.created_at ?? nowIso()),
    updatedAt: String(row.updated_at ?? nowIso()),
  };
}
