"use client";

import { TimelineEvent, Item, SavedLocation } from "@/types";
import {
  sortEventsByTime,
  getDurationMinutes,
  isCurrentEvent,
  isPastEvent,
} from "@/lib/timeline-utils";
import TimelineEventCard from "./TimelineEvent";
import TimelineConnector from "./TimelineConnector";
import CurrentTimeMarker from "./CurrentTimeMarker";
import { CalendarX } from "lucide-react";

type TimelineProps = {
  events: TimelineEvent[];
  eventItems: Record<string, Item[]>;
  locations: SavedLocation[];
  showCurrentMarker?: boolean;
  onEditEvent?: (event: TimelineEvent) => void;
  onDeleteEvent?: (event: TimelineEvent) => void;
  onToggleComplete?: (event: TimelineEvent) => void;
  onEditNote?: (event: TimelineEvent) => void;
};

export default function Timeline({
  events,
  eventItems,
  locations,
  showCurrentMarker = true,
  onEditEvent,
  onDeleteEvent,
  onToggleComplete,
  onEditNote,
}: TimelineProps) {
  const sorted = sortEventsByTime(events);

  if (sorted.length === 0) {
    return (
      <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center mb-3">
          <CalendarX className="w-6 h-6 text-stone-400" strokeWidth={1.5} />
        </div>
        <h3 className="text-sm font-semibold text-stone-900">
          A wide open day
        </h3>
        <p className="text-xs text-stone-500 mt-1 max-w-xs">
          Nothing scheduled. Add an event to start shaping your timeline.
        </p>
      </div>
    );
  }

  const locationMap = new Map(locations.map((l) => [l.id, l]));

  let currentTimeInserted = false;
  const now = Date.now();

  return (
    <div className="flex flex-col">
      {sorted.map((event, i) => {
        const eventStart = new Date(event.start_time).getTime();
        const prevEnd =
          i > 0 ? new Date(sorted[i - 1].end_time).getTime() : null;
        const gapMinutes =
          prevEnd != null
            ? getDurationMinutes(
                new Date(prevEnd).toISOString(),
                event.start_time
              )
            : undefined;

        const showCurrentBefore =
          showCurrentMarker &&
          !currentTimeInserted &&
          !isPastEvent(event) &&
          eventStart > now;

        if (showCurrentBefore) {
          currentTimeInserted = true;
        }

        const showCurrentDuring =
          showCurrentMarker &&
          !currentTimeInserted &&
          isCurrentEvent(event);
        if (showCurrentDuring) {
          currentTimeInserted = true;
        }

        const eventLocation = event.location_id
          ? (locationMap.get(event.location_id) ?? null)
          : null;

        return (
          <div key={event.id}>
            {i > 0 && <TimelineConnector gapMinutes={gapMinutes} />}
            {showCurrentBefore && <CurrentTimeMarker />}
            <TimelineEventCard
              event={event}
              items={eventItems[event.id] ?? []}
              location={eventLocation}
              onEdit={onEditEvent}
              onDelete={onDeleteEvent}
              onToggleComplete={onToggleComplete}
              onEditNote={onEditNote}
            />
          </div>
        );
      })}

      {showCurrentMarker && !currentTimeInserted && (
        <div className="mt-2">
          <CurrentTimeMarker />
        </div>
      )}
    </div>
  );
}
