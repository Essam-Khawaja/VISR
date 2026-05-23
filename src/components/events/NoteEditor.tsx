"use client";

import { useState } from "react";
import { TimelineEvent, NoteStatus } from "@/types";
import { X, Trash2, Loader2, StickyNote } from "lucide-react";

type NoteEditorProps = {
  event: TimelineEvent;
  onSave: (notes: string | null, status: NoteStatus) => Promise<void>;
  onClose: () => void;
};

const STATUSES: { id: Exclude<NoteStatus, null>; label: string }[] = [
  { id: "unresolved", label: "Unresolved" },
  { id: "follow_up", label: "Follow up" },
  { id: "important", label: "Important" },
  { id: "completed", label: "Completed" },
];

export default function NoteEditor({ event, onSave, onClose }: NoteEditorProps) {
  const [notes, setNotes] = useState(event.notes ?? "");
  const [status, setStatus] = useState<NoteStatus>(event.note_status ?? null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100">
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

        <div className="px-5 py-4 space-y-3">
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
              {STATUSES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatus(status === s.id ? null : s.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition ${
                    status === s.id
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-t border-stone-100">
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
}
