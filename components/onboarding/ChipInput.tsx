"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

type ChipInputProps = {
  value: string[];
  onChange: (items: string[]) => void;
  name?: string;
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  maxChips?: number;
};

export function ChipInput({
  value,
  onChange,
  name,
  label,
  placeholder,
  hint,
  error,
  maxChips = 15,
}: ChipInputProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addChip = (text: string) => {
    const trimmed = text.trim();
    if (trimmed && !value.includes(trimmed) && value.length < maxChips) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addChip(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (draft.trim()) addChip(draft);
  };

  const removeChip = (chip: string) => {
    onChange(value.filter((c) => c !== chip));
    inputRef.current?.focus();
  };

  const inputId = name;

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-[12px] font-medium text-secondary"
        >
          {label}
        </label>
      ) : null}

      <div
        className={cn(
          "flex min-h-[48px] w-full flex-wrap items-center gap-1.5 rounded-xl border bg-surface px-3 py-2",
          "transition-colors duration-150 ease-out shadow-soft",
          "hover:border-border-strong focus-within:border-accent focus-within:shadow-focus",
          error ? "border-danger focus-within:border-danger" : "border-border",
        )}
        onClick={() => inputRef.current?.focus()}
        role="group"
        aria-label={label ? `${label} — ${value.length} added` : undefined}
      >
        {value.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1 rounded-full bg-elevated px-3 py-1 text-[12px] font-medium text-primary"
          >
            {chip}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeChip(chip);
              }}
              className="ml-0.5 text-tertiary transition-colors hover:text-danger"
              aria-label={`Remove ${chip}`}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[100px] flex-1 border-none bg-transparent text-[15px] text-primary outline-none placeholder:text-tertiary"
          aria-invalid={Boolean(error) || undefined}
        />
      </div>

      {error ? (
        <span className="flex items-center gap-1.5 text-[12px] text-danger">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-danger"
          />
          {error}
        </span>
      ) : hint ? (
        <span className="text-[12px] text-tertiary">{hint}</span>
      ) : null}
    </div>
  );
}
