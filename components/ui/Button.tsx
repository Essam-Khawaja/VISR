"use client";

import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

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
  "group relative inline-flex items-center justify-center gap-2 font-medium tracking-tight uppercase text-[12px] transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50";

const sizeMap: Record<Size, string> = {
  md: "h-10 px-5",
  lg: "h-12 px-7 text-[13px]",
};

const variantMap: Record<Variant, string> = {
  primary:
    "text-base bg-accent hover:bg-accent/90 active:bg-accent/80 [letter-spacing:0.14em]",
  secondary:
    "text-primary bg-transparent border border-border hover:border-accent hover:text-accent [letter-spacing:0.14em]",
  ghost:
    "text-secondary hover:text-primary [letter-spacing:0.14em]",
};

function inner(variant: Variant, children: React.ReactNode) {
  if (variant !== "primary") return <span className="relative">{children}</span>;
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <span
          aria-hidden
          className="absolute inset-y-0 -left-1/2 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[300%]"
        />
      </span>
      <span className="relative text-base mix-blend-normal">{children}</span>
    </>
  );
}

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
      {inner(variant, children)}
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
      {inner(variant, children)}
    </Link>
  );
}
