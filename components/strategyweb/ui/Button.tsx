"use client";

import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/shared/cn";

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
  "inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:shadow-focus rounded-full";

const sizeMap: Record<Size, string> = {
  sm: "h-9 px-4 text-[12px]",
  md: "h-11 px-5 text-[13px]",
  lg: "h-12 px-7 text-[14px]",
};

const variantMap: Record<Variant, string> = {
  primary:
    "text-white bg-gradient-to-br from-amaranth to-thulian shadow-soft hover:shadow-card hover:-translate-y-px active:translate-y-0",
  secondary:
    "bg-white/70 text-primary border border-border backdrop-blur-sm hover:border-border-strong hover:bg-white",
  ghost:
    "bg-transparent text-secondary hover:text-primary hover:bg-white/60",
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
