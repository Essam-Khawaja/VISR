import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  color?: string;
  size?: number;
  thickness?: number;
};

export function CornerBrackets({
  className,
  color = "var(--border)",
  size = 14,
  thickness = 1.5,
}: Props) {
  const lineStyle: React.CSSProperties = {
    position: "absolute",
    backgroundColor: color,
    pointerEvents: "none",
  };

  const h: React.CSSProperties = {
    ...lineStyle,
    height: thickness,
    width: size,
  };

  const v: React.CSSProperties = {
    ...lineStyle,
    width: thickness,
    height: size,
  };

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <span style={{ ...h, top: 0, left: 0 }} />
      <span style={{ ...v, top: 0, left: 0 }} />
      <span style={{ ...h, top: 0, right: 0 }} />
      <span style={{ ...v, top: 0, right: 0 }} />
      <span style={{ ...h, bottom: 0, left: 0 }} />
      <span style={{ ...v, bottom: 0, left: 0 }} />
      <span style={{ ...h, bottom: 0, right: 0 }} />
      <span style={{ ...v, bottom: 0, right: 0 }} />
    </div>
  );
}
