"use client";

import { useCallback, useState } from "react";
import { usePlan } from "./PlanProvider";
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

type Props = {
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export function ProjectSidebar({ collapsed, onToggleCollapse }: Props) {
  const { plan, stored, markAction, addTasks } = usePlan();

  if (collapsed) {
    return (
      <aside className="flex h-full w-12 shrink-0 flex-col border-r border-border bg-surface">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-12 w-12 items-center justify-center text-tertiary hover:text-primary"
          aria-label="Expand projects"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 3l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <h2 className="text-[13px] font-semibold text-primary">Projects</h2>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-7 w-7 items-center justify-center rounded-md text-tertiary hover:bg-elevated hover:text-primary"
          aria-label="Collapse projects"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M8 2L3 7l5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {plan.strategicPillars.map((pillar, i) => (
          <PillarSection
            key={pillar.id}
            pillar={pillar}
            color={PILLAR_PASTELS[i % PILLAR_PASTELS.length]}
            actionStates={stored.actionStates}
            onToggleAction={markAction}
            onAddTasks={addTasks}
          />
        ))}
      </div>
    </aside>
  );
}

function PillarSection({
  pillar,
  color,
  actionStates,
  onToggleAction,
  onAddTasks,
}: {
  pillar: StrategicPillar;
  color: string;
  actionStates: Record<string, ActionState>;
  onToggleAction: (id: string, state: ActionState) => void;
  onAddTasks: (
    parentId: string,
    tasks: { name: string; recommendation: string }[],
  ) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");

  const done = pillar.actions.filter(
    (a) => actionStates[a.id] === "done",
  ).length;
  const total = pillar.actions.length;

  const handleAdd = useCallback(() => {
    const trimmed = newTaskName.trim();
    if (!trimmed) return;
    onAddTasks(pillar.id, [
      { name: trimmed, recommendation: "User-created task" },
    ]);
    setNewTaskName("");
    setAdding(false);
  }, [newTaskName, pillar.id, onAddTasks]);

  return (
    <div className="border-b border-border/60">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-elevated/50"
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-primary">
          {pillar.name}
        </span>
        <span className="shrink-0 text-[11px] font-medium text-tertiary">
          {done}/{total}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={
            "shrink-0 text-tertiary transition-transform " +
            (expanded ? "rotate-90" : "")
          }
        >
          <path
            d="M4 2l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {expanded ? (
        <div className="pb-2">
          {pillar.actions.length === 0 ? (
            <p className="px-4 py-2 text-[11px] text-tertiary">
              No tasks yet
            </p>
          ) : null}

          {pillar.actions.map((action) => (
            <TaskRow
              key={action.id}
              action={action}
              depth={0}
              actionStates={actionStates}
              onToggleAction={onToggleAction}
            />
          ))}

          {adding ? (
            <div className="flex items-center gap-1.5 px-4 py-1">
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
                className="min-w-0 flex-1 rounded-md border border-border bg-base px-2 py-1 text-[12px] text-primary placeholder:text-tertiary focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={!newTaskName.trim()}
                className="rounded-md bg-accent px-2 py-1 text-[11px] font-medium text-white disabled:opacity-40"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="mx-4 mt-1 flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-tertiary transition-colors hover:text-accent"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 2v8M2 6h8"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
              Add task
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function TaskRow({
  action,
  depth,
  actionStates,
  onToggleAction,
}: {
  action: ActionNode;
  depth: number;
  actionStates: Record<string, ActionState>;
  onToggleAction: (id: string, state: ActionState) => void;
}) {
  const [childrenOpen, setChildrenOpen] = useState(false);
  const state = actionStates[action.id] ?? "open";
  const isDone = state === "done";
  const hasChildren = action.children && action.children.length > 0;

  return (
    <>
      <div
        className="group flex items-center gap-2 px-4 py-1.5 transition-colors hover:bg-elevated/30"
        style={{ paddingLeft: `${16 + depth * 16}px` }}
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={isDone}
          onClick={() => onToggleAction(action.id, isDone ? "open" : "done")}
          className={
            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors " +
            (isDone
              ? "border-success bg-success text-white"
              : "border-border-strong bg-surface text-transparent hover:border-primary")
          }
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path
              d="M1.5 4.5L3.5 6.5L7.5 2.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span
          className={
            "min-w-0 flex-1 truncate text-[12px] " +
            (isDone ? "text-tertiary line-through" : "text-primary")
          }
        >
          {action.name}
        </span>
        {action.dueDate ? (
          <span className="shrink-0 text-[10px] text-tertiary">
            {formatDate(action.dueDate)}
          </span>
        ) : null}
        {action.priority ? (
          <span
            className={
              "shrink-0 text-[10px] font-medium " +
              (action.priority === "High"
                ? "text-danger"
                : action.priority === "Medium"
                  ? "text-warning"
                  : "text-tertiary")
            }
          >
            {action.priority === "High"
              ? "!"
              : action.priority === "Medium"
                ? "~"
                : ""}
          </span>
        ) : null}
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setChildrenOpen((v) => !v)}
            className="shrink-0 rounded p-0.5 text-tertiary opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary"
            aria-label="Toggle subtasks"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              className={
                "transition-transform " + (childrenOpen ? "rotate-90" : "")
              }
            >
              <path
                d="M3 1.5l3.5 3.5L3 8.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : null}
      </div>

      {hasChildren && childrenOpen
        ? action.children!.map((child) => (
            <TaskRow
              key={child.id}
              action={child}
              depth={depth + 1}
              actionStates={actionStates}
              onToggleAction={onToggleAction}
            />
          ))
        : null}
    </>
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
