"use client";

import type { OrbitalNodeData } from "@/lib/2/orbitalMap";

type Props = {
  path: OrbitalNodeData[];
  onBack: () => void;
};

const uiFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

export function OrbitalBreadcrumb({ path, onBack }: Props) {
  return (
    <div className="absolute left-8 top-8 z-20 flex items-center gap-3">
      {path.length > 1 ? (
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D5CFBD]/40 bg-white/60 backdrop-blur-sm transition-all hover:bg-white/80 hover:shadow-sm active:scale-95"
          aria-label="Go back"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M10 4L6 8l4 4"
              stroke="#6B6B6B"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}
      <div
        className="flex items-center gap-2 text-[13px]"
        style={{ color: "#6B6B6B", fontFamily: uiFont }}
      >
        {path.map((node, index) => (
          <span key={node.id}>
            {index > 0 ? (
              <span className="mx-1.5" style={{ color: "#C5BFAF" }}>
                /
              </span>
            ) : null}
            <span
              style={{
                fontWeight: index === path.length - 1 ? 500 : 400,
                color: index === path.length - 1 ? "#2C4F52" : "#6B6B6B",
                letterSpacing: "0.01em",
              }}
            >
              {node.label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
