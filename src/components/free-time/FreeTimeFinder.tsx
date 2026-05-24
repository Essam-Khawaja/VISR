"use client";

import { useEffect, useState } from "react";
import { FreeSlot, UserSettings } from "@/types";
import {
  formatTime,
  formatDuration,
  formatDateLong,
  todayISODate,
} from "@/lib/timeline-utils";
import { Search, X, Loader2, Sparkles, CalendarPlus } from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";

type FreeTimeFinderProps = {
  onScheduleSlot?: (start: string, end: string) => void;
};

export default function FreeTimeFinder({ onScheduleSlot }: FreeTimeFinderProps) {
  const today = todayISODate();
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState(30);
  const [date, setDate] = useState<string>(today);
  const [results, setResults] = useState<FreeSlot[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setSettings(data))
      .catch(() => {});
  }, []);

  async function search() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        min_minutes: String(duration),
        date,
      });
      const wake = (settings?.wake_time ?? "").slice(0, 5);
      const sleep = (settings?.sleep_time ?? "").slice(0, 5);
      if (wake) params.set("wake_time", wake);
      if (sleep) params.set("sleep_time", sleep);
      const res = await fetch(`/api/free-time?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full glass-card rounded-2xl px-4 py-3 flex items-center gap-3 text-left hover:scale-[1.005] transition-transform"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
          <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-stone-900">Find free time</p>
          <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
            Looking for a window to slot something in?
          </p>
        </div>
        <Search className="w-4 h-4 text-stone-400" />
      </button>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-stone-600" />
          <h3 className="text-sm font-semibold text-stone-900">
            Find Free Time
          </h3>
        </div>
        <button
          onClick={() => {
            setOpen(false);
            setResults(null);
          }}
          className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1"
        >
          <X className="w-3.5 h-3.5" />
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] font-medium text-stone-500 block mb-1">
            Date
          </label>
          <DatePicker
            value={date}
            onChange={setDate}
            minDate={new Date()}
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-stone-500 block mb-1">
            Minimum duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full input-soft"
          >
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
          </select>
        </div>
      </div>

      <button
        onClick={search}
        disabled={loading}
        className="w-full px-4 py-2.5 rounded-xl btn-primary text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Search className="w-4 h-4" />
        )}
        Search
      </button>

      {results !== null && (
        <div className="pt-2 border-t border-stone-200/60">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 mb-2">
            {formatDateLong(`${date}T12:00:00`)}
          </p>
          {results.length === 0 ? (
            <p className="text-xs text-stone-500 py-3 text-center">
              No free windows of that length on this day.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {results.map((slot, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-emerald-800">
                      {formatTime(slot.start)} - {formatTime(slot.end)}
                    </p>
                    <p className="text-[10px] text-emerald-700/80">
                      {formatDuration(slot.duration_minutes)} free
                    </p>
                  </div>
                  {onScheduleSlot && (
                    <button
                      onClick={() => onScheduleSlot(slot.start, slot.end)}
                      className="text-[11px] font-medium px-2 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 flex items-center gap-1"
                    >
                      <CalendarPlus className="w-3 h-3" />
                      Schedule
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
