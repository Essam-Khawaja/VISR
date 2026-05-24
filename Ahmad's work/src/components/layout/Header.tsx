"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings as SettingsIcon,
  Calendar,
  StickyNote,
  Sparkles,
} from "lucide-react";
import { getGreeting } from "@/lib/timeline-utils";

export default function Header() {
  const greeting = getGreeting();
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Today", icon: Sparkles },
    { href: "/week", label: "Week", icon: Calendar },
    { href: "/notes", label: "Notes", icon: StickyNote },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-40 glass-card border-b-0 border-x-0 rounded-none px-4 py-3.5">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        <Link href="/" className="flex flex-col">
          <h1 className="text-base font-semibold tracking-tight leading-tight">
            <span className="gradient-text-sunrise">Straighter</span>
            <span className="text-stone-900">Noodles</span>
          </h1>
          <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
            {greeting}
          </p>
        </Link>

        <nav className="flex items-center gap-0.5 bg-white/60 rounded-2xl p-1 border border-stone-200/60">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
