import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  opacity?: number;
};

const noiseSvg = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
    <filter id='n'>
      <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
      <feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.7 0'/>
    </filter>
    <rect width='100%' height='100%' filter='url(#n)'/>
  </svg>`,
);

export function Grain({ className, opacity }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-[1] mix-blend-overlay",
        className,
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,${noiseSvg}")`,
        backgroundSize: "160px 160px",
        opacity: opacity ?? "var(--grain-opacity)",
      }}
    />
  );
}
