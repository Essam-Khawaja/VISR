import { notFound } from "next/navigation";
import { OpportunityClient } from "@/components/opportunity/OpportunityClient";
import { fetchStrategyPlan } from "@/lib/fetchPlan";

type Params = { params: { planId: string } };

export const dynamic = "force-dynamic";

export default async function OpportunityPage({ params }: Params) {
  const plan = await fetchStrategyPlan(params.planId);
  if (!plan) notFound();
  return <OpportunityClient planId={params.planId} />;
}
