/**
 * Wraps every Strategy Web route in the shared AppShell (sidebar + scroll
 * column). The route group exists so onboarding, the dashboard, the
 * opportunity checker, and the pillar drilldown share a consistent shell
 * without forcing the landing page (/) into the same layout.
 */

import { AppShell } from "@/components/shared/AppShell";

export default function VISRStrategyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
