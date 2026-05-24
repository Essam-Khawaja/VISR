"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/shared/cn";
import { usePlanOptional } from "@/components/2/dashboard/PlanProvider";

const PILLAR_PASTELS = [
  "#933B5B", // amaranth
  "#B5728A", // thulian
  "#9F9679", // pomelo olive
  "#8A9A5B", // sage
  "#AABAAE", // brook green
  "#C4A882", // chalk-dark
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
  const [pillarsOpen, setPillarsOpen] = useState(true);

  const items: NavItem[] = [
    { href: "/", label: "Home", icon: <IconHome /> },
    {
      href: `/2/dashboard/${planId}`,
      label: "Strategy",
      icon: <IconStrategy />,
    },
    {
      href: `/2/opportunity/${planId}`,
      label: "Opportunity",
      icon: <IconOpportunity />,
    },
  ];

  return (
    <aside
      className="flex h-full w-[220px] shrink-0 flex-col border-r border-border bg-surface"
      aria-label="Dashboard navigation"
    >
      <div className="flex h-14 items-center gap-2.5 px-5">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-primary transition-colors hover:text-accent"
        >
          <PathwiseMark />
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Pathwise
          </span>
        </Link>
      </div>

      <div className="mx-4 h-px bg-border" />

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-3">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                (item.label === "Strategy" &&
                  pathname.startsWith(`/2/dashboard/${planId}`) &&
                  !pathname.includes("/pillar/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-150",
                active
                  ? "bg-accent-soft text-accent-strong"
                  : "text-secondary hover:bg-elevated hover:text-primary",
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center",
                  active
                    ? "text-accent"
                    : "text-tertiary group-hover:text-secondary",
                )}
                aria-hidden
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}

        {ctx ? (
          <>
            <div className="mx-1 my-2 h-px bg-border" />
            <button
              type="button"
              onClick={() => setPillarsOpen((v) => !v)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-secondary transition-colors hover:bg-elevated hover:text-primary"
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center text-tertiary" aria-hidden>
                <IconPillars />
              </span>
              <span className="flex-1 text-left">Pillars</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className={cn(
                  "shrink-0 text-tertiary transition-transform duration-150",
                  pillarsOpen ? "rotate-90" : "",
                )}
                aria-hidden
              >
                <path
                  d="M4 2l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {pillarsOpen ? (
              <div className="flex flex-col gap-0.5 pl-4">
                {ctx.plan.strategicPillars.map((pillar, i) => {
                  const href = `/2/dashboard/${planId}/pillar/${pillar.id}`;
                  const active = pathname === href;
                  return (
                    <Link
                      key={pillar.id}
                      href={href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[12px] transition-colors",
                        active
                          ? "bg-accent-soft font-medium text-primary"
                          : "text-secondary hover:bg-elevated hover:text-primary",
                      )}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
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
          </>
        ) : null}
      </nav>

      {onTodayClick ? (
        <div className="border-t border-border px-3 py-3">
          <button
            type="button"
            onClick={onTodayClick}
            className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-[13px] font-medium text-secondary shadow-soft transition-colors duration-150 hover:border-border-strong hover:text-primary"
          >
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center text-tertiary"
              aria-hidden
            >
              <IconToday />
            </span>
            Today
            <kbd className="ml-auto rounded border border-border bg-elevated px-1.5 py-0.5 text-[10px] font-medium text-tertiary">
              T
            </kbd>
          </button>
        </div>
      ) : null}
    </aside>
  );
}

function PathwiseMark() {
  return (
    <svg
      width="20"
      height="20"
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
      <circle cx="13" cy="3" r="1.4" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="3" cy="13" r="1.4" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="13" cy="13" r="1.4" stroke="currentColor" strokeWidth="1.3" />
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
      <rect x="2" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="2" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function IconToday() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="3.5" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 2v3M10.5 2v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
