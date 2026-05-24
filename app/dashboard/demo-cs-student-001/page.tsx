import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DEMO_PLAN_ID } from "@/lib/demoData";

export default function DemoDashboardPage() {
  return <DashboardLayout planId={DEMO_PLAN_ID} />;
}
