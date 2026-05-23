"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";

type Props = {
  onEvaluate: (text: string) => void | Promise<void>;
  busy?: boolean;
};

export function OpportunityInput({ onEvaluate, busy }: Props) {
  const [text, setText] = useState("Should I join the robotics club?");
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
          <span className="text-[10px] uppercase tracking-widest text-secondary">
            Intel Brief
          </span>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-primary sm:text-3xl">
            Worth saying yes to?
          </h2>
          <p className="mt-2 text-[14px] text-secondary">
            Paste the opportunity in plain words. We score it against your
            current route and tell you the conditions, tradeoffs, and what to
            cut.
          </p>
        </div>

        <Textarea
          name="opportunityText"
          label="The opportunity"
          rows={6}
          maxLength={2000}
          showCount
          value={text}
          onChange={(e) => setText(e.target.value)}
          error={error}
        />

        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-secondary">
            Cmd / Ctrl + Enter to evaluate
          </span>
          <Button type="submit" disabled={busy}>
            {busy ? "Evaluating…" : "Evaluate"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
