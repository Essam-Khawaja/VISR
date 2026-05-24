"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Calendar,
  StickyNote,
  Settings as SettingsIcon,
  Compass,
  GitBranch,
  Lightbulb,
  Home,
  Users,
} from "lucide-react";
import { cn } from "@/lib/shared/cn";
import { demoPlanId } from "@/lib/shared/env";
import { CreditsModal } from "./CreditsModal";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
};

type NavGroup = {
  id: string;
  title: string;
  accent: string;
  items: NavItem[];
};

export function Sidebar() {
  const pathname = usePathname() ?? "/";
  const [creditsOpen, setCreditsOpen] = useState(false);

  const groups: NavGroup[] = [
    {
      id: "1",
      title: "StraighterNoodles",
      accent: "var(--amaranth)",
      items: [
        {
          href: "/1",
          label: "Flowgram",
          icon: <Sparkles className="size-[15px]" strokeWidth={1.7} />,
          exact: true,
        },
        {
          href: "/1/week",
          label: "Week View",
          icon: <Calendar className="size-[15px]" strokeWidth={1.7} />,
        },
        {
          href: "/1/notes",
          label: "Notes Hub",
          icon: <StickyNote className="size-[15px]" strokeWidth={1.7} />,
        },
        {
          href: "/1/settings",
          label: "Settings",
          icon: <SettingsIcon className="size-[15px]" strokeWidth={1.7} />,
        },
      ],
    },
    {
      id: "2",
      title: "Pathwise Strategy",
      accent: "var(--sage)",
      items: [
        {
          href: `/2/dashboard/${demoPlanId}`,
          label: "Strategy Web",
          icon: <Compass className="size-[15px]" strokeWidth={1.7} />,
        },
        {
          href: "/2/onboarding",
          label: "Assessments",
          icon: <GitBranch className="size-[15px]" strokeWidth={1.7} />,
        },
        {
          href: `/2/opportunity/${demoPlanId}`,
          label: "Opportunity Validation",
          icon: <Lightbulb className="size-[15px]" strokeWidth={1.7} />,
        },
      ],
    },
  ];

  return (
    <>
      <aside
        aria-label="Primary navigation"
        className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col md:flex"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.45) 100%)",
          backdropFilter: "blur(14px) saturate(140%)",
          WebkitBackdropFilter: "blur(14px) saturate(140%)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div className="px-6 pb-2 pt-7">
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-primary transition-opacity hover:opacity-80"
          >
            <BrandMark />
            <div className="flex flex-col leading-none">
              <span className="font-display text-[20px] font-medium tracking-tight">
                Pathwise
              </span>
              <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-tertiary">
                Two ways to plan
              </span>
            </div>
          </Link>
        </div>

        <div className="px-3 pt-3">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition-all duration-200 ease-out",
              pathname === "/"
                ? "bg-accent-soft text-accent-strong"
                : "text-secondary hover:bg-white/60 hover:text-primary",
            )}
          >
            <Home className="size-[15px] text-tertiary" strokeWidth={1.7} />
            Home
          </Link>
        </div>

        <nav className="mt-2 flex flex-1 flex-col gap-5 overflow-y-auto px-3 pb-3">
          {groups.map((group) => (
            <GroupBlock key={group.id} group={group} pathname={pathname} />
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setCreditsOpen(true)}
          className="mx-3 mb-5 flex items-center gap-2.5 rounded-full border border-border bg-white/40 px-3.5 py-2 text-[12px] font-medium text-secondary transition-all duration-200 ease-out hover:border-border-strong hover:bg-white/80 hover:text-primary"
        >
          <Users className="size-[14px] text-tertiary" strokeWidth={1.7} />
          Credits
        </button>
      </aside>
      <CreditsModal open={creditsOpen} onClose={() => setCreditsOpen(false)} />
    </>
  );
}

function GroupBlock({
  group,
  pathname,
}: {
  group: NavGroup;
  pathname: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 px-3.5 pb-1">
        <span
          aria-hidden
          className="h-1 w-1 rounded-full"
          style={{ backgroundColor: group.accent }}
        />
        <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-tertiary">
          {group.title}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        {group.items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition-all duration-200 ease-out",
                active
                  ? "bg-accent-soft text-accent-strong"
                  : "text-secondary hover:bg-white/60 hover:text-primary",
              )}
            >
              <span
                className={cn(
                  "flex h-[15px] w-[15px] shrink-0 items-center justify-center",
                  active
                    ? "text-accent"
                    : "text-tertiary group-hover:text-secondary",
                )}
                aria-hidden
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      aria-hidden
      className="shrink-0"
    >
      <defs>
        <linearGradient id="sidebar-brand-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--amaranth)" />
          <stop offset="100%" stopColor="var(--thulian)" />
        </linearGradient>
      </defs>
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="url(#sidebar-brand-grad)"
        strokeWidth="1.2"
        strokeDasharray="2 4"
      />
      <circle cx="12" cy="12" r="3.5" fill="url(#sidebar-brand-grad)" />
    </svg>
  );
}
