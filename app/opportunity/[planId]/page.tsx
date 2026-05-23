"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Recommendation } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";

function FitScoreGauge({ score, loading }: { score: number; loading: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = loading ? score : 0;
    const to = loading ? 0 : score;

    const tick = (): void => {
      const elapsed = Math.min(1, (performance.now() - start) / 820);
      const eased = 1 - Math.pow(1 - elapsed, 3);

      const v = Math.round(from + (to - from) * eased);
      setDisplay(v);

      if (elapsed < 1) raf = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(raf);
  }, [loading, score]);

  const pct = Math.max(0, Math.min(100, display));
  const deg = pct * 3.6;

  return (
    <div className="relative mx-auto h-52 w-52">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            loading || pct === 0
              ? "conic-gradient(#3D4F6B 0deg, #3D4F6B 360deg)"
              : `conic-gradient(#4FACFE 0deg, #00F5A0 ${deg * 0.55}deg, #FFB547 ${deg * 0.85}deg, #22304f ${deg}deg, rgba(34,48,79,0.35) ${deg}deg, rgba(34,48,79,0.35) 360deg)`,
        }}
      />
      <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full border border-[color:var(--border)] bg-black/72">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: "var(--text-secondary)" }}>
          Fit score
        </p>
        <p className="mt-1 font-display text-5xl text-[color:var(--accent)] tabular-nums">{pct}</p>
        <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
          / 100
        </p>
      </div>
    </div>
  );
}

/** PRD §9 canned robotics response (demo, no API). */
const MOCK_ROBOTICS: {
  score: number;
  recommendation: Recommendation;
  reasoning: string;
  whyItFits: string[];
  tradeoffs: string[];
  conditions: string[];
  cutsRequired: string[];
} = {
  score: 78,
  recommendation: "Say Yes With Conditions",
  reasoning:
    "Robotics reinforces systems thinking and multidisciplinary shipping — useful for recruiters when you fence it behind hard weekly hour caps tied to shipped artifacts.",
  whyItFits: [
    "Adds build-heavy proof recruiters can correlate with pragmatic engineering instincts",
    "Embeds mentorship and scope discipline absent from dangling side projects",
  ],
  tradeoffs: ["Roughly two weeks of polishing time may shift outward on the flagship portfolio artifact"],
  conditions: ["Cap participation at ≤4 focused hours/week", "Pause exploratory second side-project scope until flagship repo lands"],
  cutsRequired: ["Trim optional clubs that bleed evening focus without recruiter leverage"],
};

export default function OpportunityPage() {
  const params = useParams<{ planId: string }>();

  const [text, setText] = useState("Should I join the robotics club?");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<typeof MOCK_ROBOTICS | null>(null);

  const trimmed = text.trim();

  const runDemo = (): void => {
    if (!trimmed.toLowerCase().includes("robotics")) return;

    setBusy(true);
    setResult(null);

    window.setTimeout(() => {
      setResult(MOCK_ROBOTICS);
      setBusy(false);
    }, 900);
  };

  const planId = typeof params.planId === "string" ? params.planId : params.planId?.[0] ?? "";

  return (
    <main className="mx-auto max-w-[960px] space-y-8 px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
            Opportunity scanner
          </p>
          <h1 className="font-display text-4xl">Should you say yes?</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[color:var(--text-secondary)]">
            Demo evaluates only robotics-shaped prompts with the PRD-scripted robotics club verdict; everything else is intentionally blocked.
          </p>
        </div>
        <Link
          href={`/dashboard/${planId}`}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-surface)] px-5 text-[13px] font-semibold text-[color:var(--text-primary)] backdrop-blur transition hover:border-[color:var(--accent)]"
        >
          Back to dashboard
        </Link>
      </div>

      <Card>
        <div className="space-y-4 p-6">
          <label htmlFor="opp" className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: "var(--accent)" }}>
            Paste the opportunity
          </label>
          <textarea
            id="opp"
            rows={6}
            className="w-full rounded-xl border border-[color:var(--border)] bg-black/55 px-4 py-3 text-[15px] leading-relaxed text-[color:var(--text-primary)] outline-none ring-0 transition focus:border-[color:var(--accent)]"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={runDemo}
              disabled={busy || trimmed.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#08131f] opacity-95 transition hover:opacity-100 disabled:pointer-events-none disabled:opacity-40"
            >
              {busy ? "Scoring..." : "Evaluate"}
            </button>
            {!trimmed.toLowerCase().includes("robotics") ? (
              <span className="text-xs text-[color:var(--text-secondary)]">Demo response unlocks only for robotics wording.</span>
            ) : null}
          </div>
        </div>
      </Card>

      {(busy || result) && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid gap-6 md:grid-cols-[minmax(260px,_0.9fr)_minmax(340px,_1.1fr)] md:items-center"
        >
          <Card>
            <div className="p-8">
              <FitScoreGauge score={result?.score ?? MOCK_ROBOTICS.score} loading={busy || !result} />
            </div>
          </Card>

          <Card>
            <div className="space-y-4 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: "var(--text-secondary)" }}>
                Recommendation
              </p>
              <div
                className="inline-flex rounded-full border border-[color:var(--border)] bg-black/55 px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: "var(--success)" }}
              >
                {result?.recommendation ?? "Analyzing"}
              </div>

              {result ? (
                <>
                  <p className="text-[15px] leading-relaxed">{result.reasoning}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MiniList title="Why it fits" items={result.whyItFits} />
                    <MiniList title="Tradeoffs" items={result.tradeoffs} accent="warn" />
                    <MiniList title="Conditions" items={result.conditions} accent="accent" />
                    <MiniList title="Cuts required" items={result.cutsRequired} accent="danger" />
                  </div>
                </>
              ) : (
                <p className="text-sm text-[color:var(--text-secondary)]">Spinning gauge + scripted payload…</p>
              )}
            </div>
          </Card>
        </motion.section>
      )}
    </main>
  );
}

function MiniList({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent?: "accent" | "warn" | "danger";
}) {
  const color =
    accent === "warn"
      ? "#FFB547"
      : accent === "danger"
        ? "#FF4D6D"
        : accent === "accent"
          ? "#4FACFE"
          : "#6B7FA3";

  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-black/40 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color }}>
        {title}
      </p>
      <ul className="mt-2 space-y-2 text-[13px] leading-relaxed">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
