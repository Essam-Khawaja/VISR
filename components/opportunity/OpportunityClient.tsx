"use client";

import Link from "next/link";
import { useState } from "react";
import { OpportunityInput } from "./OpportunityInput";
import { OpportunityResult } from "./OpportunityResult";
import { FitScoreGauge } from "./FitScoreGauge";
import { Card } from "@/components/ui/Card";
import { fixtureOpportunity } from "@/lib/fixture";
import type { OpportunityCheck } from "@/lib/types";

type Props = {
  planId: string;
};

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "result"; check: OpportunityCheck }
  | { kind: "error"; message: string };

export function OpportunityClient({ planId }: Props) {
  const [state, setState] = useState<State>({ kind: "idle" });

  const evaluate = async (text: string) => {
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/opportunity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, opportunityText: text }),
      });
      if (!res.ok) {
        if (res.status === 404) {
          // API not deployed yet — show the fixture result so the UX still demos.
          await new Promise((r) => setTimeout(r, 900));
          setState({
            kind: "result",
            check: { ...fixtureOpportunity, opportunityText: text, planId },
          });
          return;
        }
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as { check: OpportunityCheck };
      setState({ kind: "result", check: data.check });
    } catch (e) {
      setState({
        kind: "error",
        message: e instanceof Error ? e.message : "Could not evaluate.",
      });
    }
  };

  return (
    <main className="relative min-h-screen px-5 py-6 sm:px-8 sm:py-8">
      <header className="mx-auto flex w-full max-w-[760px] items-center justify-between">
        <Link
          href={`/dashboard/${planId}`}
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-secondary transition-colors hover:text-primary"
        >
          <span aria-hidden>&larr;</span>
          Back to dashboard
        </Link>
        <span className="text-[10px] uppercase tracking-widest text-secondary">
          Opportunity Check
        </span>
      </header>

      <div className="mx-auto mt-8 flex w-full max-w-[760px] flex-col gap-6">
        <OpportunityInput
          onEvaluate={evaluate}
          busy={state.kind === "loading"}
        />

        {state.kind === "loading" ? (
          <Card noHover>
            <div className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:items-start sm:gap-8">
              <FitScoreGauge score={0} pending />
              <div className="flex-1 text-[14px] leading-relaxed text-secondary">
                Scoring against your current route, naming the tradeoffs, and
                finding what to cut. Usually under two seconds.
              </div>
            </div>
          </Card>
        ) : null}

        {state.kind === "error" ? (
          <Card noHover bracketColor="var(--danger)">
            <p className="text-[14px] text-danger">{state.message}</p>
          </Card>
        ) : null}

        {state.kind === "result" ? (
          <OpportunityResult check={state.check} />
        ) : null}
      </div>
    </main>
  );
}
