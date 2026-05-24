/**
 * app/strategyweb/dashboard/demo-cs-student-001/page.tsx
 *
 * Static demo dashboard. Mounts the same DashboardLayout as the dynamic
 * route but pins the plan id to the canonical demo, which short-circuits
 * Supabase reads and uses the static fixture instead. Lets judges open the
 * full product without onboarding or env configuration.
 */

import { DashboardLayout } from "@/components/strategyweb/dashboard/DashboardLayout";
import { DEMO_PLAN_ID } from "@/lib/strategyweb/demoData";

export default function DemoDashboardPage() {
  return <DashboardLayout planId={DEMO_PLAN_ID} />;
}
