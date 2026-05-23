"use client";

import { TimelineEvent } from "@/types";
import {
  detectLongStretchWithoutBreak,
  formatDuration,
  dayIntensity,
  formatTime,
} from "@/lib/timeline-utils";
import { AlertTriangle, Coffee, Activity, Bus } from "lucide-react";

type DayOverviewProps = {
  events: TimelineEvent[];
  city?: string;
};

type Warning = {
  icon: typeof AlertTriangle;
  message: string;
  tone: "amber" | "rose" | "sky" | "violet";
};

const CALGARY_TRANSIT_START_MIN = 6 * 60 + 30;
const CALGARY_TRANSIT_END_MIN = 23 * 60 + 30;

function minutesOfDay(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

export default function DayOverview({ events, city }: DayOverviewProps) {
  const warnings: Warning[] = [];

  const longStretch = detectLongStretchWithoutBreak(events);
  if (longStretch) {
    warnings.push({
      icon: Coffee,
      message: `${formatDuration(longStretch.minutes)} stretch without a real break. Try packing lunch.`,
      tone: "amber",
    });
  }

  const isCalgary = (city ?? "").trim().toLowerCase() === "calgary";

  if (isCalgary) {
    const offHoursEvents = events.filter((e) => {
      if (e.category === "personal" || e.category === "break") return false;
      const startMin = minutesOfDay(e.start_time);
      const endMin = minutesOfDay(e.end_time);
      return (
        startMin < CALGARY_TRANSIT_START_MIN ||
        endMin > CALGARY_TRANSIT_END_MIN
      );
    });
    if (offHoursEvents.length > 0) {
      const ex = offHoursEvents[0];
      warnings.push({
        icon: Bus,
        message: `Calgary Transit runs 6:30 AM to 11:30 PM. "${ex.title}" falls outside. Plan a rideshare or carpool.`,
        tone: "sky",
      });
    }
  } else {
    const lateEvents = events.filter((e) => {
      const end = new Date(e.end_time);
      return end.getHours() >= 22 && e.category !== "personal";
    });
    if (lateEvents.length > 0) {
      const latest = lateEvents.reduce((a, b) =>
        new Date(a.end_time) > new Date(b.end_time) ? a : b
      );
      warnings.push({
        icon: Bus,
        message: `Late finish at ${formatTime(latest.end_time)}. Double check your transit options.`,
        tone: "sky",
      });
    }
  }

  const intensity = dayIntensity(events);
  if (intensity === "intense") {
    warnings.push({
      icon: Activity,
      message: `Heavy day ahead with ${events.length} commitments. Be kind to yourself.`,
      tone: "rose",
    });
  } else if (intensity === "calm" && events.length > 0) {
    warnings.push({
      icon: Activity,
      message: `Light day. Plenty of space if you want to chip away at something.`,
      tone: "violet",
    });
  }

  if (warnings.length === 0) return null;

  const toneMap: Record<Warning["tone"], string> = {
    amber:
      "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 text-amber-800",
    rose: "bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 text-rose-800",
    sky: "bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200 text-sky-800",
    violet:
      "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 text-violet-800",
  };

  return (
    <div className="space-y-2">
      {warnings.map((w, i) => (
        <div
          key={i}
          className={`rounded-2xl px-3.5 py-2.5 border flex items-start gap-2.5 ${toneMap[w.tone]}`}
        >
          <w.icon className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2.5} />
          <p className="text-xs leading-relaxed flex-1">{w.message}</p>
        </div>
      ))}
    </div>
  );
}
