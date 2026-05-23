"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Routine, RoutineFrequency, ROUTINE_FREQUENCIES } from "@/types";
import {
  Repeat,
  Plus,
  Trash2,
  Loader2,
  X,
  Sparkles,
  Pencil,
} from "lucide-react";
import {
  isRoutineScheduledOnDate,
  routineStatusForDate,
  RoutineStatus,
} from "@/lib/routine-schedule";
import { isSameDay } from "@/lib/timeline-utils";

function frequencyLabel(r: Routine): string {
  switch (r.frequency) {
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
    case "every_n_days":
      return `Every ${r.interval_days} days`;
  }
}

const FREQ_LABEL_SHORT: Record<RoutineFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  every_n_days: "Every N days",
};

const STATUS_META: Record<
  RoutineStatus,
  { tag: string; tagClass: string; subtitle: (r: Routine) => string }
> = {
  due: {
    tag: "Due",
    tagClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    subtitle: (r) => `${frequencyLabel(r)}. Due today`,
  },
  scheduled: {
    tag: "Upcoming",
    tagClass: "bg-sky-50 text-sky-700 border-sky-200",
    subtitle: (r) => `${frequencyLabel(r)}. Scheduled for this day`,
  },
  completed: {
    tag: "Done",
    tagClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    subtitle: (r) => `${frequencyLabel(r)}. Completed`,
  },
  missed: {
    tag: "Missed",
    tagClass: "bg-amber-50 text-amber-700 border-amber-200",
    subtitle: (r) => `${frequencyLabel(r)}. Was scheduled`,
  },
  past: {
    tag: "Past",
    tagClass: "bg-stone-100 text-stone-500 border-stone-200",
    subtitle: (r) => frequencyLabel(r),
  },
};

type RoutinesPanelProps = {
  forDate: string;
};

export default function RoutinesPanel({ forDate }: RoutinesPanelProps) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<RoutineFrequency>("daily");
  const [intervalDays, setIntervalDays] = useState(1);
  const [preferredTime, setPreferredTime] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/routines");
      if (res.ok) {
        setRoutines(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const targetDate = useMemo(() => new Date(`${forDate}T12:00:00`), [forDate]);
  const isToday = useMemo(() => isSameDay(targetDate, new Date()), [targetDate]);

  const scheduled = useMemo(
    () =>
      routines
        .filter((r) => isRoutineScheduledOnDate(r, targetDate))
        .map((r) => ({
          routine: r,
          status: routineStatusForDate(r, targetDate),
        }))
        .sort((a, b) => {
          const order: Record<RoutineStatus, number> = {
            due: 0,
            scheduled: 1,
            completed: 2,
            missed: 3,
            past: 4,
          };
          return order[a.status] - order[b.status];
        }),
    [routines, targetDate]
  );

  function resetForm() {
    setTitle("");
    setFrequency("daily");
    setIntervalDays(1);
    setPreferredTime("");
    setEditingId(null);
  }

  function startEdit(r: Routine) {
    setEditingId(r.id);
    setTitle(r.title);
    setFrequency(r.frequency);
    setIntervalDays(r.interval_days ?? 1);
    setPreferredTime(r.preferred_time ?? "");
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const body = {
      title: title.trim(),
      frequency,
      interval_days: intervalDays,
      preferred_time: preferredTime || null,
    };
    if (editingId) {
      await fetch("/api/routines", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...body }),
      });
    } else {
      await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    resetForm();
    setShowForm(false);
    await load();
  }

  async function markComplete(routine: Routine) {
    setPending(routine.id);
    try {
      await fetch("/api/routines", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: routine.id, mark_complete: true }),
      });
      await load();
    } finally {
      setPending(null);
    }
  }

  async function deleteRoutine(routine: Routine) {
    if (!confirm(`Delete "${routine.title}"?`)) return;
    setPending(routine.id);
    try {
      await fetch(`/api/routines?id=${routine.id}`, { method: "DELETE" });
      await load();
    } finally {
      setPending(null);
    }
  }

  const due = scheduled.filter((s) => s.status === "due").length;
  const upcoming = scheduled.filter((s) => s.status === "scheduled").length;

  const subtitle = isToday
    ? `${due} due${upcoming > 0 ? `, ${upcoming} scheduled` : ""}`
    : scheduled.length === 0
      ? "Nothing scheduled"
      : `${scheduled.length} scheduled`;

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-sm">
            <Repeat className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight text-stone-900">
              Routines
            </h2>
            <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="text-xs font-medium px-2.5 py-1.5 rounded-xl btn-ghost flex items-center gap-1"
        >
          {showForm ? (
            <>
              <X className="w-3.5 h-3.5" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              Add
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={submit}
          className="mb-3 p-3 rounded-xl bg-white/60 border border-stone-200/60 space-y-2"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Call parents"
            className="w-full input-soft"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as RoutineFrequency)}
              className="input-soft"
            >
              {ROUTINE_FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {FREQ_LABEL_SHORT[f]}
                </option>
              ))}
            </select>
            {frequency === "every_n_days" ? (
              <input
                type="number"
                min={1}
                value={intervalDays}
                onChange={(e) => setIntervalDays(Number(e.target.value))}
                placeholder="Days"
                className="input-soft"
              />
            ) : (
              <input
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="input-soft"
              />
            )}
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 rounded-xl btn-primary text-sm font-medium"
          >
            {editingId ? "Save routine" : "Create routine"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
        </div>
      ) : scheduled.length === 0 ? (
        <div className="text-center py-6">
          <Sparkles className="w-6 h-6 text-stone-300 mx-auto mb-2" />
          <p className="text-xs text-stone-500">
            {routines.length === 0
              ? "No routines yet. Add things you do regularly."
              : "No routines land on this day."}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {scheduled.map(({ routine, status }) => (
            <RoutineRow
              key={routine.id}
              routine={routine}
              status={status}
              isToday={isToday}
              onComplete={markComplete}
              onDelete={deleteRoutine}
              onEdit={startEdit}
              pending={pending === routine.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RoutineRow({
  routine,
  status,
  isToday,
  onComplete,
  onDelete,
  onEdit,
  pending,
}: {
  routine: Routine;
  status: RoutineStatus;
  isToday: boolean;
  onComplete: (r: Routine) => void;
  onDelete: (r: Routine) => void;
  onEdit: (r: Routine) => void;
  pending: boolean;
}) {
  const meta = STATUS_META[status];
  const isDue = status === "due";
  const isDone = status === "completed";
  const canComplete = isToday && (isDue || isDone);

  return (
    <div
      className={`group flex items-center gap-2 px-2.5 py-2 rounded-xl border ${
        isDue
          ? "bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-200"
          : "bg-white/50 border-stone-200/60"
      }`}
    >
      <button
        onClick={() => canComplete && onComplete(routine)}
        disabled={pending || !canComplete}
        className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors ${
          isDone
            ? "bg-emerald-500 border-emerald-500"
            : isDue
              ? "border-indigo-400 hover:bg-indigo-100"
              : "border-stone-300"
        } ${!canComplete ? "cursor-not-allowed opacity-60" : ""}`}
        aria-label={isDone ? "Completed" : "Mark complete"}
      >
        {pending && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isDone ? "line-through text-stone-400" : "text-stone-900"
          }`}
        >
          {routine.title}
        </p>
        <p className="text-[11px] text-stone-500">{meta.subtitle(routine)}</p>
      </div>
      <span
        className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full border ${meta.tagClass} opacity-90`}
      >
        {meta.tag}
      </span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(routine)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-white"
          aria-label="Edit routine"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          onClick={() => onDelete(routine)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50"
          aria-label="Delete routine"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
