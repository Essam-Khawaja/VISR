/**
 * app/flowgram/notes/page.tsx
 *
 * Cross-day notes inbox. Aggregates every event note in a sliding 180-day
 * window and lets the user filter by note status (Open / In progress /
 * Done / Snoozed). Editing posts back through the events PATCH route.
 */

"use client";

import { useEffect, useState } from "react";
import { TimelineEvent, NoteStatus } from "@/lib/flowgram/types";
import {
  formatDateLong,
  formatTime,
  addDays,
  isoDateFromDate,
} from "@/lib/flowgram/timelineUtils";
import { getCategoryStyles, getCategoryIcon } from "@/lib/flowgram/categoryColors";
import { renderTextWithLinks } from "@/lib/flowgram/linkify";
import {
  StickyNote,
  AlertCircle,
  Star,
  Check,
  Loader2,
  Trash2,
  Pencil,
} from "lucide-react";
import NoteEditor from "@/components/flowgram/events/NoteEditor";

type Filter = "all" | "unresolved" | "follow_up" | "important" | "completed";

const STATUS_META: Record<
  Exclude<Filter, "all">,
  { label: string; icon: typeof Star; chip: string; chipActive: string }
> = {
  unresolved: {
    label: "Unresolved",
    icon: AlertCircle,
    chip: "bg-pomelo/[0.10] text-pomelo border-pomelo/25",
    chipActive: "bg-pomelo text-white border-pomelo",
  },
  follow_up: {
    label: "Follow up",
    icon: AlertCircle,
    chip: "bg-brook/[0.12] text-brook border-brook/30",
    chipActive: "bg-brook text-white border-brook",
  },
  important: {
    label: "Important",
    icon: Star,
    chip: "bg-amaranth/[0.08] text-amaranth border-amaranth/22",
    chipActive: "bg-amaranth text-white border-amaranth",
  },
  completed: {
    label: "Completed",
    icon: Check,
    chip: "bg-sage/[0.10] text-sage border-sage/25",
    chipActive: "bg-sage text-white border-sage",
  },
};

const FILTERS: { id: Filter; label: string; icon: typeof Star | null }[] = [
  { id: "all", label: "All", icon: null },
  { id: "unresolved", label: "Unresolved", icon: AlertCircle },
  { id: "follow_up", label: "Follow up", icon: AlertCircle },
  { id: "important", label: "Important", icon: Star },
  { id: "completed", label: "Completed", icon: Check },
];

export default function NotesPage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [pending, setPending] = useState<string | null>(null);
  const [editing, setEditing] = useState<TimelineEvent | null>(null);

  async function load() {
    setLoading(true);
    try {
      const start = addDays(new Date(), -90);
      const end = addDays(new Date(), 90);
      const res = await fetch(
        `/api/flowgram/events?date=${isoDateFromDate(start)}&date_end=${isoDateFromDate(end)}`
      );
      if (res.ok) {
        const all = (await res.json()) as TimelineEvent[];
        setEvents(all.filter((e) => e.notes));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(event: TimelineEvent, status: NoteStatus) {
    setPending(event.id);
    try {
      await fetch("/api/flowgram/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: event.id, note_status: status }),
      });
      await load();
    } finally {
      setPending(null);
    }
  }

  async function deleteNote(event: TimelineEvent) {
    if (!confirm(`Delete the note on "${event.title}"?`)) return;
    setPending(event.id);
    try {
      await fetch("/api/flowgram/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: event.id,
          notes: null,
          note_status: null,
        }),
      });
      await load();
    } finally {
      setPending(null);
    }
  }

  const sorted = [...events].sort(
    (a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  let filtered: TimelineEvent[];
  if (filter === "all") {
    filtered = sorted.filter((e) => e.note_status !== "completed");
  } else {
    filtered = sorted.filter((e) => e.note_status === filter);
  }

  return (
    <div className="min-h-screen pb-24">
      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-4">
        <div className="px-1">
          <h1 className="text-xl font-semibold tracking-tight text-stone-900">
            Notes
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Everything you jotted down across your timeline.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap glass-card rounded-2xl p-1.5">
          {FILTERS.map(({ id, label, icon: Icon }) => {
            const meta = id !== "all" ? STATUS_META[id] : null;
            const active = filter === id;
            const styles = active
              ? meta
                ? meta.chipActive
                : "bg-stone-900 text-white border-stone-900"
              : meta
                ? meta.chip + " hover:opacity-80"
                : "bg-white/70 text-stone-700 border-stone-200 hover:border-stone-400";
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-xl border transition-all ${styles}`}
              >
                {Icon && <Icon className="w-3 h-3" />}
                {label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="glass-card rounded-2xl p-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-thulian/30 to-amaranth/30 flex items-center justify-center mb-3">
              <StickyNote className="w-5 h-5 text-amaranth" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-semibold text-stone-900">
              No notes here
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-xs">
              Add notes to events from the timeline to keep track of important moments.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((event) => {
              const styles = getCategoryStyles(event.category);
              const Icon = getCategoryIcon(event.category);
              const completed = event.note_status === "completed";
              return (
                <div
                  key={event.id}
                  className={`glass-card rounded-2xl p-4 flex gap-3 ${
                    completed ? "opacity-60" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${styles.accent} flex items-center justify-center shadow-sm shrink-0`}
                  >
                    <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-900 leading-tight">
                          {event.title}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {formatDateLong(event.start_time)} ·{" "}
                          {formatTime(event.start_time)}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => setEditing(event)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-white"
                          aria-label="Edit note"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteNote(event)}
                          disabled={pending === event.id}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-tertiary hover:text-amaranth hover:bg-amaranth/[0.08] disabled:opacity-50"
                          aria-label="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p
                      className={`text-sm text-stone-700 mt-2 leading-relaxed whitespace-pre-wrap ${
                        completed ? "line-through" : ""
                      }`}
                    >
                      {event.notes ? renderTextWithLinks(event.notes) : null}
                    </p>
                    <div className="mt-2 flex items-center gap-1 flex-wrap">
                      {(
                        ["unresolved", "follow_up", "important", "completed"] as const
                      ).map((s) => {
                        const meta = STATUS_META[s];
                        const active = event.note_status === s;
                        return (
                          <button
                            key={s}
                            onClick={() =>
                              updateStatus(event, active ? null : s)
                            }
                            disabled={pending === event.id}
                            className={`text-[11px] px-2 py-0.5 rounded-full border font-medium transition disabled:opacity-50 ${
                              active
                                ? meta.chipActive
                                : "bg-white/70 text-stone-500 border-stone-200 hover:border-stone-400"
                            }`}
                          >
                            {meta.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {editing && (
        <NoteEditor
          event={editing}
          onSave={async (notes, status) => {
            await fetch("/api/flowgram/events", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: editing.id,
                notes,
                note_status: status,
              }),
            });
            await load();
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
