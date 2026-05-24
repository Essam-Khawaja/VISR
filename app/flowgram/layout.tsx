import { AppShell } from "@/components/shared/AppShell";

export default function FlowgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
