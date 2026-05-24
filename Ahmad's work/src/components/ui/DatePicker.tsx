"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
};

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function parseValue(value: string): Date {
  if (!value) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const parts = value.split("-").map(Number);
  if (parts.length === 3 && parts.every((p) => !Number.isNaN(p))) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const d = new Date(value);
  if (isNaN(d.getTime())) return new Date();
  return d;
}

function formatValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDisplay(d: Date): string {
  return d.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
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

const POPOVER_WIDTH = 320;
const POPOVER_MAX_HEIGHT = 440;

export default function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Pick a date",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const current = parseValue(value);
  const [viewMonth, setViewMonth] = useState(startOfMonth(current));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setViewMonth(startOfMonth(parseValue(value)));
    }
  }, [open, value]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    function reposition() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 8;
      let left = rect.left;
      if (left + POPOVER_WIDTH + margin > viewportWidth) {
        left = Math.max(margin, viewportWidth - POPOVER_WIDTH - margin);
      }
      if (left < margin) left = margin;
      let top = rect.bottom + 4;
      if (top + POPOVER_MAX_HEIGHT + margin > viewportHeight) {
        const above = rect.top - POPOVER_MAX_HEIGHT - 4;
        if (above >= margin) {
          top = above;
        } else {
          top = Math.max(margin, viewportHeight - POPOVER_MAX_HEIGHT - margin);
        }
      }
      setPos({ top, left });
    }
    reposition();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function pickDay(day: number) {
    const next = new Date(
      viewMonth.getFullYear(),
      viewMonth.getMonth(),
      day
    );
    onChange(formatValue(next));
    setOpen(false);
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

  const popover = open ? (
    <div
      ref={popoverRef}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: POPOVER_WIDTH,
        maxHeight: POPOVER_MAX_HEIGHT,
        zIndex: 10000,
      }}
      className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() =>
            setViewMonth(
              new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1)
            )
          }
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-stone-100 transition-colors"
          aria-label="Previous month"
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
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-stone-100 transition-colors"
          aria-label="Next month"
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
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full input-soft flex items-center gap-2 text-left"
      >
        <CalendarIcon className="w-4 h-4 text-stone-400 shrink-0" />
        <span
          className={`truncate ${value ? "text-stone-900" : "text-stone-400"}`}
        >
          {value ? formatDisplay(current) : placeholder}
        </span>
      </button>
      {mounted && popover && createPortal(popover, document.body)}
    </>
  );
}
