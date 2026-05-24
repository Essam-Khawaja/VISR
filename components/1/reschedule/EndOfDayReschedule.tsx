"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TimelineEvent } from "@/lib/1/types";
import {
  formatTime,
  isPastEvent,
  getDurationMinutes,
  formatDuration,
  formatDateLong,
  addDays,
  isoDateFromDate,
} from "@/lib/1/timeline-utils";
import {
  Calendar,
  Loader2,
  Check,
  X,
  CalendarPlus,
  AlertCircle,
} from "lucide-react";
import DatePicker from "@/components/1/ui/DatePicker";

type EndOfDayRescheduleProps = {
  events: TimelineEvent[];
  onReschedule: (event: TimelineEvent, newStart: string) => Promise<void>;
  onMarkDone: (event: TimelineEvent) => Promise<void>;
};

type Slot = {
  start: string;
  end: string;
  duration_minutes: number;
};

export default function EndOfDayReschedule({
  events,
  onReschedule,
  onMarkDone,
}: EndOfDayRescheduleProps) {
  const [pending, setPending] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState<TimelineEvent | null>(null);
  const [pickerDate, setPickerDate] = useState<string>("");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const incomplete = events.filter(
    (e) =>
      isPastEvent(e) &&
      !e.completed &&
      e.category !== "transit" &&
      e.category !== "break"
  );

  if (incomplete.length === 0) return null;

  function openPicker(event: TimelineEvent) {
    setScheduling(event);
    const iso = isoDateFromDate(addDays(new Date(), 1));
    setPickerDate(iso);
    fetchSlots(iso, event);
  }

  async function fetchSlots(date: string, event: TimelineEvent) {
    const minutes = getDurationMinutes(event.start_time, event.end_time);
    setLoadingSlots(true);
    setSlots(null);
    try {
      const res = await fetch(
        `/api/1/free-time?date=${date}&min_minutes=${minutes}`
      );
      if (res.ok) {
        setSlots(await res.json());
      } else {
        setSlots([]);
      }
    } finally {
      setLoadingSlots(false);
    }
  }

  async function applySlot(slot: Slot) {
    if (!scheduling) return;
    setPending(scheduling.id);
    try {
      await onReschedule(scheduling, slot.start);
      closePicker();
    } finally {
      setPending(null);
    }
  }

  function closePicker() {
    setScheduling(null);
    setPickerDate("");
    setSlots(null);
  }

  async function markDone(event: TimelineEvent) {
    setPending(event.id);
    try {
      await onMarkDone(event);
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <Calendar className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight text-stone-900">
              Wrap up your day
            </h2>
            <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
              {incomplete.length} unfinished{" "}
              {incomplete.length === 1 ? "item" : "items"}. What should happen
              with them?
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {incomplete.map((event) => {
            const isPending = pending === event.id;
            const duration = getDurationMinutes(
              event.start_time,
              event.end_time
            );
            return (
              <div
                key={event.id}
                className="rounded-xl p-3 bg-white/60 border border-stone-200/60"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">
                      {event.title}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      was {formatTime(event.start_time)} ·{" "}
                      {formatDuration(duration)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => markDone(event)}
                    disabled={isPending}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    Mark done
                  </button>
                  <button
                    onClick={() => openPicker(event)}
                    disabled={isPending}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 flex items-center gap-1 disabled:opacity-50"
                  >
                    <CalendarPlus className="w-3 h-3" />
                    Pick a new slot
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {mounted && scheduling
        ? createPortal(
            <div
          className="fixed inset-0 z-[80] bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={closePicker}
          role="dialog"
          aria-modal="true"
          aria-label="Reschedule"
        >
          <div
            className="relative w-full sm:max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 max-h-[90dvh] sm:max-h-[92dvh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 shrink-0 rounded-t-3xl bg-white overflow-hidden">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                  Reschedule
                </p>
                <h2 className="text-sm font-semibold tracking-tight truncate">
                  {scheduling.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={closePicker}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-stone-100 text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
                  Pick a day
                </label>
                <DatePicker
                  value={pickerDate}
                  onChange={(v) => {
                    setPickerDate(v);
                    fetchSlots(v, scheduling);
                  }}
                  minDate={new Date()}
                />
                {pickerDate && (
                  <p className="text-[11px] text-stone-500 mt-1">
                    {formatDateLong(`${pickerDate}T12:00:00`)}
                  </p>
                )}
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Available windows
                </p>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                  </div>
                ) : slots && slots.length === 0 ? (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                      No windows long enough on this day. Try a different day.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 max-h-72 overflow-y-auto">
                    {slots?.map((slot, i) => (
                      <button
                        key={i}
                        onClick={() => applySlot(slot)}
                        disabled={pending !== null}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 hover:from-emerald-100 hover:to-teal-100 transition-colors disabled:opacity-50"
                      >
                        <span className="text-xs font-medium text-emerald-800">
                          Start at {formatTime(slot.start)}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 tabular-nums">
                          {formatDuration(slot.duration_minutes)} free
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
            document.body,
          )
        : null}
    </>
  );
}
