"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, hint, error, className, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
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
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          "h-11 w-full border border-border bg-transparent px-3 text-[15px] text-primary placeholder:text-secondary/70",
          "transition-colors duration-150 ease-out",
          "focus:border-accent focus:outline-none",
          error ? "border-danger focus:border-danger" : "",
          className,
        )}
        {...rest}
      />
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
