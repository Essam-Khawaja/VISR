"use client";

import { useEffect, useState, useCallback } from "react";
import {
  TimelineEvent,
  Routine,
  ManualChecklistItem,
  CategoryDefaultItem,
  EventItem,
  Item,
} from "@/lib/flowgram/types";
import { addDays, isoDateFromDate, isSameDay } from "@/lib/flowgram/timeline-utils";
import { isRoutineScheduledOnDate } from "@/lib/flowgram/routine-schedule";
import { LineChart, Loader2 } from "lucide-react";

type WeekChartProps = {
  startDate: string;
};

type DayCounts = {
  date: Date;
  iso: string;
  events: number;
  routines: number;
  packing: number;
};

type LinkedEventItem = {
  event_id: string;
  is_one_time: boolean;
  items: Item;
};

const HOME_KEYWORDS = [
  "home",
  "house",
  "apartment",
  "dorm",
  "bedroom",
  "living room",
  "desk",
  "kitchen",
  "remote",
  "online",
  "discord",
  "zoom",
  "teams",
  "google meet",
];

function eventLeavesHome(e: TimelineEvent): boolean {
  const text = (e.location ?? "").toLowerCase().trim();
  if (!text) return false;
  return !HOME_KEYWORDS.some((k) => text.includes(k));
}

