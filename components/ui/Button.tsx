"use client";

import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  CommonProps & {
    href?: undefined;
  };

type LinkProps = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-all duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:shadow-focus";

const sizeMap: Record<Size, string> = {
  sm: "h-9 px-4 text-[12px] rounded-xl",
  md: "h-11 px-5 text-[13px] rounded-xl",
  lg: "h-12 px-7 text-[14px] rounded-2xl",
};

const variantMap: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-soft hover:bg-accent-strong hover:shadow-card active:translate-y-px",
  secondary:
    "bg-surface text-primary border border-border-strong hover:border-primary hover:bg-elevated",
  ghost:
    "bg-transparent text-secondary hover:text-primary hover:bg-elevated",
  danger:
    "bg-danger text-white hover:opacity-90 active:translate-y-px",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    className,
    children,
    type = "button",
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(base, sizeMap[size], variantMap[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
});

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  target,
  rel,
}: LinkProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={cn(base, sizeMap[size], variantMap[variant], className)}
    >
      {children}
    </Link>
  );
}
