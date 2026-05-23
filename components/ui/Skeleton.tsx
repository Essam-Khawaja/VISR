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
        "animate-shimmer rounded-xl bg-elevated bg-gradient-to-r from-elevated via-muted-soft to-elevated bg-[length:200%_100%]",
        className,
      )}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        width: typeof width === "number" ? `${width}px` : width,
      }}
    />
  );
}
