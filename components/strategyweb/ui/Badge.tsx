import { cn } from "@/lib/shared/cn";

type Tone = "default" | "accent" | "success" | "warning" | "danger" | "muted";

type Props = {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
  /** Show a leading dot. */
  dot?: boolean;
};

const toneClass: Record<Tone, { text: string; bg: string; dot: string }> = {
  default: {
    text: "text-secondary",
    bg: "bg-elevated",
    dot: "bg-tertiary",
  },
  accent: { text: "text-accent-strong", bg: "bg-accent-soft", dot: "bg-accent" },
  success: { text: "text-success", bg: "bg-success-soft", dot: "bg-success" },
  warning: { text: "text-warning", bg: "bg-warning-soft", dot: "bg-warning" },
  danger: { text: "text-danger", bg: "bg-danger-soft", dot: "bg-danger" },
  muted: { text: "text-tertiary", bg: "bg-muted-soft", dot: "bg-muted" },
};

export function Badge({ tone = "default", className, children, dot }: Props) {
  const c = toneClass[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        c.text,
        c.bg,
        className,
      )}
    >
      {dot ? (
        <span
          aria-hidden
          className={cn("inline-block h-1.5 w-1.5 rounded-full", c.dot)}
        />
      ) : null}
      {children}
    </span>
  );
}
