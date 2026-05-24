import { cn } from "@/lib/shared/cn";

type Props = {
  className?: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
};

export function Reticle({
  className,
  color = "var(--border)",
  size = 240,
  strokeWidth = 1,
}: Props) {
  const half = size / 2;
  const gap = size * 0.18;
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={cn("pointer-events-none absolute", className)}
    >
      <line
        x1="0"
        y1={half}
        x2={half - gap}
        y2={half}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <line
        x1={half + gap}
        y1={half}
        x2={size}
        y2={half}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <line
        x1={half}
        y1="0"
        x2={half}
        y2={half - gap}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <line
        x1={half}
        y1={half + gap}
        x2={half}
        y2={size}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={half}
        cy={half}
        r={gap * 0.65}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={half}
        cy={half}
        r={half - 4}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray="2 6"
        opacity={0.55}
      />
    </svg>
  );
}
