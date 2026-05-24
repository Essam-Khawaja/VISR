"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { usePlanOptional } from "@/components/dashboard/PlanProvider";

const PILLAR_PASTELS = [
  "#8B4A6B",
  "#9B9267",
  "#B5707E",
  "#C4A882",
  "#8FA68B",
  "#7E6B8A",
];

type Props = {
  planId: string;
  onTodayClick?: () => void;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export function DashboardSidebar({ planId, onTodayClick }: Props) {
  const pathname = usePathname();
  const ctx = usePlanOptional();
  const [pillarsOpen, setPillarsOpen] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pillarsOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (
        flyoutRef.current &&
        !flyoutRef.current.contains(e.target as Node)
      ) {
        setPillarsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [pillarsOpen]);

  const items: NavItem[] = [
    { href: "/", label: "Home", icon: <IconHome /> },
    {
      href: `/dashboard/${planId}`,
      label: "Strategy",
      icon: <IconStrategy />,
    },
    {
      href: `/opportunity/${planId}`,
      label: "Opportunity",
      icon: <IconOpportunity />,
    },
  ];

  const pillarsActive = pathname.includes("/pillar/");

  return (
    <aside
      className="relative flex h-full w-[72px] shrink-0 flex-col border-r border-border bg-surface"
      aria-label="Dashboard navigation"
    >
      <div className="flex h-16 items-center justify-center px-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-primary transition-colors hover:text-accent"
        >
          <PathwiseMark />
        </Link>
      </div>

      <div className="mx-3 my-1 h-px bg-border" />

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href.split("?")[0]);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-center rounded-xl px-3 py-2.5 transition-colors duration-150",
                active
                  ? "bg-accent-soft text-accent-strong"
                  : "text-secondary hover:bg-elevated hover:text-primary",
              )}
              title={item.label}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center",
                  active
                    ? "text-accent"
                    : "text-tertiary group-hover:text-secondary",
                )}
                aria-hidden
              >
                {item.icon}
              </span>
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}

        {ctx ? (
          <div ref={flyoutRef} className="relative">
            <button
              type="button"
              onClick={() => setPillarsOpen((v) => !v)}
              className={cn(
                "group flex w-full items-center justify-center rounded-xl px-3 py-2.5 transition-colors duration-150",
                pillarsActive
                  ? "bg-accent-soft text-accent-strong"
                  : "text-secondary hover:bg-elevated hover:text-primary",
              )}
              title="Pillars"
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center",
                  pillarsActive
                    ? "text-accent"
                    : "text-tertiary group-hover:text-secondary",
                )}
                aria-hidden
              >
                <IconPillars />
              </span>
              <span className="sr-only">Pillars</span>
            </button>

            {pillarsOpen ? (
              <div className="absolute left-[calc(100%+8px)] top-0 z-50 w-56 rounded-xl border border-border bg-surface py-2 shadow-lift">
                <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-tertiary">
                  Pillars
                </p>
                {ctx.plan.strategicPillars.map((pillar, i) => {
                  const href = `/dashboard/${planId}/pillar/${pillar.id}`;
                  const active = pathname === href;
                  return (
                    <Link
                      key={pillar.id}
                      href={href}
                      onClick={() => setPillarsOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors",
                        active
                          ? "bg-accent-soft font-medium text-primary"
                          : "text-secondary hover:bg-elevated hover:text-primary",
                      )}
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            PILLAR_PASTELS[i % PILLAR_PASTELS.length],
                        }}
                        aria-hidden
                      />
                      <span className="min-w-0 truncate">{pillar.name}</span>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}

        {onTodayClick ? (
          <button
            type="button"
            onClick={onTodayClick}
            className="mt-2 flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-2.5 text-secondary shadow-soft transition-colors duration-150 hover:border-border-strong hover:text-primary"
            title="Today (T)"
          >
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center text-tertiary"
              aria-hidden
            >
              <IconToday />
            </span>
            <span className="sr-only">Today</span>
          </button>
        ) : null}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex h-5 items-center justify-center text-[10px] font-medium text-tertiary">
          <kbd className="rounded border border-border bg-elevated px-1">T</kbd>
        </div>
      </div>
    </aside>
  );
}

function PathwiseMark() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden
      className="shrink-0"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeDasharray="2 4"
      />
      <circle cx="12" cy="12" r="3.5" fill="var(--accent)" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2.5 7L8 2.5L13.5 7V13a1 1 0 01-1 1h-9a1 1 0 01-1-1V7z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconStrategy() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="2" fill="currentColor" />
      <circle cx="3" cy="3" r="1.4" stroke="currentColor" strokeWidth="1.3" />
      <circle
        cx="13"
        cy="3"
        r="1.4"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle
        cx="3"
        cy="13"
        r="1.4"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle
        cx="13"
        cy="13"
        r="1.4"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M4 4l3 3M12 4l-3 3M4 12l3-3M12 12l-3-3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconOpportunity() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.5l1.9 4 4.4.6-3.2 3.1.8 4.4L8 11.4l-3.9 2.2.8-4.4L1.7 6.1l4.4-.6L8 1.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPillars() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="2"
        y="2"
        width="5"
        height="5"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <rect
        x="9"
        y="2"
        width="5"
        height="5"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <rect
        x="2"
        y="9"
        width="5"
        height="5"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <rect
        x="9"
        y="9"
        width="5"
        height="5"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function IconToday() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="2"
        y="3.5"
        width="12"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M5.5 2v3M10.5 2v3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
