"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/strategyweb/ui/Badge";
import type { ActionNode, StrategicPillar } from "@/lib/strategyweb/types";
import type { ActionState } from "@/lib/strategyweb/planStore";

const PILLAR_PASTELS = [
  "#933B5B", // amaranth
  "#B5728A", // thulian
  "#9F9679", // pomelo olive
  "#8A9A5B", // sage
  "#AABAAE", // brook green
  "#C4A882", // chalk-dark
];

type Column = "todo" | "doing" | "done";

const COLUMNS: {
  key: Column;
  label: string;
  stateMatch: (s: ActionState | undefined) => boolean;
}[] = [
  { key: "todo", label: "To Do", stateMatch: (s) => !s || s === "open" },
  { key: "doing", label: "Doing", stateMatch: (s) => s === "doing" },
  { key: "done", label: "Done", stateMatch: (s) => s === "done" },
];

type BreadcrumbEntry = { id: string; name: string };

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

function stateForColumn(col: Column): ActionState {
  if (col === "todo") return "open";
  if (col === "doing") return "doing";
  return "done";
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
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);

  const currentParentId =
    breadcrumb.length > 0
      ? breadcrumb[breadcrumb.length - 1].id
      : pillar.id;

  const currentTasks: ActionNode[] =
    breadcrumb.length === 0
      ? pillar.actions
      : findActionDeep(pillar.actions, currentParentId)?.children ?? [];

  const drillInto = useCallback((action: ActionNode) => {
    setBreadcrumb((prev) => [...prev, { id: action.id, name: action.name }]);
  }, []);

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

  const handleDragStart = useCallback((taskId: string) => {
    setDragTaskId(taskId);
  }, []);

  const handleDrop = useCallback(
    (targetCol: Column) => {
      if (dragTaskId) {
        markAction(dragTaskId, stateForColumn(targetCol));
        setDragTaskId(null);
      }
    },
    [dragTaskId, markAction],
  );

  const pastel = PILLAR_PASTELS[pillarIndex % PILLAR_PASTELS.length];

  const tasksWithDue = useMemo(() => {
    const collect = (actions: ActionNode[]): ActionNode[] => {
      const result: ActionNode[] = [];
      for (const a of actions) {
        if (a.dueDate) result.push(a);
        if (a.children) result.push(...collect(a.children));
      }
      return result;
    };
    return collect(pillar.actions);
  }, [pillar.actions]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-1.5 border-b border-border bg-surface px-5 py-3">
        <Link
          href={`/strategyweb/dashboard/${planId}`}
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

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Kanban columns */}
        <div className="flex min-w-0 flex-1 gap-4 overflow-x-auto p-5">
          {COLUMNS.map((col) => {
            const tasks = currentTasks.filter((t) =>
              col.stateMatch(actionStates[t.id]),
            );
            return (
              <KanbanColumn
                key={col.key}
                column={col}
                tasks={tasks}
                actionStates={actionStates}
                isDragging={!!dragTaskId}
                onDrop={() => handleDrop(col.key)}
                onDragStart={handleDragStart}
                onMove={(taskId, targetCol) =>
                  markAction(taskId, stateForColumn(targetCol))
                }
                onDrillIn={drillInto}
                onAddClick={
                  col.key === "todo" ? () => setAdding(true) : undefined
                }
                addForm={
                  col.key === "todo" && adding ? (
                    <AddTaskForm
                      value={newTaskName}
                      onChange={setNewTaskName}
                      onSubmit={handleAdd}
                      onCancel={() => {
                        setAdding(false);
                        setNewTaskName("");
                      }}
                    />
                  ) : null
                }
              />
            );
          })}
        </div>

        {/* Calendar panel */}
        <div className="w-[280px] shrink-0 border-l border-border bg-surface">
          <CalendarPanel
            tasks={tasksWithDue}
            actionStates={actionStates}
          />
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  column,
  tasks,
  actionStates,
  isDragging,
  onDrop,
  onDragStart,
  onMove,
  onDrillIn,
  onAddClick,
  addForm,
}: {
  column: (typeof COLUMNS)[number];
  tasks: ActionNode[];
  actionStates: Record<string, ActionState>;
  isDragging: boolean;
  onDrop: () => void;
  onDragStart: (id: string) => void;
  onMove: (taskId: string, col: Column) => void;
  onDrillIn: (action: ActionNode) => void;
  onAddClick?: () => void;
  addForm: React.ReactNode;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={
        "flex min-w-[260px] flex-1 flex-col rounded-xl border transition-colors " +
        (dragOver && isDragging
          ? "border-accent bg-accent-soft/30"
          : "border-border bg-elevated/50")
      }
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onDrop();
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-semibold text-primary">
            {column.label}
          </h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-surface px-1.5 text-[11px] font-medium text-tertiary">
            {tasks.length}
          </span>
        </div>
        {onAddClick ? (
          <button
            type="button"
            onClick={onAddClick}
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
        {addForm}
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            currentColumn={column.key}
            actionStates={actionStates}
            onMove={(targetCol) => onMove(task.id, targetCol)}
            onDrillIn={
              task.children && task.children.length > 0
                ? () => onDrillIn(task)
                : undefined
            }
            onDragStart={() => onDragStart(task.id)}
          />
        ))}
        {tasks.length === 0 && !addForm ? (
          <p className="py-8 text-center text-[12px] text-tertiary">
            {isDragging ? "Drop here" : "No tasks"}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function AddTaskForm({
  value,
  onChange,
  onSubmit,
  onCancel,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-lg border border-accent/40 bg-surface p-3">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Task name..."
        autoFocus
        className="w-full rounded-md border border-border bg-base px-2.5 py-1.5 text-[13px] text-primary placeholder:text-tertiary focus:border-accent focus:outline-none"
      />
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim()}
          className="rounded-md bg-accent px-3 py-1 text-[12px] font-medium text-white disabled:opacity-40"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-3 py-1 text-[12px] font-medium text-tertiary hover:text-primary"
        >
          Cancel
        </button>
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
  onDragStart,
}: {
  task: ActionNode;
  currentColumn: Column;
  actionStates: Record<string, ActionState>;
  onMove: (col: Column) => void;
  onDrillIn?: () => void;
  onDragStart: () => void;
}) {
  const childCount = task.children?.length ?? 0;
  const childDone = task.children
    ? task.children.filter((c) => actionStates[c.id] === "done").length
    : 0;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      className="group cursor-grab rounded-lg border border-border bg-surface p-3 shadow-soft transition-shadow active:cursor-grabbing hover:shadow-card"
    >
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

// --- Calendar Panel ---

function CalendarPanel({
  tasks,
  actionStates,
}: {
  tasks: ActionNode[];
  actionStates: Record<string, ActionState>;
}) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const dueDateMap = useMemo(() => {
    const map: Record<string, ActionNode[]> = {};
    for (const t of tasks) {
      if (!t.dueDate) continue;
      const d = new Date(t.dueDate);
      if (d.getMonth() === viewMonth && d.getFullYear() === viewYear) {
        const key = d.getDate().toString();
        if (!map[key]) map[key] = [];
        map[key].push(t);
      }
    }
    return map;
  }, [tasks, viewMonth, viewYear]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" },
  );

  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-[13px] font-semibold text-primary">Calendar</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-6 w-6 items-center justify-center rounded-md text-tertiary hover:bg-elevated hover:text-primary"
            aria-label="Previous month"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="min-w-[110px] text-center text-[12px] font-medium text-primary">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-6 w-6 items-center justify-center rounded-md text-tertiary hover:bg-elevated hover:text-primary"
            aria-label="Next month"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-3 pt-3">
        <div className="grid grid-cols-7 gap-0">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div
              key={d}
              className="pb-2 text-center text-[10px] font-semibold text-tertiary"
            >
              {d}
            </div>
          ))}
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayTasks = dueDateMap[day.toString()];
            const hasTasks = dayTasks && dayTasks.length > 0;
            return (
              <div
                key={day}
                className={
                  "relative flex h-8 items-center justify-center text-[11px] " +
                  (isToday(day)
                    ? "font-bold text-accent"
                    : "text-primary")
                }
              >
                {day}
                {hasTasks ? (
                  <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-3 my-2 h-px bg-border" />

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-tertiary">
          Upcoming
        </p>
        {tasks
          .filter((t) => {
            if (!t.dueDate) return false;
            const d = new Date(t.dueDate);
            return d >= today;
          })
          .sort(
            (a, b) =>
              new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime(),
          )
          .slice(0, 10)
          .map((task) => {
            const state = actionStates[task.id];
            const isDone = state === "done";
            return (
              <div
                key={task.id}
                className="flex items-center gap-2 rounded-md py-1.5"
              >
                <span
                  className={
                    "h-1.5 w-1.5 shrink-0 rounded-full " +
                    (isDone ? "bg-success" : "bg-accent")
                  }
                />
                <span
                  className={
                    "min-w-0 flex-1 truncate text-[11px] " +
                    (isDone
                      ? "text-tertiary line-through"
                      : "text-primary")
                  }
                >
                  {task.name}
                </span>
                <span className="shrink-0 text-[10px] text-tertiary">
                  {formatDate(task.dueDate!)}
                </span>
              </div>
            );
          })}
        {tasks.filter((t) => t.dueDate && new Date(t.dueDate) >= today)
          .length === 0 ? (
          <p className="py-4 text-center text-[11px] text-tertiary">
            No upcoming dates
          </p>
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
