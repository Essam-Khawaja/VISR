"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addDays,
  isoDateFromDate,
  isSameDay,
} from "@/lib/flowgram/timeline-utils";

type DayNavigatorProps = {
  selectedDate: string;
  onChange: (isoDate: string) => void;
};

export default function DayNavigator({
  selectedDate,
  onChange,
}: DayNavigatorProps) {
  const current = new Date(`${selectedDate}T12:00:00`);
  const today = new Date();
  const isToday = isSameDay(current, today);

  const label = current.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  function prev() {
    onChange(isoDateFromDate(addDays(current, -1)));
  }
  function next() {
    onChange(isoDateFromDate(addDays(current, 1)));
  }
  function goToday() {
    onChange(isoDateFromDate(today));
  }

  return (
    <div className="flex items-center justify-between gap-3 glass-card px-3 py-2">
      <button
        type="button"
        onClick={prev}
        className="w-9 h-9 rounded-full flex items-center justify-center text-secondary hover:bg-white/80 hover:text-primary transition-colors"
        aria-label="Previous day"
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={1.8} />
      </button>

      <div className="flex-1 text-center min-w-0">
        <h2 className="text-sm font-semibold text-primary truncate">{label}</h2>
        {!isToday && (
          <button
            type="button"
            onClick={goToday}
            className="text-[11px] text-amaranth hover:text-accent-strong font-medium mt-0.5"
          >
            Jump to today
          </button>
        )}
        {isToday && (
          <p className="text-[11px] text-tertiary mt-0.5">Today</p>
        )}
      </div>

      <button
        type="button"
        onClick={next}
        className="w-9 h-9 rounded-full flex items-center justify-center text-secondary hover:bg-white/80 hover:text-primary transition-colors"
        aria-label="Next day"
      >
        <ChevronRight className="w-4 h-4" strokeWidth={1.8} />
      </button>
    </div>
  );
}
