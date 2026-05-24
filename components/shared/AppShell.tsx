"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

type Props = {
  children: React.ReactNode;
};

function isFigmaDashboardRoute(pathname: string) {
  return /^\/2\/dashboard\/[^/]+$/.test(pathname);
}

export function AppShell({ children }: Props) {
  const pathname = usePathname() ?? "";

  if (isFigmaDashboardRoute(pathname)) {
    return (
      <div className="relative z-[1] h-screen w-full overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="relative z-[1] flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
