/**
 * Wraps every Flowgram route in the shared AppShell so day, week, notes,
 * and settings views share the sidebar and scroll column.
 */

import { AppShell } from "@/components/shared/AppShell";

export default function FlowgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
