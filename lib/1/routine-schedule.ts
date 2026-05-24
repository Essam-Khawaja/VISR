import { Routine } from "@/lib/1/types";
import { isSameDay } from "./timeline-utils";

export function routineIntervalDays(routine: Routine): number {
  switch (routine.frequency) {
    case "daily":
      return 1;
    case "weekly":
      return 7;
    case "monthly":
      return 30;
    case "every_n_days":
      return Math.max(1, routine.interval_days ?? 1);
  }
}

function midnight(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function diffInDays(a: Date, b: Date): number {
  return Math.round(
    (midnight(a).getTime() - midnight(b).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function anchorDate(routine: Routine): Date {
  if (routine.next_due) return midnight(new Date(routine.next_due));
  if (routine.last_completed) {
    const last = midnight(new Date(routine.last_completed));
    last.setDate(last.getDate() + routineIntervalDays(routine));
    return last;
  }
  return midnight(new Date());
}

export function isRoutineScheduledOnDate(
  routine: Routine,
  date: Date
): boolean {
  if (!routine.active) return false;

  if (routine.ends_on) {
    const endsOn = midnight(new Date(`${routine.ends_on}T12:00:00`));
    if (midnight(date).getTime() > endsOn.getTime()) return false;
  }

  if (routine.frequency === "daily") return true;
  if (routine.frequency === "monthly") {
    const anchor = anchorDate(routine);
    return anchor.getDate() === date.getDate();
  }

  const interval = routineIntervalDays(routine);
  if (interval === 1) return true;
  const anchor = anchorDate(routine);
  const diff = diffInDays(date, anchor);
  return diff % interval === 0;
}

export type RoutineStatus =
  | "due"
  | "scheduled"
  | "completed"
  | "missed"
  | "past";

export function routineStatusForDate(
  routine: Routine,
  date: Date
): RoutineStatus {
  const today = midnight(new Date());
  const target = midnight(date);
  const isToday = isSameDay(target, today);
  const inPast = target.getTime() < today.getTime();
  const inFuture = target.getTime() > today.getTime();

  if (routine.last_completed) {
    const lastCompleted = midnight(new Date(routine.last_completed));
    if (isSameDay(lastCompleted, target)) return "completed";
  }

  if (isToday) return "due";
  if (inFuture) return "scheduled";
  if (inPast) {
    if (routine.last_completed) {
      const lastCompleted = midnight(new Date(routine.last_completed));
      if (lastCompleted.getTime() >= target.getTime()) return "completed";
    }
    if (!isRoutineScheduledOnDate(routine, date)) return "past";
    return "missed";
  }
  return "past";
}

