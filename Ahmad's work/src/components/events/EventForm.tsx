"use client";

import { useState, useEffect } from "react";
import {
  TimelineEvent,
  EVENT_CATEGORIES,
  SavedLocation,
  CustomCategory,
} from "@/types";
import { getCategoryStyles, getCategoryIcon } from "@/lib/category-colors";
import {
  toLocalDateTimeInput,
  fromLocalDateTimeInput,
} from "@/lib/timeline-utils";
import { X, Trash2, Loader2 } from "lucide-react";
import DateTimePicker from "../ui/DateTimePicker";
import EventItemsManager from "./EventItemsManager";

type EventFormProps = {
  event?: TimelineEvent | null;
  initialDate?: string;
  initialStart?: string;
  initialEnd?: string;
  locations: SavedLocation[];
  customCategories: CustomCategory[];
  onSubmit: (event: Partial<TimelineEvent>) => Promise<void>;
  onDelete?: (event: TimelineEvent) => Promise<void>;
  onClose: () => void;
};

function defaultStart(initialDate?: string, initialStart?: string): string {
  if (initialStart) return toLocalDateTimeInput(initialStart);
  const base = initialDate ? new Date(`${initialDate}T09:00:00`) : new Date();
  if (!initialDate) {
    base.setMinutes(Math.ceil(base.getMinutes() / 15) * 15, 0, 0);
  }
  return toLocalDateTimeInput(base.toISOString());
}

function defaultEnd(start: string, initialEnd?: string): string {
  if (initialEnd) return toLocalDateTimeInput(initialEnd);
  const d = new Date(start);
  d.setHours(d.getHours() + 1);
  return toLocalDateTimeInput(d.toISOString());
}

export default function EventForm({
  event,
  initialDate,
  initialStart,
  initialEnd,
  locations,
  customCategories,
  onSubmit,
  onDelete,
  onClose,
}: EventFormProps) {
  const startDefault = defaultStart(initialDate, initialStart);

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [category, setCategory] = useState<string>(event?.category ?? "class");
  const [startTime, setStartTime] = useState(
    event ? toLocalDateTimeInput(event.start_time) : startDefault
  );
  const [endTime, setEndTime] = useState(
    event
      ? toLocalDateTimeInput(event.end_time)
      : defaultEnd(startDefault, initialEnd)
  );
  const [location, setLocation] = useState(event?.location ?? "");
  const [locationId, setLocationId] = useState<string>(event?.location_id ?? "");
  const [autoTransit, setAutoTransit] = useState(
    event?.auto_transit ?? !!event?.location_id
  );
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleLocationChange(id: string) {
    setLocationId(id);
    if (id && !event) {
      const loc = locations.find((l) => l.id === id);
      setAutoTransit(!!loc && loc.transit_minutes > 0);
    }
    if (!id) setAutoTransit(false);
  }

  useEffect(() => {
    if (!event) {
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);
      if (endDate <= startDate) {
        setEndTime(defaultEnd(startTime));
      }
    }
  }, [startTime, endTime, event]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      alert("Pick a valid start and end time.");
      return;
    }
    if (end <= start) {
      alert("End time must be after start time.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        title,
        description: description || null,
        category: category as TimelineEvent["category"],
        start_time: fromLocalDateTimeInput(startTime),
        end_time: fromLocalDateTimeInput(endTime),
        location: location || null,
        location_id: locationId || null,
        auto_transit: autoTransit,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!event || !onDelete) return;
    if (!confirm(`Delete "${event.title}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(event);
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  const builtInCategories = EVENT_CATEGORIES;

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/30 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-lg glass-card rounded-3xl shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[92dvh]"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200/60 bg-white/80 backdrop-blur-xl rounded-t-3xl shrink-0">
          <h2 className="text-base font-semibold tracking-tight">
            {event ? "Edit event" : "New event"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-stone-100 text-stone-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full input-soft"
              placeholder="e.g. Data Structures Lecture"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {builtInCategories.map((c) => {
                const Icon = getCategoryIcon(c);
                const meta = getCategoryStyles(c);
                const active = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`flex items-center gap-1.5 px-2 py-2 rounded-xl text-[11px] font-medium border transition-all ${
                      active
                        ? `${meta.bgSoft} ${meta.text} ${meta.border} ring-2 ${meta.ring}`
                        : "bg-white/60 border-stone-200 text-stone-600 hover:bg-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{meta.label}</span>
                  </button>
                );
              })}
              {customCategories.map((c) => {
                const Icon = getCategoryIcon(c.name);
                const meta = getCategoryStyles(c.name);
                const active = category === c.name;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.name)}
                    className={`flex items-center gap-1.5 px-2 py-2 rounded-xl text-[11px] font-medium border transition-all ${
                      active
                        ? `${meta.bgSoft} ${meta.text} ${meta.border} ring-2 ${meta.ring}`
                        : "bg-white/60 border-stone-200 text-stone-600 hover:bg-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
                Start
              </label>
              <DateTimePicker value={startTime} onChange={setStartTime} />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
                End
              </label>
              <DateTimePicker value={endTime} onChange={setEndTime} />
            </div>
          </div>

          {locations.length > 0 && (
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
                Saved location
              </label>
              <select
                value={locationId}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full input-soft"
              >
                <option value="">None</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                    {l.transit_minutes > 0
                      ? ` (${l.transit_minutes} min transit)`
                      : ""}
                  </option>
                ))}
              </select>
              {locationId && (
                <label className="flex items-center gap-2 mt-2 text-xs text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoTransit}
                    onChange={(e) => setAutoTransit(e.target.checked)}
                    className="rounded border-stone-300"
                  />
                  <span>
                    Auto-add transit blocks before &amp; after this event
                  </span>
                </label>
              )}
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
              Custom location <span className="font-normal normal-case text-stone-400">(optional)</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full input-soft"
              placeholder="e.g. MS 217"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full input-soft resize-none"
              placeholder="Optional details (Zoom/Teams links here become clickable)..."
            />
          </div>

          {event && <EventItemsManager eventId={event.id} />}

          <p className="text-[11px] text-stone-500 italic">
            {event
              ? "Notes are managed from the timeline tile."
              : "Save the event first to attach one-time items to it."}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-t border-stone-200/60 bg-white/80 backdrop-blur-xl rounded-b-3xl shrink-0">
          {event && onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50 px-2 py-1.5"
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Delete
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
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl btn-primary text-sm font-medium flex items-center gap-2 disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {event ? "Save" : "Create event"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
