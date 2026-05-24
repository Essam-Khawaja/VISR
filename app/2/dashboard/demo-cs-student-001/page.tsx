import { DashboardLayout } from "@/components/2/dashboard/DashboardLayout";
import { DEMO_PLAN_ID } from "@/lib/2/demoData";

export default function DemoDashboardPage() {
  return <DashboardLayout planId={DEMO_PLAN_ID} />;
}
