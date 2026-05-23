"use client";

import Link from "next/link";
import { PlanProvider, usePlanOptional } from "@/components/dashboard/PlanProvider";
import { Button } from "@/components/ui/Button";
import { OpportunityClient } from "./OpportunityClient";

type Props = {
  planId: string;
};

export function OpportunityShell({ planId }: Props) {
  return (
    <PlanProvider planId={planId}>
      <OpportunityContent planId={planId} />
    </PlanProvider>
  );
}

function OpportunityContent({ planId }: { planId: string }) {
  const ctx = usePlanOptional();
  if (!ctx) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base px-6">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-card">
          <h1 className="font-display text-2xl font-semibold text-primary">
            No plan to score against
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-secondary">
            The Opportunity check needs an active plan. Start onboarding to
            generate one, or open the demo plan.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/onboarding">
              <Button>Start onboarding</Button>
            </Link>
            <Link href={`/dashboard/${planId}`}>
              <Button variant="secondary">Back to dashboard</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }
  return <OpportunityClient planId={planId} />;
}
