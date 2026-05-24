"use client";

import { useEffect, useState } from "react";

export default function CurrentTimeMarker() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const formatted = time.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amaranth/30 to-amaranth/30" />
      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amaranth to-thulian text-white shadow-soft">
        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span className="text-[10px] font-semibold tracking-wide">
          NOW · {formatted}
        </span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-amaranth/30 to-amaranth/30" />
    </div>
  );
}
