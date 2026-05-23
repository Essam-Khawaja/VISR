"use client";

import { Reticle } from "@/components/signature/Reticle";
import { Badge } from "@/components/ui/Badge";

type Props = {
  bottleneck: string;
  stage: string;
};

export function BottleneckCard({ bottleneck, stage }: Props) {
  return (
    <div className="relative flex flex-col gap-4">
      <Reticle
        className="right-0 top-0 -translate-y-4 translate-x-6 opacity-25"
        size={260}
        color="var(--danger)"
        strokeWidth={0.9}
      />
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-widest text-secondary">
          Main Bottleneck
        </span>
        <Badge tone="danger" dot>
          {stage}
        </Badge>
      </div>

      <div className="relative">
        <span
          aria-hidden
          className="absolute -left-5 top-1 block h-full w-px"
          style={{
            background:
              "linear-gradient(to bottom, var(--danger) 0%, transparent 100%)",
          }}
        />
        <p className="relative font-display text-[20px] font-medium leading-snug text-primary md:text-[22px]">
          {bottleneck}
        </p>
      </div>

      <p className="relative text-[12px] uppercase tracking-widest text-danger">
        Everything else is noise until this clears.
      </p>
    </div>
  );
}
