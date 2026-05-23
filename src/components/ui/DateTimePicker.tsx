"use client";

import { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";

type DateTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  minDate?: Date;
  maxDate?: Date;
};

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function parseValue(value: string): Date {
  if (!value) return new Date();
  const d = new Date(value);
  if (isNaN(d.getTime())) return new Date();
  return d;
}

function formatValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDisplay(d: Date): string {
  return d.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBeforeDay(a: Date, b: Date): boolean {
  return (
    new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime() <
    new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()
  );
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

export default function DateTimePicker({
  value,
  onChange,
  minDate,
  maxDate,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = parseValue(value);
  const [viewMonth, setViewMonth] = useState(startOfMonth(current));
  const [hour, setHour] = useState(current.getHours());
  const [minute, setMinute] = useState(current.getMinutes());

  useEffect(() => {
    if (open) {
      const d = parseValue(value);
      setViewMonth(startOfMonth(d));
      setHour(d.getHours());
      setMinute(d.getMinutes());
    }
  }, [open, value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function pickDay(day: number) {
    const next = new Date(
      viewMonth.getFullYear(),
      viewMonth.getMonth(),
      day,
      hour,
      minute,
      0,
      0
    );
    onChange(formatValue(next));
  }

  function changeHour(h: number) {
    setHour(h);
    const next = new Date(current);
    next.setHours(h, minute, 0, 0);
    onChange(formatValue(next));
  }

  function changeMinute(m: number) {
    setMinute(m);
    const next = new Date(current);
    next.setHours(hour, m, 0, 0);
    onChange(formatValue(next));
  }

  const firstDayOfMonth = startOfMonth(viewMonth);
  const startDow = firstDayOfMonth.getDay();
  const totalDays = daysInMonth(viewMonth);

  const cells: Array<{ day: number | null; date?: Date }> = [];
  for (let i = 0; i < startDow; i++) cells.push({ day: null });
  for (let d = 1; d <= totalDays; d++) {
    cells.push({
      day: d,
      date: new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d),
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full input-soft flex items-center gap-2 text-left"
      >
        <CalendarIcon className="w-4 h-4 text-stone-400 shrink-0" />
        <span className={value ? "text-stone-900" : "text-stone-400"}>
          {value ? formatDisplay(current) : "Pick date and time"}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 left-0 w-[20rem] bg-white border border-stone-200 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() =>
                setViewMonth(
                  new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1)
                )
              }
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-stone-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <p className="text-sm font-semibold">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </p>
            <button
              type="button"
              onClick={() =>
                setViewMonth(
                  new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)
                )
              }
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-stone-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DOW.map((d, i) => (
              <div
                key={i}
                className="text-[10px] text-stone-400 font-medium text-center py-1"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              if (cell.day == null) {
                return <div key={i} />;
              }
              const dateForCell = cell.date!;
              const disabled =
                (minDate && isBeforeDay(dateForCell, minDate)) ||
                (maxDate && isBeforeDay(maxDate, dateForCell));
              const isSelected = isSameDay(dateForCell, current);
              const isToday = isSameDay(dateForCell, new Date());

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => !disabled && pickDay(cell.day!)}
                  disabled={disabled}
                  className={`aspect-square text-xs rounded-lg flex items-center justify-center transition-all ${
                    disabled
                      ? "text-stone-300 cursor-not-allowed"
                      : isSelected
                        ? "bg-gradient-to-br from-orange-400 to-rose-500 text-white font-semibold shadow-sm"
                        : isToday
                          ? "bg-stone-100 text-stone-900 font-semibold hover:bg-stone-200"
                          : "text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="border-t border-stone-100 mt-4 pt-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <p className="text-xs font-medium text-stone-500">Time</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={hour}
                onChange={(e) => changeHour(Number(e.target.value))}
                className="flex-1 input-soft text-center"
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <option key={h} value={h}>
                    {pad(h)}
                  </option>
                ))}
              </select>
              <span className="text-stone-400 font-medium">:</span>
              <select
                value={minute}
                onChange={(e) => changeMinute(Number(e.target.value))}
                className="flex-1 input-soft text-center"
              >
                {Array.from({ length: 12 }).map((_, i) => {
                  const m = i * 5;
                  return (
                    <option key={m} value={m}>
                      {pad(m)}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full mt-4 px-4 py-2 rounded-xl btn-primary text-sm font-medium"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
