"use client";

import { TimelineEvent as TEvent, Item, SavedLocation } from "@/types";
import {
  getCategoryStyles,
  getCategoryIcon,
} from "@/lib/category-colors";
import {
  formatTimeRange,
  formatDuration,
  getDurationMinutes,
  isCurrentEvent,
  isPastEvent,
} from "@/lib/timeline-utils";
import {
  MapPin,
  Trash2,
  Check,
  StickyNote,
  AlertCircle,
  Star,
  Plus,
} from "lucide-react";

type TimelineEventProps = {
  event: TEvent;
  items?: Item[];
  location?: SavedLocation | null;
  onEdit?: (event: TEvent) => void;
  onDelete?: (event: TEvent) => void;
  onToggleComplete?: (event: TEvent) => void;
  onEditNote?: (event: TEvent) => void;
};

const NOTE_STATUS_META: Record<
  string,
  { label: string; icon: typeof Star; classes: string }
> = {
  unresolved: {
    label: "Unresolved",
    icon: AlertCircle,
    classes: "bg-amber-50 text-amber-700 border-amber-200",
  },
  follow_up: {
    label: "Follow up",
    icon: AlertCircle,
    classes: "bg-blue-50 text-blue-700 border-blue-200",
  },
  important: {
    label: "Important",
    icon: Star,
    classes: "bg-rose-50 text-rose-700 border-rose-200",
  },
  completed: {
    label: "Completed",
    icon: Check,
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

export default function TimelineEventCard({
  event,
  items = [],
  location,
  onEdit,
  onDelete,
  onToggleComplete,
  onEditNote,
}: TimelineEventProps) {
  const styles = getCategoryStyles(event.category);
  const Icon = getCategoryIcon(event.category);
  const duration = getDurationMinutes(event.start_time, event.end_time);
  const current = isCurrentEvent(event);
  const past = isPastEvent(event);
  const noteMeta = event.note_status
    ? NOTE_STATUS_META[event.note_status]
    : null;

  function stop(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden transition-all ${
        past && !current ? "opacity-55" : current ? "shadow-lg" : ""
      }`}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${styles.accent}`}
      />

      <div
        className={`pl-4 pr-3 py-3.5 bg-gradient-to-br ${styles.bgGradient} border ${styles.border} rounded-2xl ${
          current ? `ring-2 ${styles.ring} ring-offset-2 ring-offset-transparent` : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => onEdit?.(event)}
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${styles.accent} flex items-center justify-center shadow-sm shrink-0 hover:scale-105 transition-transform cursor-pointer`}
            aria-label="Edit event"
          >
            <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                onClick={() => onEdit?.(event)}
                className="flex-1 min-w-0 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] uppercase tracking-wider font-semibold ${styles.text}`}
                  >
                    {styles.label}
                  </span>
                  {current && (
                    <span className="text-[10px] font-bold tracking-wide text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-200">
                      NOW
                    </span>
                  )}
                </div>

                <h3
                  className={`mt-0.5 text-[15px] font-semibold leading-snug text-stone-900 ${
                    event.completed ? "line-through text-stone-400" : ""
                  }`}
                >
                  {event.title}
                </h3>

                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-stone-500">
                  <span className="font-medium text-stone-700">
                    {formatTimeRange(event.start_time, event.end_time)}
                  </span>
                  <span>·</span>
                  <span>{formatDuration(duration)}</span>
                </div>

                {(location || event.location) && (
                  <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">
                      {location?.name ?? event.location}
                      {location &&
                        event.location &&
                        location.name !== event.location && (
                          <span className="text-stone-400">
                            {" · "}
                            {event.location}
                          </span>
                        )}
                    </span>
                  </p>
                )}
              </button>

              <div className="flex items-center gap-0.5 shrink-0 opacity-60 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                {onToggleComplete && (
                  <button
                    onClick={(e) => {
                      stop(e);
                      onToggleComplete(event);
                    }}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                      event.completed
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-stone-300 hover:border-emerald-400 hover:bg-emerald-50"
                    }`}
                    aria-label={event.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {event.completed && (
                      <Check className="w-3 h-3" strokeWidth={3} />
                    )}
                  </button>
                )}
                {onEditNote && !event.notes && (
                  <button
                    onClick={(e) => {
                      stop(e);
                      onEditNote(event);
                    }}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                    aria-label="Add note"
                    title="Add note"
                  >
                    <StickyNote className="w-3 h-3" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      stop(e);
                      onDelete(event);
                    }}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {event.description && (
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                {event.description}
              </p>
            )}

            {items.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1">
                {items.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-white/70 rounded-full border border-stone-200 text-stone-700"
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            )}

            {event.notes && (
              <div className="mt-2.5 text-xs bg-white/70 rounded-xl p-2.5 border border-stone-200/70">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                    <StickyNote className="w-3 h-3" />
                    Notes
                  </p>
                  <div className="flex items-center gap-1">
                    {noteMeta && (
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${noteMeta.classes}`}
                      >
                        <noteMeta.icon className="w-2.5 h-2.5" />
                        {noteMeta.label}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    stop(e);
                    onEditNote?.(event);
                  }}
                  className="block w-full text-left text-stone-700 leading-relaxed hover:text-stone-900 transition-colors"
                >
                  {event.notes}
                </button>
              </div>
            )}

            {!event.notes && onEditNote && (
              <button
                type="button"
                onClick={(e) => {
                  stop(e);
                  onEditNote(event);
                }}
                className="mt-2 text-[11px] font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add note
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
