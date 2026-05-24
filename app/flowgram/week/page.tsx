/**
 * app/flowgram/week/page.tsx
 *
 * Seven-day grid that places events, personal time, routines, and strategy
 * tasks across columns. Each day links into the Flowgram day view via the
 * `?date=YYYY-MM-DD` query param. Useful for spotting overload before the
 * day arrives.
 */

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { TimelineEvent, PersonalTimeBlock } from "@/lib/flowgram/types";
import {
  formatTime,
  formatDuration,
  getDurationMinutes,
  addDays,
  isoDateFromDate,
  isSameDay,
} from "@/lib/flowgram/timelineUtils";
import {
  blocksForDate,
  blocksToPhantomEvents,
} from "@/lib/flowgram/personalTime";
import { getCategoryStyles, getCategoryIcon } from "@/lib/flowgram/categoryColors";
import ScrollingText from "@/components/flowgram/ui/ScrollingText";
import { ChevronLeft, ChevronRight, Loader2, Target } from "lucide-react";
import Link from "next/link";
import { demoPlanId } from "@/lib/shared/env";
import { fixturePlan } from "@/lib/strategyweb/fixture";
import { getActivePlanId } from "@/lib/strategyweb/planStore";
import {
  ensureMaterializedTasks,
  excludeLegacyGeneratedTasks,
  fetchTasksFromSupabase,
  loadTasks,
  mergeTasks,
} from "@/lib/strategyweb/taskStore";
import type { StrategyTask } from "@/lib/strategyweb/types";

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

function strategyTaskClass(task: StrategyTask): string {
  if (task.status === "done") {
    return "border-slate-200 bg-slate-50 text-slate-400 line-through";
  }
  // Past-but-open tasks share the same priority styling as upcoming ones -
  // we don't surface a separate "overdue" state in the week pane.
  if (task.priority === "High") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }
  return "border-sky-200 bg-sky-50 text-sky-700";
}

export default function WeekPage() {
  const [planId] = useState(() => getActivePlanId() ?? demoPlanId);
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [eventsByDay, setEventsByDay] = useState<
    Record<string, TimelineEvent[]>
  >({});
  const [personalBlocks, setPersonalBlocks] = useState<PersonalTimeBlock[]>([]);
  const [strategyTasksByDay, setStrategyTasksByDay] = useState<
    Record<string, StrategyTask[]>
  >({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (start: Date) => {
    setLoading(true);
    try {
      const end = addDays(start, 6);
      if (loadTasks(planId).length === 0 && planId === demoPlanId) {
        ensureMaterializedTasks({ ...fixturePlan, id: demoPlanId });
      }
      const [eventsRes, personalRes, strategyTasks] = await Promise.all([
        fetch(
          `/api/flowgram/events?date=${isoDateFromDate(start)}&date_end=${isoDateFromDate(end)}`
        ),
        fetch("/api/flowgram/personal-time"),
        fetchTasksFromSupabase({
          planId,
          dateFrom: isoDateFromDate(start),
          dateTo: isoDateFromDate(end),
        }),
      ]);
      if (eventsRes.ok) {
        const all = (await eventsRes.json()) as TimelineEvent[];
        const grouped: Record<string, TimelineEvent[]> = {};
        for (const e of all) {
          const day = isoDateFromDate(new Date(e.start_time));
          if (!grouped[day]) grouped[day] = [];
          grouped[day].push(e);
        }
        setEventsByDay(grouped);
      }
      if (personalRes.ok) {
        setPersonalBlocks(await personalRes.json());
      }
      const groupedTasks: Record<string, StrategyTask[]> = {};
      const filtered = excludeLegacyGeneratedTasks(
        mergeTasks(loadTasks(planId), strategyTasks),
      );
      for (const task of filtered) {
        if (!groupedTasks[task.dueDate]) groupedTasks[task.dueDate] = [];
        groupedTasks[task.dueDate].push(task);
      }
      setStrategyTasksByDay(groupedTasks);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    load(weekStart);
  }, [weekStart, load]);

  const days = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );
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
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-4">
        <div className="flex items-center justify-between gap-3 glass-card rounded-2xl px-3 py-2">
          <button
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-stone-100"
            aria-label="Previous week"
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
            aria-label="Next week"
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
              const realEvents = eventsByDay[key] ?? [];
              const phantoms = blocksToPhantomEvents(
                blocksForDate(personalBlocks, day),
                day
              );
              const dayEvents = [...realEvents, ...phantoms].sort(
                (a, b) =>
                  new Date(a.start_time).getTime() -
                  new Date(b.start_time).getTime()
              );
              const strategyTasks = strategyTasksByDay[key] ?? [];
              const isCurrentDay = isSameDay(day, today);
              return (
                <Link
                  key={key}
                  href={`/flowgram?date=${key}`}
                  className={`glass-card rounded-2xl p-3 hover:scale-[1.005] transition-transform flex flex-col min-h-[180px] ${
                    isCurrentDay
                      ? "ring-2 ring-orange-300 ring-offset-2 ring-offset-transparent"
                      : ""
                  }`}
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      {day.toLocaleDateString([], { weekday: "short" })}
                    </p>
                    <p
                      className={`text-lg font-semibold tabular-nums ${isCurrentDay ? "text-orange-500" : "text-stone-900"}`}
                    >
                      {day.getDate()}
                    </p>
                  </div>
                  <div className="space-y-1 flex-1">
                    {dayEvents.length === 0 && strategyTasks.length === 0 ? (
                      <p className="text-[11px] text-stone-400 italic">Empty</p>
                    ) : (
                      <>
                        {dayEvents.map((e) => {
                        const styles = getCategoryStyles(e.category);
                        const Icon = getCategoryIcon(e.category);
                        const dur = getDurationMinutes(
                          e.start_time,
                          e.end_time
                        );
                        const completed = e.completed === true;
                        return (
                          <div
                            key={e.id}
                            className={`flex items-start gap-1.5 px-1.5 py-1 rounded-lg ${styles.bgSoft} border ${styles.border} ${completed ? "opacity-60" : ""}`}
                          >
                            <Icon
                              className={`w-3 h-3 mt-0.5 shrink-0 ${styles.text}`}
                              strokeWidth={2.5}
                            />
                            <div className="min-w-0 flex-1">
                              <ScrollingText
                                text={e.title}
                                className={`text-[11px] font-medium leading-tight ${completed ? "text-stone-400 line-through" : "text-stone-900"}`}
                              />
                              <p className={`text-[10px] leading-tight ${completed ? "text-stone-400 line-through" : "text-stone-500"}`}>
                                {formatTime(e.start_time)} ·{" "}
                                {formatDuration(dur)}
                              </p>
                            </div>
                          </div>
                        );
                        })}
                        {strategyTasks.map((task) => (
                          <div
                            key={task.id}
                            className={
                              "flex items-center gap-1.5 rounded-lg border px-1.5 py-1 " +
                              strategyTaskClass(task)
                            }
                          >
                            <Target
                              className="h-3 w-3 shrink-0 opacity-70"
                              strokeWidth={2.5}
                            />
                            <div className="min-w-0 flex-1">
                              <ScrollingText
                                text={task.title}
                                className="text-[11px] font-semibold leading-tight"
                              />
                            </div>
                          </div>
                        ))}
                      </>
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
