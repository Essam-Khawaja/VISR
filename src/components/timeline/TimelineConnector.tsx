"use client";

import { ChevronDown } from "lucide-react";
import { formatDuration } from "@/lib/timeline-utils";

type TimelineConnectorProps = {
  gapMinutes?: number;
};

export default function TimelineConnector({
  gapMinutes,
}: TimelineConnectorProps) {
  return (
    <div className="flex flex-col items-center py-0.5">
      <div className="w-px h-4 bg-gradient-to-b from-stone-300/40 to-stone-300/80" />
      <ChevronDown
        className="w-3.5 h-3.5 text-stone-300 -mt-1"
        strokeWidth={2.5}
      />
      {gapMinutes != null && gapMinutes > 5 && (
        <p className="text-[10px] text-stone-400 font-medium -mt-0.5">
          {formatDuration(gapMinutes)}
        </p>
      )}
    </div>
  );
}
