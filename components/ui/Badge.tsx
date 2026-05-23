import { cn } from "@/lib/cn";

type Tone = "default" | "accent" | "success" | "warning" | "danger" | "muted";

type Props = {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
  /** Show a pulsing leading dot. */
  dot?: boolean;
};

const toneColor: Record<Tone, string> = {
  default: "var(--text-secondary)",
  accent: "var(--accent)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  muted: "var(--muted)",
};

export function Badge({ tone = "default", className, children, dot }: Props) {
  const color = toneColor[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium uppercase tracking-widest",
        className,
      )}
      style={{
        color,
        backgroundColor: `${color}14`,
        boxShadow: `inset 0 0 0 1px ${color}33`,
      }}
    >
      {dot ? (
        <span
          className="inline-block animate-breathe rounded-full"
          style={{
            width: 5,
            height: 5,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      ) : null}
      {children}
    </span>
  );
}
