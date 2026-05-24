"use client";

import { useState } from "react";
import { Button } from "@/components/2/ui/Button";
import { Card } from "@/components/2/ui/Card";
import { Textarea } from "@/components/2/ui/Textarea";

type Props = {
  onEvaluate: (text: string) => void | Promise<void>;
  busy?: boolean;
};

const SUGGESTIONS = [
  "Should I join the robotics club?",
  "I got offered a part-time job at 12 hrs/week.",
  "Should I take an extra elective this semester?",
];

export function OpportunityInput({ onEvaluate, busy }: Props) {
  const [text, setText] = useState(SUGGESTIONS[0]);
  const [error, setError] = useState<string | undefined>();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 10) {
      setError("Tell us a bit more — at least 10 characters.");
      return;
    }
    setError(undefined);
    void onEvaluate(text.trim());
  };

  return (
    <Card noHover>
      <form
        onSubmit={onSubmit}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onSubmit(e);
        }}
        className="flex flex-col gap-4"
      >
        <div>
          <span className="text-[11px] font-medium text-tertiary">
            Opportunity check
          </span>
          <h2 className="mt-1 font-display text-2xl font-semibold leading-tight text-primary sm:text-3xl">
            Worth saying yes to?
          </h2>
          <p className="mt-2 text-[14px] text-secondary">
            Paste the opportunity in plain words. We score it against your
            current route and tell you the tradeoffs, conditions, and what to
            cut.
          </p>
        </div>

        <Textarea
          name="opportunityText"
          label="The opportunity"
          rows={5}
          maxLength={2000}
          showCount
          value={text}
          onChange={(e) => setText(e.target.value)}
          error={error}
        />

        <div className="flex flex-wrap items-center gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setText(s)}
              className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] text-secondary transition-colors hover:border-border-strong hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-tertiary">
            <kbd className="rounded border border-border bg-elevated px-1 text-[10px]">⌘</kbd>{" "}
            +{" "}
            <kbd className="rounded border border-border bg-elevated px-1 text-[10px]">↵</kbd>{" "}
            to evaluate
          </span>
          <Button type="submit" disabled={busy}>
            {busy ? "Evaluating…" : "Evaluate"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
