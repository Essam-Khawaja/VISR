"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/2/ui/Badge";
import type {
  ActionNode,
  PillarStatus,
  NodeStatus,
  Priority,
  StrategicPillar,
  StrategyPlan,
  StrategyTask,
  StrategyTaskParentKind,
  StrategyTaskStatus,
} from "@/lib/2/types";
import {
  addLocalDays,
  tasksForNode,
  todayLocalDate,
  type CreateStrategyTaskInput,
} from "@/lib/2/taskStore";
import type { GraphSelection } from "./graphTypes";

type Props = {
  plan: StrategyPlan;
  selection: GraphSelection;
  tasks: StrategyTask[];
  onClose: () => void;
  onCreateTask: (input: Omit<CreateStrategyTaskInput, "planId">) => Promise<void>;
  onMarkTask: (taskId: string, state: StrategyTaskStatus) => Promise<void>;
  isDemo: boolean;
};

type ResolvedNode = {
  kind: "pillar" | "action";
  pillar: StrategicPillar;
  node: { id: string; name: string; status: string; recommendation?: string; reason?: string };
  children: ActionNode[];
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

function resolveNode(
  plan: StrategyPlan,
  selection: GraphSelection,
): ResolvedNode | null {
  if (!selection) return null;

  if (selection.nodeId === "goal") {
    const syntheticPillar: StrategicPillar = {
      id: "goal",
      name: plan.destination,
      status: "Strong",
      reason: "Your destination — everything routes through here.",
      actions: [],
    };
    return {
      kind: "pillar",
      pillar: syntheticPillar,
      node: {
        id: "goal",
        name: plan.destination,
        status: "Goal",
        recommendation: "Your destination — everything routes through here.",
      },
      children: plan.strategicPillars.flatMap((p) => p.actions),
    };
  }

  for (const pillar of plan.strategicPillars) {
    if (pillar.id === selection.nodeId) {
      return {
        kind: "pillar",
        pillar,
        node: pillar,
        children: pillar.actions,
      };
    }
    const action = findActionDeep(pillar.actions, selection.nodeId);
    if (action) {
      return {
        kind: "action",
        pillar,
        node: action,
        children: action.children ?? [],
      };
    }
  }
  return null;
}

function statusTone(
  s: string,
): "success" | "warning" | "danger" | "muted" {
  if (s === "Strong" || s === "On Track") return "success";
  if (s === "Okay" || s === "Behind") return "warning";
  if (s === "Weak" || s === "Missing" || s === "At Risk") return "danger";
  return "muted";
}

function parentKindFor(resolved: ResolvedNode): StrategyTaskParentKind {
  if (resolved.node.id === "goal") return "goal";
  return resolved.kind === "pillar" ? "pillar" : "task";
}

function parentTaskFor(
  resolved: ResolvedNode,
  tasks: StrategyTask[],
): string | null {
  if (resolved.kind !== "action") return null;
  const backing = tasks.find(
    (task) =>
      task.id === resolved.node.id || task.sourceActionId === resolved.node.id,
  );
  return backing?.id ?? null;
}

function isOverdue(task: StrategyTask): boolean {
  return task.status !== "done" && task.dueDate < todayLocalDate();
}

function nextStatus(current: StrategyTaskStatus): StrategyTaskStatus {
  return current === "done" ? "open" : "done";
}

export function NodeTaskDialog({
  plan,
  selection,
  tasks,
  onClose,
  onCreateTask,
  onMarkTask,
  isDemo,
}: Props) {
  const reduce = useReducedMotion();
  const resolved = resolveNode(plan, selection);

  return (
    <AnimatePresence>
      {resolved ? (
        <motion.div
          key={resolved.node.id}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
          className="pointer-events-auto absolute bottom-20 left-1/2 z-30 w-[min(460px,calc(100vw-2rem))] -translate-x-1/2 md:bottom-24"
          role="dialog"
          aria-label={`Node detail: ${resolved.node.name}`}
        >
          <DialogInner
            resolved={resolved}
            plan={plan}
            tasks={tasks}
            onClose={onClose}
            onCreateTask={onCreateTask}
            onMarkTask={onMarkTask}
            isDemo={isDemo}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function DialogInner({
  resolved,
  plan,
  tasks,
  onClose,
  onCreateTask,
  onMarkTask,
  isDemo,
}: {
  resolved: ResolvedNode;
  plan: StrategyPlan;
  tasks: StrategyTask[];
  onClose: () => void;
  onCreateTask: (input: Omit<CreateStrategyTaskInput, "planId">) => Promise<void>;
  onMarkTask: (taskId: string, state: StrategyTaskStatus) => Promise<void>;
  isDemo: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"tasks" | "generate">("tasks");

  return (
    <div className="relative rounded-3xl border border-border bg-surface p-5 shadow-card">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close dialog"
        className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-tertiary transition-colors hover:bg-elevated hover:text-primary"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden
        >
          <path
            d="M2 2 L12 12 M12 2 L2 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="flex items-center gap-2">
        <Badge tone={statusTone(resolved.node.status)} dot>
          {resolved.node.status}
        </Badge>
        <span className="text-[11px] font-medium text-tertiary">
          {resolved.kind === "pillar" ? "Pillar" : "Action"}
        </span>
      </div>
      <h2 className="mt-2 font-display text-[20px] font-semibold leading-tight text-primary">
        {resolved.node.name}
      </h2>
      <p className="mt-1 text-[13px] leading-relaxed text-secondary">
        {resolved.node.recommendation ?? resolved.node.reason}
      </p>

      <div
        className="mt-4 flex gap-1 rounded-xl bg-elevated p-1"
        role="tablist"
      >
        <TabButton
          active={activeTab === "tasks"}
          onClick={() => setActiveTab("tasks")}
          label="Tasks"
        />
        <TabButton
          active={activeTab === "generate"}
          onClick={() => setActiveTab("generate")}
          label="AI Generate"
        />
      </div>

      <div className="mt-3">
        {activeTab === "tasks" ? (
          <TasksTab
            resolved={resolved}
            tasks={tasks}
            onCreateTask={onCreateTask}
            onMarkTask={onMarkTask}
            isDemo={isDemo}
          />
        ) : (
          <GenerateTab
            resolved={resolved}
            plan={plan}
            tasks={tasks}
            onCreateTask={onCreateTask}
          />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        "flex-1 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors " +
        (active
          ? "bg-surface text-primary shadow-soft"
          : "text-tertiary hover:text-secondary")
      }
    >
      {label}
    </button>
  );
}

function TasksTab({
  resolved,
  tasks,
  onCreateTask,
  onMarkTask,
  isDemo,
}: {
  resolved: ResolvedNode;
  tasks: StrategyTask[];
  onCreateTask: (input: Omit<CreateStrategyTaskInput, "planId">) => Promise<void>;
  onMarkTask: (taskId: string, state: StrategyTaskStatus) => Promise<void>;
  isDemo: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDueDate, setNewDueDate] = useState(todayLocalDate());
  const [newPriority, setNewPriority] = useState<Priority>("Medium");
  const nodeTasks = tasksForNode(tasks, resolved.node.id);

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed || !newDueDate) return;
    await onCreateTask({
      parentNodeId: resolved.node.id,
      parentNodeKind: parentKindFor(resolved),
      parentTaskId: parentTaskFor(resolved, tasks),
      title: trimmed,
      recommendation: "User-created task",
      dueDate: newDueDate,
      priority: newPriority,
      source: "strategy_map",
    });
    setNewName("");
    setNewDueDate(todayLocalDate());
    setNewPriority("Medium");
    setAdding(false);
  };

  return (
    <div>
      {nodeTasks.length === 0 && !adding ? (
        <p className="py-3 text-center text-[12px] text-tertiary">
          No tasks yet. Add one below or use AI Generate.
        </p>
      ) : (
        <ul className="flex max-h-56 flex-col overflow-y-auto">
          {nodeTasks.map((task) => {
            const done = task.status === "done";
            const overdue = isOverdue(task);
            return (
              <li
                key={task.id}
                className="flex items-start gap-2 border-b border-border/60 py-2 last:border-b-0"
              >
                <CheckboxButton
                  checked={done}
                  label={task.title}
                  onToggle={() => void onMarkTask(task.id, nextStatus(task.status))}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={
                      "text-[13px] leading-snug " +
                      (done ? "text-tertiary line-through" : "text-primary")
                    }
                  >
                    {task.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge tone={task.priority === "High" ? "danger" : task.priority === "Medium" ? "warning" : "muted"}>
                      {task.priority}
                    </Badge>
                    <Badge tone={overdue ? "danger" : done ? "success" : "muted"}>
                      {overdue ? "Overdue" : task.status}
                    </Badge>
                    <span className="text-[11px] text-tertiary">
                      Due {task.dueDate}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {adding ? (
        <div className="mt-3 grid gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleAdd();
              if (e.key === "Escape") {
                setAdding(false);
                setNewName("");
              }
            }}
            placeholder="Task name..."
            autoFocus
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] text-primary placeholder:text-tertiary focus:border-accent focus:outline-none"
          />
          <div className="grid grid-cols-[1fr_auto_auto] gap-2">
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[12px] text-primary focus:border-accent focus:outline-none"
              required
            />
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as Priority)}
              className="rounded-lg border border-border bg-surface px-2 py-1.5 text-[12px] text-primary focus:border-accent focus:outline-none"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <button
              type="button"
              onClick={() => void handleAdd()}
              disabled={!newName.trim() || !newDueDate}
              className="rounded-lg bg-accent px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-40"
            >
              Add
            </button>
          </div>
          {isDemo ? (
            <p className="text-[11px] text-tertiary">
              Demo tasks save locally in this browser.
            </p>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-border py-2 text-[12px] font-medium text-tertiary transition-colors hover:border-accent hover:text-accent"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden
          >
            <path
              d="M7 2v10M2 7h10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Add task
        </button>
      )}
    </div>
  );
}

function GenerateTab({
  resolved,
  plan,
  tasks,
  onCreateTask,
}: {
  resolved: ResolvedNode;
  plan: StrategyPlan;
  tasks: StrategyTask[];
  onCreateTask: (input: Omit<CreateStrategyTaskInput, "planId">) => Promise<void>;
}) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<
    Array<{
      name: string;
      recommendation: string;
      dueDate: string;
      priority: Priority;
      selected: boolean;
    }>
  >([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setPreview([]);

    try {
      const res = await fetch("/api/2/node/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId: resolved.node.id,
          nodeName: resolved.node.name,
          nodeDescription: resolved.node.recommendation ?? resolved.node.reason ?? "",
          parentContext: plan.destination,
          userPrompt: prompt.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to generate tasks");

      const data = (await res.json()) as {
        tasks: Array<{ name: string; recommendation: string }>;
      };
      setPreview(
        data.tasks.map((t, index) => ({
          ...t,
          dueDate: addLocalDays(todayLocalDate(), index),
          priority: index === 0 ? "High" : "Medium",
          selected: true,
        })),
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = async () => {
    const selected = preview.filter((t) => t.selected);
    if (selected.length === 0) return;
    await Promise.all(
      selected.map((task) =>
        onCreateTask({
          parentNodeId: resolved.node.id,
          parentNodeKind: parentKindFor(resolved),
          parentTaskId: parentTaskFor(resolved, tasks),
          title: task.name,
          recommendation: task.recommendation,
          dueDate: task.dueDate,
          priority: task.priority,
          source: "ai",
        }),
      ),
    );
    setPreview([]);
    setPrompt("");
  };

  if (preview.length > 0) {
    return (
      <div>
        <p className="text-[11px] font-medium text-tertiary">
          Generated tasks — uncheck any you don&apos;t want
        </p>
        <ul className="mt-2 flex flex-col gap-1">
          {preview.map((t, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-xl border border-border bg-elevated/50 px-3 py-2"
            >
              <CheckboxButton
                checked={t.selected}
                label={t.name}
                onToggle={() =>
                  setPreview((prev) =>
                    prev.map((p, j) =>
                      j === i ? { ...p, selected: !p.selected } : p,
                    ),
                  )
                }
              />
              <div className="min-w-0 flex-1">
                <span className="text-[13px] font-medium text-primary">
                  {t.name}
                </span>
                <p className="mt-0.5 text-[11px] leading-snug text-secondary">
                  {t.recommendation}
                </p>
                <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                  <input
                    type="date"
                    value={t.dueDate}
                    onChange={(e) =>
                      setPreview((prev) =>
                        prev.map((p, j) =>
                          j === i ? { ...p, dueDate: e.target.value } : p,
                        ),
                      )
                    }
                    className="rounded-lg border border-border bg-surface px-2 py-1 text-[11px] text-primary focus:border-accent focus:outline-none"
                    required
                  />
                  <select
                    value={t.priority}
                    onChange={(e) =>
                      setPreview((prev) =>
                        prev.map((p, j) =>
                          j === i
                            ? { ...p, priority: e.target.value as Priority }
                            : p,
                        ),
                      )
                    }
                    className="rounded-lg border border-border bg-surface px-2 py-1 text-[11px] text-primary focus:border-accent focus:outline-none"
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setPreview([])}
            className="flex-1 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-secondary transition-colors hover:text-primary"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={preview.every((t) => !t.selected || !t.dueDate)}
            className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-40"
          >
            Add {preview.filter((t) => t.selected).length} task
            {preview.filter((t) => t.selected).length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe what you need help with..."
        rows={3}
        maxLength={500}
        className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 text-[13px] text-primary placeholder:text-tertiary focus:border-accent focus:outline-none"
      />
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[10px] text-tertiary">
          {prompt.length}/500
        </span>
        {error ? (
          <span className="text-[11px] text-danger">{error}</span>
        ) : null}
      </div>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-40"
      >
        {isGenerating ? (
          <>
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Generating...
          </>
        ) : (
          "Generate tasks"
        )}
      </button>
    </div>
  );
}

function CheckboxButton({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={`${checked ? "Unmark" : "Mark"} ${label}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors " +
        (checked
          ? "border-success bg-success text-white"
          : "border-border-strong bg-surface text-transparent hover:border-primary")
      }
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 11 11"
        fill="none"
        aria-hidden
      >
        <path
          d="M2 5.5 L4.5 8 L9 3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
