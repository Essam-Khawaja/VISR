"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { TimelineEvent, NoteStatus } from "@/lib/flowgram/types";
import { X, Trash2, Loader2, StickyNote } from "lucide-react";

type NoteEditorProps = {
  event: TimelineEvent;
  onSave: (notes: string | null, status: NoteStatus) => Promise<void>;
  onClose: () => void;
};

const STATUS_META: Record<
  Exclude<NoteStatus, null>,
  { label: string; chip: string; chipActive: string }
> = {
  unresolved: {
    label: "Unresolved",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    chipActive: "bg-amber-500 text-white border-amber-500",
  },
  follow_up: {
    label: "Follow up",
    chip: "bg-blue-50 text-blue-700 border-blue-200",
    chipActive: "bg-blue-500 text-white border-blue-500",
  },
  important: {
    label: "Important",
    chip: "bg-rose-50 text-rose-700 border-rose-200",
    chipActive: "bg-rose-500 text-white border-rose-500",
  },
  completed: {
    label: "Completed",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    chipActive: "bg-emerald-500 text-white border-emerald-500",
  },
};

const STATUSES: Exclude<NoteStatus, null>[] = [
  "unresolved",
  "follow_up",
  "important",
  "completed",
];

export default function NoteEditor({ event, onSave, onClose }: NoteEditorProps) {
  const [notes, setNotes] = useState(event.notes ?? "");
  const [status, setStatus] = useState<NoteStatus>(event.note_status ?? null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isNew = !event.notes;

  async function save() {
    if (!notes.trim()) return;
    setSaving(true);
    try {
      await onSave(notes.trim(), status);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote() {
    if (!confirm("Delete this note?")) return;
    setDeleting(true);
    try {
      await onSave(null, null);
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="absolute inset-0"
        aria-hidden="true"
      />
      <div
        className="relative w-full sm:max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 max-h-[90dvh] sm:max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 shrink-0 rounded-t-3xl bg-white overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center">
              <StickyNote className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-sm font-semibold tracking-tight">
              {isNew ? "Add note" : "Edit note"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-stone-100 text-stone-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
              For
            </p>
            <p className="text-sm font-medium text-stone-900 mt-0.5 truncate">
              {event.title}
            </p>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
              Note
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              autoFocus
              className="w-full input-soft resize-none"
              placeholder="Capture a thought, a follow-up, a reminder..."
            />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Status
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {STATUSES.map((s) => {
                const meta = STATUS_META[s];
                const active = status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(active ? null : s)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition ${
                      active
                        ? meta.chipActive
                        : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-t border-stone-100 shrink-0 rounded-b-3xl bg-white">
          {!isNew ? (
            <button
              type="button"
              onClick={deleteNote}
              disabled={deleting || saving}
              className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Delete note
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl btn-ghost text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!notes.trim() || saving || deleting}
              className="px-5 py-2 rounded-xl btn-primary text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isNew ? "Add note" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
