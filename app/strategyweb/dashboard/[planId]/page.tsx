/**
 * app/strategyweb/dashboard/[planId]/page.tsx
 *
 * Dashboard for any user-generated plan. Reads the plan id from the URL
 * and hands it to DashboardLayout which mounts PlanProvider, the goal
 * tree, the strategy brief, and the embedded opportunity checker.
 */

import { DashboardLayout } from "@/components/strategyweb/dashboard/DashboardLayout";

export const dynamic = "force-dynamic";

type Params = { params: { planId: string } };

export default function DashboardPage({ params }: Params) {
  return <DashboardLayout planId={params.planId} />;
}
