import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  height?: number | string;
  width?: number | string;
};

export function Skeleton({ className, height, width }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        "scan-mask relative overflow-hidden bg-surface",
        className,
      )}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        width: typeof width === "number" ? `${width}px` : width,
      }}
    />
  );
}
