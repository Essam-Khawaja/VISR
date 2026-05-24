"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { ActionNode, StrategicPillar } from "@/lib/types";
import type { ActionState } from "@/lib/planStore";

const PILLAR_PASTELS = [
  "#8B4A6B",
  "#9B9267",
  "#B5707E",
  "#C4A882",
  "#8FA68B",
  "#7E6B8A",
];

type Column = "todo" | "doing" | "done";

const COLUMNS: { key: Column; label: string; stateMatch: (s: ActionState | undefined) => boolean }[] = [
  { key: "todo", label: "To Do", stateMatch: (s) => !s || s === "open" },
  { key: "doing", label: "Doing", stateMatch: (s) => s === "doing" },
  { key: "done", label: "Done", stateMatch: (s) => s === "done" },
];

type BreadcrumbEntry = {
  id: string;
  name: string;
};

type Props = {
  pillar: StrategicPillar;
  pillarIndex: number;
  planId: string;
  actionStates: Record<string, ActionState>;
  markAction: (id: string, state: ActionState) => void;
  addTasks: (
    parentId: string,
    tasks: { name: string; recommendation: string }[],
  ) => void;
};

function findActionDeep(
  actions: ActionNode[],
  id: string,
): ActionNode | null {
  for (const a of actions) {
    if (a.id === id) return a;
    if (a.children) {
      const found = findActionDeep(a.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function KanbanBoard({
  pillar,
  pillarIndex,
  planId,
  actionStates,
  markAction,
  addTasks,
}: Props) {
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbEntry[]>([]);
  const [adding, setAdding] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");

  const currentParentId =
    breadcrumb.length > 0
      ? breadcrumb[breadcrumb.length - 1].id
      : pillar.id;

  const currentTasks: ActionNode[] =
    breadcrumb.length === 0
      ? pillar.actions
      : findActionDeep(pillar.actions, currentParentId)?.children ?? [];

  const drillInto = useCallback(
    (action: ActionNode) => {
      setBreadcrumb((prev) => [...prev, { id: action.id, name: action.name }]);
    },
    [],
  );

  const navigateTo = useCallback((index: number) => {
    setBreadcrumb((prev) => prev.slice(0, index));
  }, []);

  const handleAdd = useCallback(() => {
    const trimmed = newTaskName.trim();
    if (!trimmed) return;
    addTasks(currentParentId, [
      { name: trimmed, recommendation: "User-created task" },
    ]);
    setNewTaskName("");
    setAdding(false);
  }, [newTaskName, currentParentId, addTasks]);

  const stateForColumn = (col: Column): ActionState => {
    if (col === "todo") return "open";
    if (col === "doing") return "doing";
    return "done";
  };

  const pastel = PILLAR_PASTELS[pillarIndex % PILLAR_PASTELS.length];

  return (
    <div className="flex h-full flex-col">
      {/* Breadcrumb */}
      <div className="flex shrink-0 items-center gap-1.5 border-b border-border bg-surface px-5 py-3">
        <Link
          href={`/dashboard/${planId}`}
          className="text-[12px] font-medium text-tertiary transition-colors hover:text-primary"
        >
          Plan
        </Link>
        <ChevronSep />
        <button
          type="button"
          onClick={() => navigateTo(0)}
          className={
            "flex items-center gap-1.5 text-[12px] font-medium transition-colors " +
            (breadcrumb.length === 0
              ? "text-primary"
              : "text-tertiary hover:text-primary")
          }
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: pastel }}
          />
          {pillar.name}
        </button>
        {breadcrumb.map((entry, i) => (
          <span key={entry.id} className="flex items-center gap-1.5">
            <ChevronSep />
            <button
              type="button"
              onClick={() => navigateTo(i + 1)}
              className={
                "text-[12px] font-medium transition-colors " +
                (i === breadcrumb.length - 1
                  ? "text-primary"
                  : "text-tertiary hover:text-primary")
              }
            >
              {entry.name}
            </button>
          </span>
        ))}
      </div>

      {/* Kanban columns */}
      <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto p-5">
        {COLUMNS.map((col) => {
          const tasks = currentTasks.filter((t) =>
            col.stateMatch(actionStates[t.id]),
          );
          return (
            <div
              key={col.key}
              className="flex w-[300px] shrink-0 flex-col rounded-xl border border-border bg-elevated/50"
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-semibold text-primary">
                    {col.label}
                  </h3>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-surface px-1.5 text-[11px] font-medium text-tertiary">
                    {tasks.length}
                  </span>
                </div>
                {col.key === "todo" ? (
                  <button
                    type="button"
                    onClick={() => setAdding(true)}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-tertiary transition-colors hover:bg-surface hover:text-primary"
                    aria-label="Add task"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M7 2v10M2 7h10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3">
                {col.key === "todo" && adding ? (
                  <div className="rounded-lg border border-accent/40 bg-surface p-3">
                    <input
                      type="text"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAdd();
                        if (e.key === "Escape") {
                          setAdding(false);
                          setNewTaskName("");
                        }
                      }}
                      placeholder="Task name..."
                      autoFocus
                      className="w-full rounded-md border border-border bg-base px-2.5 py-1.5 text-[13px] text-primary placeholder:text-tertiary focus:border-accent focus:outline-none"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!newTaskName.trim()}
                        className="rounded-md bg-accent px-3 py-1 text-[12px] font-medium text-white disabled:opacity-40"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAdding(false);
                          setNewTaskName("");
                        }}
                        className="rounded-md px-3 py-1 text-[12px] font-medium text-tertiary hover:text-primary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}

                {tasks.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    currentColumn={col.key}
                    actionStates={actionStates}
                    onMove={(targetCol) =>
                      markAction(task.id, stateForColumn(targetCol))
                    }
                    onDrillIn={
                      task.children && task.children.length > 0
                        ? () => drillInto(task)
                        : undefined
                    }
                  />
                ))}

                {tasks.length === 0 && !(col.key === "todo" && adding) ? (
                  <p className="py-8 text-center text-[12px] text-tertiary">
                    No tasks
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanCard({
  task,
  currentColumn,
  actionStates,
  onMove,
  onDrillIn,
}: {
  task: ActionNode;
  currentColumn: Column;
  actionStates: Record<string, ActionState>;
  onMove: (col: Column) => void;
  onDrillIn?: () => void;
}) {
  const childCount = task.children?.length ?? 0;
  const childDone = task.children
    ? task.children.filter((c) => actionStates[c.id] === "done").length
    : 0;

  return (
    <div className="group rounded-lg border border-border bg-surface p-3 shadow-soft transition-shadow hover:shadow-card">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium leading-snug text-primary">
            {task.name}
          </p>
          {task.recommendation ? (
            <p className="mt-1 text-[11px] leading-relaxed text-secondary line-clamp-2">
              {task.recommendation}
            </p>
          ) : null}
        </div>
        {onDrillIn ? (
          <button
            type="button"
            onClick={onDrillIn}
            className="shrink-0 rounded-md p-1 text-tertiary opacity-0 transition-opacity group-hover:opacity-100 hover:bg-elevated hover:text-primary"
            aria-label="View subtasks"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M5 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : null}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {task.priority ? (
          <Badge
            tone={
              task.priority === "High"
                ? "danger"
                : task.priority === "Medium"
                  ? "warning"
                  : "muted"
            }
          >
            {task.priority}
          </Badge>
        ) : null}
        {task.dueDate ? (
          <span className="text-[10px] text-tertiary">
            {formatDate(task.dueDate)}
          </span>
        ) : null}
        {childCount > 0 ? (
          <span className="text-[10px] text-tertiary">
            {childDone}/{childCount} subtasks
          </span>
        ) : null}
      </div>

      <div className="mt-2.5 flex gap-1.5">
        {currentColumn !== "todo" ? (
          <MoveButton onClick={() => onMove("todo")}>To Do</MoveButton>
        ) : null}
        {currentColumn !== "doing" ? (
          <MoveButton onClick={() => onMove("doing")}>Doing</MoveButton>
        ) : null}
        {currentColumn !== "done" ? (
          <MoveButton onClick={() => onMove("done")}>Done</MoveButton>
        ) : null}
      </div>
    </div>
  );
}

function MoveButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-border px-2 py-0.5 text-[10px] font-medium text-tertiary transition-colors hover:border-border-strong hover:text-primary"
    >
      {children}
    </button>
  );
}

function ChevronSep() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      className="shrink-0 text-tertiary"
      aria-hidden
    >
      <path
        d="M3.5 2L6.5 5L3.5 8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}
