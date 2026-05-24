import { cn } from "@/lib/shared/cn";

type Props = {
  label: string;
  color?: string;
  className?: string;
  rotation?: number;
};

export function Stamp({ label, color, className, rotation = -1 }: Props) {
  const c = color ?? "var(--accent)";
  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-2 rounded-lg border-2 px-3 py-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.14em]",
        className,
      )}
      style={{
        color: c,
        borderColor: c,
        transform: `rotate(${rotation}deg)`,
        backgroundColor: "var(--bg-surface)",
      }}
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: c }}
      />
      {label}
    </span>
  );
}
