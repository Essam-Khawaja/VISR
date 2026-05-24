"use client";

import Link from "next/link";
import type { OrbitalNodeData } from "@/lib/2/orbitalMap";

type Props = {
  studentName: string;
  degree: string;
  year: string;
  categories: OrbitalNodeData[];
  planId: string;
  onCategoryClick: (category: OrbitalNodeData) => void;
  onTodayClick?: () => void;
  onBriefClick?: () => void;
};

const uiFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

export function OrbitalDashboardSidebar({
  studentName,
  degree,
  year,
  categories,
  planId,
  onCategoryClick,
  onTodayClick,
  onBriefClick,
}: Props) {
  return (
    <div className="flex h-full w-[220px] shrink-0 flex-col border-r border-[#D5CFBD]/30 bg-white/40 p-6 backdrop-blur-sm">
      <Link
        href="/"
        className="mb-6 text-[11px] font-medium tracking-wide text-[#9F9679] transition-colors hover:text-[#2C4F52]"
        style={{ fontFamily: uiFont }}
      >
        ← Pathwise
      </Link>

      <div className="flex flex-col gap-2">
        <h2
          className="text-[17px] tracking-tight"
          style={{ color: "#2C4F52", fontFamily: uiFont }}
        >
          {studentName}
        </h2>
        <p
          className="text-[13px] tracking-tight"
          style={{ color: "#6B6B6B", fontFamily: uiFont }}
        >
          {degree}
        </p>
        <p
          className="text-[11px] tracking-tight"
          style={{ color: "#9F9679", fontFamily: uiFont }}
        >
          {year}
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-2.5">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryClick(category)}
            className="rounded-full px-4 py-2.5 text-[13px] text-white transition-all hover:shadow-md active:scale-95"
            style={{
              backgroundColor: category.color,
              fontWeight: 500,
              letterSpacing: "0.01em",
              fontFamily: uiFont,
            }}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-6">
        {onTodayClick ? (
          <button
            type="button"
            onClick={onTodayClick}
            className="rounded-full border border-[#D5CFBD]/50 bg-white/50 px-4 py-2 text-[12px] font-medium text-[#2C4F52] transition-all hover:bg-white/80"
            style={{ fontFamily: uiFont }}
          >
            Today focus
          </button>
        ) : null}
        {onBriefClick ? (
          <button
            type="button"
            onClick={onBriefClick}
            className="rounded-full border border-[#D5CFBD]/50 bg-white/50 px-4 py-2 text-[12px] font-medium text-[#2C4F52] transition-all hover:bg-white/80"
            style={{ fontFamily: uiFont }}
          >
            Strategy Brief
          </button>
        ) : null}
        <Link
          href={`/2/opportunity/${planId}`}
          className="rounded-full border border-[#D5CFBD]/50 bg-white/50 px-4 py-2 text-center text-[12px] font-medium text-[#6B6B6B] transition-all hover:bg-white/80 hover:text-[#2C4F52]"
          style={{ fontFamily: uiFont }}
        >
          Opportunity checker
        </Link>
      </div>
    </div>
  );
}
