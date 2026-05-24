"use client";

import { TimelineEvent as TEvent, Item, SavedLocation } from "@/lib/flowgram/types";
import {
  getCategoryStyles,
  getCategoryIcon,
  getCategoryLabel,
} from "@/lib/flowgram/categoryColors";
import {
  formatTimeRange,
  formatDuration,
  getDurationMinutes,
  isCurrentEvent,
  isPastEvent,
} from "@/lib/flowgram/timelineUtils";
import {
  MapPin,
  Trash2,
  Check,
  StickyNote,
  AlertCircle,
  Star,
  Plus,
} from "lucide-react";
import { renderTextWithLinks } from "@/lib/flowgram/linkify";

type TimelineEventProps = {
  event: TEvent;
  items?: Item[];
  location?: SavedLocation | null;
  customCategoryLabel?: string;
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
    classes: "bg-pomelo/[0.10] text-pomelo border-pomelo/25",
  },
  follow_up: {
    label: "Follow up",
    icon: AlertCircle,
    classes: "bg-brook/[0.12] text-brook border-brook/30",
  },
  important: {
    label: "Important",
    icon: Star,
    classes: "bg-amaranth/[0.08] text-amaranth border-amaranth/22",
  },
  completed: {
    label: "Completed",
    icon: Check,
    classes: "bg-sage/[0.10] text-sage border-sage/25",
  },
};

export default function TimelineEventCard({
  event,
  items = [],
  location,
  customCategoryLabel,
  onEdit,
  onDelete,
  onToggleComplete,
  onEditNote,
}: TimelineEventProps) {
  const styles = getCategoryStyles(event.category);
  const Icon = getCategoryIcon(event.category);
  const categoryLabel = customCategoryLabel ?? getCategoryLabel(event.category);
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
          current ? `ring-1 ${styles.ring} ring-offset-2 ring-offset-transparent` : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => onEdit?.(event)}
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${styles.accent} flex items-center justify-center shadow-soft shrink-0 hover:scale-105 transition-transform cursor-pointer`}
            aria-label="Edit event"
          >
            <Icon className="w-4 h-4 text-white" strokeWidth={1.9} />
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
                    {categoryLabel}
                  </span>
                  {current && (
                    <span className="text-[10px] font-bold tracking-wide text-amaranth bg-amaranth/[0.08] px-1.5 py-0.5 rounded-full border border-amaranth/22">
                      NOW
                    </span>
                  )}
                </div>

                <h3
                  className={`mt-0.5 text-[15px] font-semibold leading-snug text-primary ${
                    event.completed ? "line-through text-tertiary" : ""
                  }`}
                >
                  {event.title}
                </h3>

                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-tertiary">
                  <span className="font-medium text-secondary">
                    {formatTimeRange(event.start_time, event.end_time)}
                  </span>
                  <span>·</span>
                  <span>{formatDuration(duration)}</span>
                </div>

                {(location || event.location) && (
                  <p className="text-xs text-tertiary mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" strokeWidth={1.8} />
                    <span className="truncate">
                      {location?.name ?? event.location}
                      {location &&
                        event.location &&
                        location.name !== event.location && (
                          <span className="text-tertiary/70">
                            {" · "}
                            {event.location}
                          </span>
                        )}
                    </span>
                  </p>
                )}
              </button>

              <div className="flex items-center gap-0.5 shrink-0 opacity-100 sm:opacity-60 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                {onToggleComplete && (
                  <button
                    onClick={(e) => {
                      stop(e);
                      onToggleComplete(event);
                    }}
                    className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center transition-colors ${
                      event.completed
                        ? "bg-sage border-sage text-white"
                        : "border-border-strong hover:border-sage hover:bg-sage/[0.08]"
                    }`}
                    aria-label={event.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {event.completed && (
                      <Check className="w-3 h-3" strokeWidth={3} />
                    )}
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      stop(e);
                      onDelete(event);
                    }}
                    className="w-7 h-7 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-tertiary hover:text-amaranth hover:bg-amaranth/[0.08] transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3 h-3" strokeWidth={1.8} />
                  </button>
                )}
              </div>
            </div>

            {event.description && (
              <p className="text-xs text-secondary mt-2 leading-relaxed whitespace-pre-wrap">
                {renderTextWithLinks(event.description)}
              </p>
            )}

            {items.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1">
                {items.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-white/70 rounded-full border border-border text-secondary"
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            )}

            {event.notes && (
              <div className="mt-2.5 text-xs bg-white/70 rounded-2xl p-2.5 border border-border">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-[10px] font-semibold text-tertiary uppercase tracking-wider flex items-center gap-1">
                    <StickyNote className="w-3 h-3" strokeWidth={1.8} />
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
                <div
                  onClick={(e) => {
                    stop(e);
                    onEditNote?.(event);
                  }}
                  className="text-secondary leading-relaxed hover:text-primary transition-colors whitespace-pre-wrap cursor-pointer"
                >
                  {renderTextWithLinks(event.notes)}
                </div>
              </div>
            )}

            {!event.notes && onEditNote && (
              <button
                type="button"
                onClick={(e) => {
                  stop(e);
                  onEditNote(event);
                }}
                className="mt-2 text-[11px] font-medium text-tertiary hover:text-primary flex items-center gap-1"
              >
                <Plus className="w-3 h-3" strokeWidth={1.8} />
                Add note
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
