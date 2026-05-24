"use client";

import { useEffect, useState } from "react";
import { PersonalTimeBlock } from "@/lib/1/types";
import { Moon, Plus, X, Trash2, Loader2 } from "lucide-react";
import TimePicker from "@/components/1/ui/TimePicker";
import DatePicker from "@/components/1/ui/DatePicker";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime(value: string): string {
  const [h, m] = value.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m || 0, 0, 0);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function PersonalTimeManager() {
  const [blocks, setBlocks] = useState<PersonalTimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [adding, setAdding] = useState(false);

  const [label, setLabel] = useState("");
  const [scope, setScope] = useState<"weekly" | "specific">("weekly");
  const [weekday, setWeekday] = useState<number>(0);
  const [specificDate, setSpecificDate] = useState<string>("");
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("20:00");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/1/personal-time");
      if (res.ok) setBlocks(await res.json());
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setLabel("");
    setScope("weekly");
    setWeekday(0);
    setSpecificDate("");
    setStartTime("18:00");
    setEndTime("20:00");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    if (endTime <= startTime) {
      alert("End time must be after start time.");
      return;
    }
    if (scope === "specific" && !specificDate) {
      alert("Pick a date for a one-time block.");
      return;
    }
    setPending(true);
    try {
      await fetch("/api/1/personal-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          weekday: scope === "weekly" ? weekday : null,
          specific_date: scope === "specific" ? specificDate : null,
          start_time: startTime,
          end_time: endTime,
        }),
      });
      resetForm();
      setAdding(false);
      await load();
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this personal time block?")) return;
    setPending(true);
    try {
      await fetch(`/api/1/personal-time?id=${id}`, { method: "DELETE" });
      await load();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="glass-card rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-sm">
            <Moon className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight text-stone-900">
              Personal time
            </h2>
            <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
              Time blocks the free-time finder and reschedule will skip.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (adding) {
              setAdding(false);
              resetForm();
            } else {
              setAdding(true);
            }
          }}
          className="text-[11px] font-medium px-2 py-1 rounded-lg btn-ghost flex items-center gap-1"
        >
          {adding ? (
            <>
              <X className="w-3 h-3" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" />
              Add
            </>
          )}
        </button>
      </div>

      {adding && (
        <form
          onSubmit={submit}
          className="p-3 rounded-xl bg-white/60 border border-stone-200/60 space-y-2"
        >
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Family dinner"
            className="w-full input-soft"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as "weekly" | "specific")}
              className="input-soft"
            >
              <option value="weekly">Every week</option>
              <option value="specific">One specific day</option>
            </select>
            {scope === "weekly" ? (
              <select
                value={weekday}
                onChange={(e) => setWeekday(Number(e.target.value))}
                className="input-soft"
              >
                {WEEKDAYS.map((w, i) => (
                  <option key={i} value={i}>
                    {w}
                  </option>
                ))}
              </select>
            ) : (
              <DatePicker
                value={specificDate}
                onChange={setSpecificDate}
                placeholder="Pick a day"
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <TimePicker value={startTime} onChange={setStartTime} />
            <TimePicker value={endTime} onChange={setEndTime} />
          </div>
          <button
            type="submit"
            disabled={pending || !label.trim()}
            className="w-full px-4 py-2 rounded-xl btn-primary text-sm font-medium disabled:opacity-50"
          >
            {pending ? "Saving..." : "Add personal time"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
        </div>
      ) : blocks.length === 0 ? (
        <p className="text-[11px] text-stone-400 italic py-1 text-center">
          No personal time blocks yet.
        </p>
      ) : (
        <div className="space-y-1.5">
          {blocks.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 border border-stone-200/60"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900 truncate">
                  {b.label}
                </p>
                <p className="text-[11px] text-stone-500">
                  {b.specific_date
                    ? new Date(`${b.specific_date}T12:00:00`).toLocaleDateString(
                        [],
                        { weekday: "short", month: "short", day: "numeric" }
                      )
                    : `Every ${WEEKDAYS[b.weekday ?? 0]}`}
                  {" · "}
                  {formatTime(b.start_time)} to {formatTime(b.end_time)}
                </p>
              </div>
              <button
                onClick={() => remove(b.id)}
                disabled={pending}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                aria-label={`Delete ${b.label}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
