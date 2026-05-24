/**
 * timelineUtils.ts
 *
 * Pure date / time / event helpers shared by the day, week, and free-time
 * surfaces. Everything here is timezone-naive in the sense that it operates
 * on local Date objects and ISO strings without doing IANA conversions; the
 * server side day-bounding (see app/api/flowgram/events) handles that.
 */

import { TimelineEvent, FreeSlot } from "@/lib/flowgram/types";

export function sortEventsByTime(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort(
    (a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
}

// Walk the day in order and produce gaps between events that are at least
// `minMinutes` long. This is the single canonical free-slot algorithm and is
// reused by the API route, the FreeTimeFinder, and the end-of-day reschedule.
export function findFreeSlots(
  events: TimelineEvent[],
  dayStart: Date,
  dayEnd: Date,
  minMinutes: number = 15
): FreeSlot[] {
  const sorted = sortEventsByTime(events);
  const slots: FreeSlot[] = [];

  let cursor = dayStart.getTime();

  for (const event of sorted) {
    const eventStart = new Date(event.start_time).getTime();
    const eventEnd = new Date(event.end_time).getTime();

    if (eventStart > cursor) {
      const gapMinutes = (eventStart - cursor) / (1000 * 60);
      if (gapMinutes >= minMinutes) {
        slots.push({
          start: new Date(cursor).toISOString(),
          end: new Date(eventStart).toISOString(),
          duration_minutes: Math.round(gapMinutes),
        });
      }
    }

    // Overlapping events should not collapse the cursor backwards.
    cursor = Math.max(cursor, eventEnd);
  }

  if (dayEnd.getTime() > cursor) {
    const gapMinutes = (dayEnd.getTime() - cursor) / (1000 * 60);
    if (gapMinutes >= minMinutes) {
      slots.push({
        start: new Date(cursor).toISOString(),
        end: dayEnd.toISOString(),
        duration_minutes: Math.round(gapMinutes),
      });
    }
  }

  return slots;
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} to ${formatTime(end)}`;
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDateLong(isoString: string): string {
  return new Date(isoString).toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// Returns a friendly greeting string suitable for the day-view hero band.
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "It's late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export function getTodayRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0
  );
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  );
  return { start, end };
}

export function getDurationMinutes(start: string, end: string): number {
  return Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60)
  );
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function isCurrentEvent(event: TimelineEvent): boolean {
  const now = Date.now();
  return (
    new Date(event.start_time).getTime() <= now &&
    new Date(event.end_time).getTime() > now
  );
}

export function isPastEvent(event: TimelineEvent): boolean {
  return new Date(event.end_time).getTime() < Date.now();
}

// Convert an ISO datetime to the value shape expected by <input type="datetime-local">.
export function toLocalDateTimeInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalDateTimeInput(value: string): string {
  return new Date(value).toISOString();
}

// YYYY-MM-DD in local time. Used everywhere the URL or DB stores dates as
// plain calendar days (settings, manual checklist, week navigation, etc.).
export function todayISODate(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isoDateFromDate(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Surface a five-hour-plus run of focused events with no real break, so the
// dashboard can suggest the user take one.
export function detectLongStretchWithoutBreak(
  events: TimelineEvent[]
): { start: string; end: string; minutes: number } | null {
  const sorted = sortEventsByTime(events).filter(
    (e) => e.category !== "break" && e.category !== "personal"
  );
  if (sorted.length === 0) return null;

  let stretchStart: string | null = null;
  let stretchEnd: string | null = null;

  for (let i = 0; i < sorted.length; i++) {
    if (stretchStart === null) {
      stretchStart = sorted[i].start_time;
    }
    stretchEnd = sorted[i].end_time;

    if (i < sorted.length - 1) {
      const gap = getDurationMinutes(
        sorted[i].end_time,
        sorted[i + 1].start_time
      );
      if (gap > 30) {
        const stretchMinutes = getDurationMinutes(stretchStart, stretchEnd);
        if (stretchMinutes >= 5 * 60) {
          return {
            start: stretchStart,
            end: stretchEnd,
            minutes: stretchMinutes,
          };
        }
        stretchStart = null;
      }
    }
  }

  if (stretchStart && stretchEnd) {
    const stretchMinutes = getDurationMinutes(stretchStart, stretchEnd);
    if (stretchMinutes >= 5 * 60) {
      return {
        start: stretchStart,
        end: stretchEnd,
        minutes: stretchMinutes,
      };
    }
  }

  return null;
}

// Coarse, human-readable sense of how heavy the day is. Tuned for the
// dashboard hero strip and not for any kind of analytic precision.
export function dayIntensity(events: TimelineEvent[]): "calm" | "moderate" | "intense" {
  const highPriority = events.filter(
    (e) => e.category === "assignment" || e.category === "meeting"
  ).length;
  const total = events.length;
  if (total === 0) return "calm";
  if (highPriority >= 3 || total >= 7) return "intense";
  if (highPriority >= 1 || total >= 4) return "moderate";
  return "calm";
}
