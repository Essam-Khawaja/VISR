import { DashboardLayout } from "@/components/strategyweb/dashboard/DashboardLayout";

export const dynamic = "force-dynamic";

type Params = { params: { planId: string } };

export default function DashboardPage({ params }: Params) {
  return <DashboardLayout planId={params.planId} />;
}
