import { OpportunityShell } from "@/components/opportunity/OpportunityShell";

export const dynamic = "force-dynamic";

type Params = { params: { planId: string } };

export default function OpportunityPage({ params }: Params) {
  return <OpportunityShell planId={params.planId} />;
}
