"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
  /** Show character count in bottom-right of the field. */
  showCount?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { label, hint, error, className, id, showCount, value, maxLength, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  const length = typeof value === "string" ? value.length : 0;
  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-[10px] uppercase tracking-widest text-secondary"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          maxLength={maxLength}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            "block w-full resize-y border border-border bg-transparent p-4 text-[15px] leading-relaxed text-primary placeholder:text-secondary/70",
            "transition-colors duration-150 ease-out",
            "focus:border-accent focus:outline-none",
            error ? "border-danger focus:border-danger" : "",
            className,
          )}
          {...rest}
        />
        {showCount ? (
          <span className="pointer-events-none absolute bottom-2 right-3 text-[10px] uppercase tracking-widest text-secondary tabular">
            {length}
            {maxLength ? ` / ${maxLength}` : null}
          </span>
        ) : null}
      </div>
      {error ? (
        <span className="flex items-center gap-1.5 text-[11px] text-danger">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-danger"
          />
          {error}
        </span>
      ) : hint ? (
        <span className="text-[11px] text-secondary">{hint}</span>
      ) : null}
    </div>
  );
});
