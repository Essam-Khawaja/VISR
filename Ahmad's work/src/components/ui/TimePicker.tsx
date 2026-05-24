"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Clock } from "lucide-react";

type TimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function parseValue(value: string): { h: number; m: number } {
  if (!value) return { h: 9, m: 0 };
  const [h, m] = value.split(":").map(Number);
  return {
    h: Number.isNaN(h) ? 9 : Math.max(0, Math.min(23, h)),
    m: Number.isNaN(m) ? 0 : Math.max(0, Math.min(59, m)),
  };
}

function formatDisplay(h: number, m: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:${pad(m)} ${period}`;
}

const POPOVER_WIDTH = 220;
const POPOVER_MAX_HEIGHT = 220;

export default function TimePicker({
  value,
  onChange,
  placeholder = "Pick a time",
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const { h: initialH, m: initialM } = parseValue(value);
  const [hour, setHour] = useState(initialH);
  const [minute, setMinute] = useState(initialM);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const parsed = parseValue(value);
    setHour(parsed.h);
    setMinute(parsed.m);
  }, [value]);

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

  function commit(h: number, m: number) {
    setHour(h);
    setMinute(m);
    onChange(`${pad(h)}:${pad(m)}`);
  }

  const popover = open ? (
    <div
      ref={popoverRef}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: POPOVER_WIDTH,
        zIndex: 10000,
      }}
      className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-3.5 h-3.5 text-stone-400" />
        <p className="text-xs font-medium text-stone-500">Time</p>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={hour}
          onChange={(e) => commit(Number(e.target.value), minute)}
          className="flex-1 input-soft text-center"
          aria-label="Hour"
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
          onChange={(e) => commit(hour, Number(e.target.value))}
          className="flex-1 input-soft text-center"
          aria-label="Minute"
        >
          {Array.from({ length: 60 }).map((_, m) => (
            <option key={m} value={m}>
              {pad(m)}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="w-full mt-4 px-4 py-2 rounded-xl btn-primary text-sm font-medium"
      >
        Done
      </button>
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
        <Clock className="w-4 h-4 text-stone-400 shrink-0" />
        <span
          className={`truncate ${value ? "text-stone-900" : "text-stone-400"}`}
        >
          {value ? formatDisplay(hour, minute) : placeholder}
        </span>
      </button>
      {mounted && popover && createPortal(popover, document.body)}
    </>
  );
}
