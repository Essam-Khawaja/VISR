import { DashboardLayout } from "@/components/strategyweb/dashboard/DashboardLayout";
import { DEMO_PLAN_ID } from "@/lib/strategyweb/demoData";

export default function DemoDashboardPage() {
  return <DashboardLayout planId={DEMO_PLAN_ID} />;
}
