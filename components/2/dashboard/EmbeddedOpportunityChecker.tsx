"use client";

import { useState } from "react";
import { Card } from "@/components/2/ui/Card";
import { FitScoreGauge } from "@/components/2/opportunity/FitScoreGauge";
import { OpportunityInput } from "@/components/2/opportunity/OpportunityInput";
import { OpportunityResult } from "@/components/2/opportunity/OpportunityResult";
import { usePlan } from "./PlanProvider";
import type { OpportunityCheck } from "@/lib/2/types";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "result"; check: OpportunityCheck; applied: boolean }
  | { kind: "error"; message: string };

export function EmbeddedOpportunityChecker() {
  const { plan, planId, applyOpportunityResult, isDemo } = usePlan();
  const [state, setState] = useState<State>({ kind: "idle" });

  const evaluate = async (opportunityText: string) => {
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/2/opportunity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, plan, opportunityText }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Could not evaluate this opportunity.");
      }
      const data = (await res.json()) as { check: OpportunityCheck };
      setState({ kind: "result", check: data.check, applied: false });
    } catch (error) {
      setState({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not evaluate this opportunity.",
      });
    }
  };

  const applyToPlan = () => {
    if (state.kind !== "result") return;
    applyOpportunityResult(state.check);
    setState({ ...state, applied: true });
  };

  return (
    <section className="flex flex-col gap-4">
      <OpportunityInput onEvaluate={evaluate} busy={state.kind === "loading"} />

      {state.kind === "loading" ? (
        <Card noHover>
          <div className="flex items-center gap-4">
            <FitScoreGauge score={0} pending />
            <p className="text-[13px] leading-relaxed text-secondary">
              Scoring this against your current bottleneck and cut list.
            </p>
          </div>
        </Card>
      ) : null}

      {state.kind === "error" ? (
        <Card noHover className="border-danger/30 bg-danger-soft">
          <p className="text-[13px] text-danger">{state.message}</p>
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
    </section>
  );
}
