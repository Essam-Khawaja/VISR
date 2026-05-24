/**
 * components/shared/Sidebar.tsx
 *
 * The cross-product navigation. The same component renders as a sticky
 * column on desktop and a drawer on mobile. The "Strategy Map" entry
 * always points at the user's active plan id (from localStorage), or
 * falls back to the demo plan when there isn't one yet, so the link is
 * always meaningful regardless of state.
 */

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Calendar,
  Settings as SettingsIcon,
  Compass,
  Home,
  Users,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/shared/cn";
import { demoPlanId } from "@/lib/shared/env";
import { getActivePlanId } from "@/lib/strategyweb/planStore";
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [strategyPlanId, setStrategyPlanId] = useState<string>(demoPlanId);

  // Re-read the active plan id whenever the route changes so onboarding →
  // /flowgram → strategy map all stay in sync.
  useEffect(() => {
    setStrategyPlanId(getActivePlanId() ?? demoPlanId);
  }, [pathname]);

  // Close drawer on route change.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const groups: NavGroup[] = [
    {
      id: "visr",
      title: "Workspace",
      accent: "var(--amaranth)",
      items: [
        {
          href: "/flowgram",
          label: "Flowgram",
          icon: <Sparkles className="size-[15px]" strokeWidth={1.7} />,
          exact: true,
        },
        {
          href: "/flowgram/week",
          label: "Week",
          icon: <Calendar className="size-[15px]" strokeWidth={1.7} />,
        },
        {
          href: `/strategyweb/dashboard/${strategyPlanId}`,
          label: "Strategy Map",
          icon: <Compass className="size-[15px]" strokeWidth={1.7} />,
        },
        {
          href: "/flowgram/settings",
          label: "Settings",
          icon: <SettingsIcon className="size-[15px]" strokeWidth={1.7} />,
        },
      ],
    },
  ];

  return (
    <>
      {/* Desktop sidebar */}
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
        <SidebarBody
          pathname={pathname}
          groups={groups}
          onCreditsClick={() => setCreditsOpen(true)}
        />
      </aside>

      {/* Mobile top bar */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-white/80 px-4 py-2.5 backdrop-blur-xl md:hidden"
        aria-label="Mobile navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-primary transition-opacity hover:opacity-80"
        >
          <BrandMark size={26} />
          <span className="font-display text-[17px] font-medium tracking-tight">
            VISR
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white/70 text-secondary transition-colors hover:bg-white hover:text-primary"
        >
          <Menu className="size-[18px]" strokeWidth={1.8} />
        </button>
      </header>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" aria-modal="true" role="dialog">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm"
          />
          <aside
            className="relative ml-auto flex h-full w-[280px] max-w-[85vw] flex-col bg-white shadow-2xl"
            style={{ borderLeft: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-end px-4 pt-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-secondary transition-colors hover:bg-stone-50 hover:text-primary"
              >
                <X className="size-[18px]" strokeWidth={1.8} />
              </button>
            </div>
            <SidebarBody
              pathname={pathname}
              groups={groups}
              onCreditsClick={() => {
                setDrawerOpen(false);
                setCreditsOpen(true);
              }}
            />
          </aside>
        </div>
      ) : null}

      <CreditsModal open={creditsOpen} onClose={() => setCreditsOpen(false)} />
    </>
  );
}

function SidebarBody({
  pathname,
  groups,
  onCreditsClick,
}: {
  pathname: string;
  groups: NavGroup[];
  onCreditsClick: () => void;
}) {
  return (
    <>
      <div className="px-6 pb-2 pt-7">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-primary transition-opacity hover:opacity-80"
        >
          <BrandMark />
          <div className="flex flex-col leading-none">
            <span className="font-display text-[20px] font-medium tracking-tight">
              VISR
            </span>
            <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-tertiary">
              Visual Intelligence · Student Roadmapping
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
        onClick={onCreditsClick}
        className="mx-3 mb-5 flex items-center gap-2.5 rounded-full border border-border bg-white/40 px-3.5 py-2 text-[12px] font-medium text-secondary transition-all duration-200 ease-out hover:border-border-strong hover:bg-white/80 hover:text-primary"
      >
        <Users className="size-[14px] text-tertiary" strokeWidth={1.7} />
        Credits
      </button>
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

function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/Logo.png"
      alt="VISR logo"
      width={size}
      height={size}
      priority
      className="shrink-0 rounded-md object-contain"
      style={{ width: size, height: size }}
    />
  );
}
