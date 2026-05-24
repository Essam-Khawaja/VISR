"use client";

import { useEffect, useState } from "react";
import { FreeSlot, UserSettings } from "@/lib/flowgram/types";
import {
  formatTime,
  formatDuration,
  formatDateLong,
  todayISODate,
} from "@/lib/flowgram/timelineUtils";
import { Search, X, Loader2, Sparkles, CalendarPlus } from "lucide-react";
import DatePicker from "@/components/flowgram/ui/DatePicker";

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
    fetch("/api/flowgram/settings")
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
      const res = await fetch(`/api/flowgram/free-time?${params.toString()}`);
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
        className="w-full glass-card px-4 py-3 flex items-center gap-3 text-left hover:bg-white/85 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sage to-brook flex items-center justify-center shadow-soft">
          <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-primary">Find free time</p>
          <p className="text-[11px] text-tertiary leading-tight mt-0.5">
            Looking for a window to slot something in?
          </p>
        </div>
        <Search className="w-4 h-4 text-tertiary" strokeWidth={1.8} />
      </button>
    );
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-secondary" strokeWidth={1.8} />
          <h3 className="text-sm font-semibold text-primary">
            Find Free Time
          </h3>
        </div>
        <button
          onClick={() => {
            setOpen(false);
            setResults(null);
          }}
          className="text-xs text-tertiary hover:text-primary flex items-center gap-1"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.8} />
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] font-medium text-tertiary block mb-1">
            Date
          </label>
          <DatePicker
            value={date}
            onChange={setDate}
            minDate={new Date()}
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-tertiary block mb-1">
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
        className="w-full px-4 py-2.5 btn-primary text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Search className="w-4 h-4" strokeWidth={1.8} />
        )}
        Search
      </button>

      {results !== null && (
        <div className="pt-2 border-t border-border">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-tertiary mb-2">
            {formatDateLong(`${date}T12:00:00`)}
          </p>
          {results.length === 0 ? (
            <p className="text-xs text-tertiary py-3 text-center">
              No free windows of that length on this day.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {results.map((slot, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-sage/[0.10] border border-sage/25"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-sage">
                      {formatTime(slot.start)} - {formatTime(slot.end)}
                    </p>
                    <p className="text-[10px] text-sage/80">
                      {formatDuration(slot.duration_minutes)} free
                    </p>
                  </div>
                  {onScheduleSlot && (
                    <button
                      onClick={() => onScheduleSlot(slot.start, slot.end)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white border border-sage/30 text-sage hover:bg-sage/[0.06] flex items-center gap-1"
                    >
                      <CalendarPlus className="w-3 h-3" strokeWidth={1.8} />
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
