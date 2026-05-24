"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/strategyweb/ui/Card";
import { Button } from "@/components/strategyweb/ui/Button";
import { usePlan } from "@/components/strategyweb/dashboard/PlanProvider";
import { FitScoreGauge } from "./FitScoreGauge";
import { OpportunityInput } from "./OpportunityInput";
import { OpportunityResult } from "./OpportunityResult";
import type { OpportunityCheck } from "@/lib/strategyweb/types";

type Props = {
  planId: string;
};

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "result"; check: OpportunityCheck; applied: boolean }
  | { kind: "error"; message: string };

export function OpportunityClient({ planId }: Props) {
  const { plan, applyOpportunityResult, isDemo } = usePlan();
  const [state, setState] = useState<State>({ kind: "idle" });

  const evaluate = async (text: string) => {
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/strategyweb/opportunity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, plan, opportunityText: text }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as { check: OpportunityCheck };
      setState({ kind: "result", check: data.check, applied: false });
    } catch (e) {
      setState({
        kind: "error",
        message: e instanceof Error ? e.message : "Could not evaluate.",
      });
    }
  };

  const applyToPlan = () => {
    if (state.kind !== "result") return;
    applyOpportunityResult(state.check);
    setState({ ...state, applied: true });
  };

  return (
    <main
      id="main"
      className="relative min-h-screen bg-base px-5 py-6 sm:px-8 sm:py-8"
    >
      <header className="mx-auto flex w-full max-w-[760px] items-center justify-between">
        <Link
          href={`/strategyweb/dashboard/${planId}`}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] text-secondary shadow-soft transition-colors hover:border-border-strong hover:text-primary"
        >
          <span aria-hidden>←</span>
          Back to dashboard
        </Link>
        <span className="text-[12px] text-tertiary">Opportunity check</span>
      </header>

      <div className="mx-auto mt-8 flex w-full max-w-[760px] flex-col gap-6">
        <OpportunityInput
          onEvaluate={evaluate}
          busy={state.kind === "loading"}
        />

        {state.kind === "loading" ? (
          <Card noHover>
            <div className="flex flex-col items-center gap-4 py-4 sm:flex-row sm:items-start sm:gap-8">
              <FitScoreGauge score={0} pending />
              <div className="flex-1 text-[14px] leading-relaxed text-secondary">
                Scoring against your current route. Naming the tradeoffs.
                Finding what to cut. Usually under two seconds.
              </div>
            </div>
          </Card>
        ) : null}

        {state.kind === "error" ? (
          <Card noHover className="border-danger/30 bg-danger-soft/40">
            <p className="text-[14px] text-danger">{state.message}</p>
          </Card>
        ) : null}

        {state.kind === "result" ? (
          <OpportunityResult
            check={state.check}
            applied={state.applied}
            onApply={applyToPlan}
            planId={planId}
            isDemo={isDemo}
          />
        ) : null}
      </div>
    </main>
  );
}
