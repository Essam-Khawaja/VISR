"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
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
          className="text-[12px] font-medium text-secondary"
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
            "block w-full resize-y rounded-2xl border border-border bg-surface p-4 text-[15px] leading-relaxed text-primary placeholder:text-tertiary shadow-soft",
            "transition-colors duration-150 ease-out",
            "hover:border-border-strong focus:border-accent focus:outline-none focus:shadow-focus",
            error ? "border-danger focus:border-danger" : "",
            className,
          )}
          {...rest}
        />
        {showCount ? (
          <span className="pointer-events-none absolute bottom-3 right-4 text-[11px] text-tertiary tabular">
            {length}
            {maxLength ? ` / ${maxLength}` : null}
          </span>
        ) : null}
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
});
