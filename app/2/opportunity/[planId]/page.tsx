import { OpportunityShell } from "@/components/2/opportunity/OpportunityShell";

export const dynamic = "force-dynamic";

type Params = { params: { planId: string } };

export default function OpportunityPage({ params }: Params) {
  return <OpportunityShell planId={params.planId} />;
}