export default function WeekChart({ startDate }: WeekChartProps) {
  const [data, setData] = useState<DayCounts[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const start = new Date(`${startDate}T00:00:00`);
      const days: Date[] = Array.from({ length: 7 }).map((_, i) =>
        addDays(start, i)
      );
      const endDate = isoDateFromDate(days[6]);

      const [eventsRes, routinesRes, defaultsRes] = await Promise.all([
        fetch(`/api/flowgram/events?date=${startDate}&date_end=${endDate}`),
        fetch("/api/flowgram/routines"),
        fetch("/api/flowgram/category-defaults"),
      ]);

      const events: TimelineEvent[] = eventsRes.ok ? await eventsRes.json() : [];
      const routines: Routine[] = routinesRes.ok
        ? await routinesRes.json()
        : [];
      const defaults: CategoryDefaultItem[] = defaultsRes.ok
        ? await defaultsRes.json()
        : [];

      const defaultByCat = new Map<string, Set<string>>();
      for (const d of defaults) {
        if (!defaultByCat.has(d.category)) {
          defaultByCat.set(d.category, new Set());
        }
        defaultByCat.get(d.category)!.add(d.item_id);
      }

      const eventItemsByEvent = new Map<string, EventItem[]>();
      if (events.length > 0) {
        try {
          const ids = events.map((e) => e.id).join(",");
          const r = await fetch(`/api/flowgram/event-items?event_ids=${ids}`);
          if (r.ok) {
            const linked: LinkedEventItem[] = await r.json();
            for (const l of linked) {
              if (!l.event_id) continue;
              if (!eventItemsByEvent.has(l.event_id)) {
                eventItemsByEvent.set(l.event_id, []);
              }
              eventItemsByEvent.get(l.event_id)!.push({
                id: "",
                event_id: l.event_id,
                item_id: l.items?.id ?? "",
                is_one_time: l.is_one_time,
              });
            }
          }
        } catch {}
      }

      const manualResults = await Promise.all(
        days.map(async (d) => {
          const iso = isoDateFromDate(d);
          try {
            const r = await fetch(`/api/flowgram/manual-checklist?date=${iso}`);
            if (r.ok) {
              const arr: ManualChecklistItem[] = await r.json();
              return { iso, count: arr.length };
            }
          } catch {}
          return { iso, count: 0 };
        })
      );
      const manualByIso = new Map(manualResults.map((m) => [m.iso, m.count]));

      const result: DayCounts[] = days.map((day) => {
        const iso = isoDateFromDate(day);
        const dayEvents = events.filter((e) => {
          const eDate = new Date(e.start_time);
          return isSameDay(eDate, day);
        });

        const realEvents = dayEvents.filter((e) => e.category !== "transit");

        const goingOut = realEvents.filter(eventLeavesHome);
        const categoriesOut = new Set(goingOut.map((e) => e.category));

        const packingIds = new Set<string>();
        for (const cat of categoriesOut) {
          const set = defaultByCat.get(cat);
          if (set) set.forEach((id) => packingIds.add(id));
        }
        for (const e of goingOut) {
          const linked = eventItemsByEvent.get(e.id) ?? [];
          for (const l of linked) {
            if (l.is_one_time && l.item_id) packingIds.add(l.item_id);
          }
        }
        const packingCount = packingIds.size + (manualByIso.get(iso) ?? 0);

        const routineCount = routines.filter((r) =>
          isRoutineScheduledOnDate(r, day)
        ).length;

        return {
          date: day,
          iso,
          events: realEvents.length,
          routines: routineCount,
          packing: packingCount,
        };
      });

      setData(result);
    } finally {
      setLoading(false);
    }
  }, [startDate]);

  useEffect(() => {
    load();
  }, [load]);

  const maxValue = Math.max(
    1,
    ...data.map((d) => Math.max(d.events, d.routines, d.packing))
  );
  const yMax = Math.max(4, Math.ceil(maxValue + 1));

  const chartWidth = 700;
  const chartHeight = 220;
  const padding = { top: 12, right: 12, bottom: 28, left: 28 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const xStep = data.length > 1 ? plotWidth / (data.length - 1) : 0;
  const yScale = (v: number) =>
    padding.top + plotHeight - (v / yMax) * plotHeight;

  function pathFor(key: keyof Pick<DayCounts, "events" | "routines" | "packing">): string {
    return data
      .map((d, i) => {
        const x = padding.left + i * xStep;
        const y = yScale(d[key]);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  const yTicks = Array.from({ length: Math.min(6, yMax + 1) }).map((_, i) =>
    Math.round((i * yMax) / Math.min(5, yMax))
  );

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-sky-400 to-indigo-500 flex items-center justify-center shadow-sm shrink-0">
          <LineChart className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold leading-tight text-stone-900">
            Week ahead
          </h2>
          <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
            Tasks, routines, and packing load for the next 7 days
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-600 mb-2">
        <LegendDot color="#3b82f6" label="Tasks" />
        <LegendDot color="#10b981" label="Routines" />
        <LegendDot color="#f43f5e" label="Pack items" />
      </div>

      {loading ? (
        <div className="h-[220px] flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-auto min-w-[420px]"
            aria-label="Week chart"
          >
            {yTicks.map((tick) => {
              const y = yScale(tick);
              return (
                <g key={tick}>
                  <line
                    x1={padding.left}
                    x2={chartWidth - padding.right}
                    y1={y}
                    y2={y}
                    stroke="#e7e5e4"
                    strokeDasharray="2 4"
                    strokeWidth={1}
                  />
                  <text
                    x={padding.left - 6}
                    y={y + 3}
                    fontSize="9"
                    textAnchor="end"
                    fill="#a8a29e"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            <path
              d={pathFor("events")}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d={pathFor("routines")}
              fill="none"
              stroke="#10b981"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d={pathFor("packing")}
              fill="none"
              stroke="#f43f5e"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {data.map((d, i) => {
              const x = padding.left + i * xStep;
              return (
                <g key={d.iso}>
                  <circle cx={x} cy={yScale(d.events)} r={3} fill="#3b82f6" />
                  <circle
                    cx={x}
                    cy={yScale(d.routines)}
                    r={3}
                    fill="#10b981"
                  />
                  <circle cx={x} cy={yScale(d.packing)} r={3} fill="#f43f5e" />
                  <text
                    x={x}
                    y={chartHeight - padding.bottom + 14}
                    fontSize="10"
                    textAnchor="middle"
                    fill={isSameDay(d.date, new Date()) ? "#f97316" : "#78716c"}
                    fontWeight={isSameDay(d.date, new Date()) ? 600 : 400}
                  >
                    {d.date.toLocaleDateString([], { weekday: "short" })}
                  </text>
                  <text
                    x={x}
                    y={chartHeight - padding.bottom + 24}
                    fontSize="8"
                    textAnchor="middle"
                    fill="#a8a29e"
                  >
                    {d.date.getDate()}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
