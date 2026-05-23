import { cn } from "@/lib/cn";

type Props = {
  label: string;
  color?: string;
  className?: string;
  /** Slight rotation for the "stamped" feel. */
  rotation?: number;
};

export function Stamp({ label, color, className, rotation = -2 }: Props) {
  const c = color ?? "var(--text-primary)";
  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-2 px-3 py-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.28em]",
        className,
      )}
      style={{
        color: c,
        transform: `rotate(${rotation}deg)`,
        border: `1.5px solid ${c}`,
        boxShadow: `inset 0 0 0 4px var(--bg-base), 0 0 0 1px ${c}33`,
        backgroundColor: "transparent",
      }}
    >
      <span aria-hidden className="block h-1.5 w-1.5" style={{ backgroundColor: c }} />
      {label}
    </span>
  );
}
