"use client";

import { ChevronDown } from "lucide-react";
import { formatDuration } from "@/lib/1/timeline-utils";

type TimelineConnectorProps = {
  gapMinutes?: number;
};

export default function TimelineConnector({
  gapMinutes,
}: TimelineConnectorProps) {
  return (
    <div className="flex flex-col items-center py-0.5">
      <div className="w-px h-4 bg-gradient-to-b from-border to-border-strong" />
      <ChevronDown
        className="w-3.5 h-3.5 text-tertiary/60 -mt-1"
        strokeWidth={1.8}
      />
      {gapMinutes != null && gapMinutes > 5 && (
        <p className="text-[10px] text-tertiary font-medium -mt-0.5">
          {formatDuration(gapMinutes)}
        </p>
      )}
    </div>
  );
}
