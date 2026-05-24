/**
 * app/strategyweb/opportunity/[planId]/page.tsx
 *
 * Full-page opportunity checker. Same logic as the embedded version on
 * the dashboard, but with more room for the result detail. Mounted under
 * a plan id so the analysis runs against that plan's strategy.
 */

import { OpportunityShell } from "@/components/strategyweb/opportunity/OpportunityShell";

export const dynamic = "force-dynamic";

type Params = { params: { planId: string } };

export default function OpportunityPage({ params }: Params) {
  return <OpportunityShell planId={params.planId} />;
}
