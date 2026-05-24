"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import type { CreditPerson } from "./creditsData";
import { creditsPeople } from "./creditsData";

type CreditsModalProps = {
  open: boolean;
  onClose: () => void;
};

function initials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export function CreditsModal({ open, onClose }: CreditsModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Project credits"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-up"
    >
      <div
        className="absolute inset-0 bg-[#2A241F]/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-surface shadow-lift"
        style={{ animation: "fade-up 320ms cubic-bezier(0.2,0.8,0.2,1) both" }}
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">
              Project credits
            </p>
            <h2 className="mt-1 font-display text-[24px] font-medium tracking-tight text-primary">
              Built by two students
            </h2>
            <p className="mt-1 text-[12px] text-secondary">
              Pathwise was a hackathon project about turning scattered student
              ambition into one connected route.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1.5 -mt-1.5 rounded-full p-2 text-tertiary transition-colors hover:bg-elevated hover:text-primary"
            aria-label="Close credits"
          >
            <X className="size-4" strokeWidth={1.7} />
          </button>
        </div>

        <ul className="divide-y divide-border">
          {creditsPeople.map((p: CreditPerson) => (
            <li
              key={`${p.id}-${p.name}`}
              className="flex items-center gap-4 px-6 py-4"
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-elevated">
                {p.avatarUrl ? (
                  <Image
                    src={p.avatarUrl}
                    alt={`${p.name} avatar`}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-[13px] font-semibold text-secondary">
                    {initials(p.name)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-primary">
                  {p.name}
                </p>
                <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-tertiary">
                  ID · {p.id}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="border-t border-border bg-elevated/50 px-6 py-3.5 text-[11px] text-tertiary">
          Pathwise · merged build · made with care
        </div>
      </div>
    </div>,
    document.body,
  );
}
