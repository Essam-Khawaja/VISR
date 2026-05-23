import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { fetchStrategyPlan } from "@/lib/fetchPlan";

export const dynamic = "force-dynamic";

type Params = { params: { planId: string } };

export default async function DashboardPage({ params }: Params) {
  const plan = await fetchStrategyPlan(params.planId);
  if (!plan) notFound();
  return <DashboardLayout plan={plan} planId={params.planId} />;
}
