"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import { TimelineEvent } from "@/types";
import {
  formatTime,
  formatDuration,
  getDurationMinutes,
  addDays,
  isoDateFromDate,
  isSameDay,
} from "@/lib/timeline-utils";
import { getCategoryStyles, getCategoryIcon } from "@/lib/category-colors";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

export default function WeekPage() {
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [eventsByDay, setEventsByDay] = useState<
    Record<string, TimelineEvent[]>
  >({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (start: Date) => {
    setLoading(true);
    try {
      const end = addDays(start, 6);
      const res = await fetch(
        `/api/events?date=${isoDateFromDate(start)}&date_end=${isoDateFromDate(end)}`
      );
      if (res.ok) {
        const all = (await res.json()) as TimelineEvent[];
        const grouped: Record<string, TimelineEvent[]> = {};
        for (const e of all) {
          const day = e.start_time.split("T")[0];
          if (!grouped[day]) grouped[day] = [];
          grouped[day].push(e);
        }
        setEventsByDay(grouped);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(weekStart);
  }, [weekStart, load]);

  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  const today = new Date();
  const currentWeekStart = startOfWeek(today);
  const isCurrentWeek = isSameDay(weekStart, currentWeekStart);

  const weekEnd = addDays(weekStart, 6);
  const weekLabel = `${weekStart.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  })} to ${weekEnd.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div className="min-h-screen pb-24">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        <div className="flex items-center justify-between gap-3 glass-card rounded-2xl px-3 py-2">
          <button
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-stone-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center flex-1">
            <p className="text-sm font-semibold">{weekLabel}</p>
            {isCurrentWeek ? (
              <p className="text-[11px] text-stone-400 font-medium mt-0.5">
                This week
              </p>
            ) : (
              <button
                onClick={() => setWeekStart(currentWeekStart)}
                className="text-[11px] text-orange-500 hover:text-orange-600 font-medium mt-0.5"
              >
                Go to current week
              </button>
            )}
          </div>
          <button
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-stone-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="glass-card rounded-2xl p-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {days.map((day) => {
              const key = isoDateFromDate(day);
              const dayEvents = eventsByDay[key] ?? [];
              const isCurrentDay = isSameDay(day, today);
              return (
                <Link
                  key={key}
                  href={`/?date=${key}`}
                  className={`glass-card rounded-2xl p-3 hover:scale-[1.01] transition-transform flex flex-col min-h-[180px] ${
                    isCurrentDay
                      ? "ring-2 ring-orange-300 ring-offset-2 ring-offset-transparent"
                      : ""
                  }`}
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      {day.toLocaleDateString([], { weekday: "short" })}
                    </p>
                    <p className={`text-lg font-semibold tabular-nums ${isCurrentDay ? "text-orange-500" : "text-stone-900"}`}>
                      {day.getDate()}
                    </p>
                  </div>
                  <div className="space-y-1 flex-1">
                    {dayEvents.length === 0 ? (
                      <p className="text-[11px] text-stone-400 italic">Empty</p>
                    ) : (
                      dayEvents.slice(0, 5).map((e) => {
                        const styles = getCategoryStyles(e.category);
                        const Icon = getCategoryIcon(e.category);
                        const dur = getDurationMinutes(
                          e.start_time,
                          e.end_time
                        );
                        return (
                          <div
                            key={e.id}
                            className={`flex items-start gap-1.5 px-1.5 py-1 rounded-lg ${styles.bgSoft} border ${styles.border}`}
                          >
                            <Icon className={`w-3 h-3 mt-0.5 shrink-0 ${styles.text}`} strokeWidth={2.5} />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-medium text-stone-900 truncate leading-tight">
                                {e.title}
                              </p>
                              <p className="text-[10px] text-stone-500 leading-tight">
                                {formatTime(e.start_time)} ·{" "}
                                {formatDuration(dur)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    {dayEvents.length > 5 && (
                      <p className="text-[10px] text-stone-400 text-center pt-1">
                        +{dayEvents.length - 5} more
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
