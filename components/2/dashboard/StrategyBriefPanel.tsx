"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { usePlanOptional } from "./PlanProvider";
import {
  FIGMA_PILLAR_COLORS,
  NETWORK_NODE_FILL,
} from "@/lib/2/orbitalMap";
import type {
  CutItem,
  CutRecommendation,
  RiskItem,
  StrategicPillar,
} from "@/lib/2/types";

type Props = {
  open: boolean;
  onClose: () => void;
};

const uiFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

type PillarTone = {
  color: string;
  soft: string;
  border: string;
};

type Priority = {
  pillarId: string;
  pillarName: string;
  action: string;
  tone: PillarTone;
};

const CUT_ORDER: CutRecommendation[] = ["Double Down", "Keep", "Defer", "Cut"];

const CUT_TONE: Record<CutRecommendation, PillarTone> = {
  "Double Down": {
    color: "#5C7752",
    soft: "rgba(168, 196, 164, 0.22)",
    border: "rgba(92, 119, 82, 0.32)",
  },
  Keep: {
    color: "#7A6A4F",
    soft: "rgba(213, 207, 189, 0.30)",
    border: "rgba(122, 106, 79, 0.30)",
  },
  Defer: {
    color: "#A37636",
    soft: "rgba(227, 198, 156, 0.30)",
    border: "rgba(163, 118, 54, 0.30)",
  },
  Cut: {
    color: "#933B5B",
    soft: "rgba(147, 59, 91, 0.10)",
    border: "rgba(147, 59, 91, 0.28)",
  },
};

const CUT_LABEL: Record<CutRecommendation, string> = {
  "Double Down": "Double down",
  Keep: "Keep",
  Defer: "Defer",
  Cut: "Cut",
};

function pillarTone(pillar: StrategicPillar, index: number): PillarTone {
  const isNetwork =
    pillar.id === "pillar-network" ||
    pillar.name.trim().toLowerCase() === "network";
  const color = isNetwork
    ? NETWORK_NODE_FILL
    : FIGMA_PILLAR_COLORS[index % FIGMA_PILLAR_COLORS.length];
  return {
    color,
    soft: hexToSoft(color, 0.14),
    border: hexToSoft(color, 0.32),
  };
}

function hexToSoft(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function selectBottleneckPillarId(
  pillars: StrategicPillar[],
): string | undefined {
  const missing = pillars.find((p) => p.status === "Missing");
  if (missing) return missing.id;
  const weak = pillars.find((p) => p.status === "Weak");
  if (weak) return weak.id;
  return undefined;
}

function selectPriorities(
  pillars: StrategicPillar[],
): Priority[] {
  const tonesById = new Map<string, PillarTone>();
  pillars.forEach((p, i) => tonesById.set(p.id, pillarTone(p, i)));

  const isWeak = (p: StrategicPillar) =>
    p.status === "Missing" || p.status === "Weak" || p.status === "Okay";

  const weak = pillars.filter(isWeak);
  const others = pillars.filter((p) => !isWeak(p));
  const ordered = [...weak, ...others];

  const picked: Priority[] = [];
  for (const pillar of ordered) {
    const first = pillar.actions[0];
    if (!first) continue;
    picked.push({
      pillarId: pillar.id,
      pillarName: pillar.name,
      action: first.recommendation || first.name,
      tone: tonesById.get(pillar.id) ?? pillarTone(pillar, 0),
    });
    if (picked.length === 5) break;
  }
  return picked;
}

function alignmentInterpretation(score: number): string {
  if (score >= 80)
    return "Strong alignment. Stay focused on protecting the route.";
  if (score >= 65)
    return "Good alignment with a clear weak spot. Tighten the bottleneck.";
  if (score >= 50)
    return "Moderate alignment. Direction is clear, but skill signal is weak.";
  if (score >= 35)
    return "Scattered. Cut commitments and concentrate on one bottleneck.";
  return "At risk. Reset on the destination before adding anything else.";
}

function groupCutList(cuts: CutItem[]) {
  const grouped = new Map<CutRecommendation, CutItem[]>();
  for (const c of cuts) {
    const list = grouped.get(c.recommendation) ?? [];
    list.push(c);
    grouped.set(c.recommendation, list);
  }
  return CUT_ORDER.map((key) => ({
    key,
    items: grouped.get(key) ?? [],
  })).filter((g) => g.items.length > 0);
}

export function StrategyBriefPanel({ open, onClose }: Props) {
  const ctx = usePlanOptional();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const plan = ctx?.plan;

  const bottleneckPillarId = useMemo(
    () => (plan ? selectBottleneckPillarId(plan.strategicPillars) : undefined),
    [plan],
  );

  const bottleneckPillar = useMemo(
    () =>
      plan?.strategicPillars.find((p) => p.id === bottleneckPillarId) ?? null,
    [plan, bottleneckPillarId],
  );

  const bottleneckTone = useMemo<PillarTone | null>(() => {
    if (!plan || !bottleneckPillar) return null;
    const idx = plan.strategicPillars.findIndex(
      (p) => p.id === bottleneckPillar.id,
    );
    return pillarTone(bottleneckPillar, idx === -1 ? 0 : idx);
  }, [plan, bottleneckPillar]);

  const priorities = useMemo(
    () => (plan ? selectPriorities(plan.strategicPillars) : []),
    [plan],
  );

  const cutGroups = useMemo(
    () => (plan ? groupCutList(plan.cutList) : []),
    [plan],
  );

  const risks = useMemo<RiskItem[]>(
    () => (plan ? plan.risks.slice(0, 3) : []),
    [plan],
  );

  if (!plan) return null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-40 bg-[#1a1410]/15"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Strategy brief"
          style={{ fontFamily: uiFont }}
        >
          <motion.aside
            initial={reduce ? { opacity: 0 } : { x: 48, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { x: 48, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col overflow-hidden border-l border-[#D5CFBD]/50 bg-[#F5EFDF] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#D5CFBD]/40 px-6 py-5">
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9F9679]"
                >
                  Strategy Brief
                </p>
                <h2
                  className="mt-1 font-display text-[22px] font-semibold leading-tight text-[#2C4F52]"
                >
                  Your route, summarized
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#9F9679] transition-colors hover:bg-white/60 hover:text-[#2C4F52]"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 2 L12 12 M12 2 L2 12"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-8 pt-5">
              <Section eyebrow="Destination">
                <p className="font-display text-[24px] font-semibold leading-tight text-[#2C4F52]">
                  {plan.destination}
                </p>
                {plan.currentStage ? (
                  <p className="mt-1 text-[12px] text-[#6B6B6B]">
                    Current stage · {plan.currentStage}
                  </p>
                ) : null}
              </Section>

              <Section eyebrow="Alignment">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-[44px] font-semibold leading-none tracking-tight text-[#2C4F52]">
                    {plan.alignmentScore}
                  </span>
                  <span className="text-[13px] text-[#9F9679]">/ 100</span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-[#6B6B6B]">
                  {alignmentInterpretation(plan.alignmentScore)}
                </p>
              </Section>

              <Section eyebrow="Main bottleneck">
                <div
                  className="rounded-2xl border px-4 py-3"
                  style={{
                    backgroundColor: bottleneckTone?.soft ?? "rgba(147,59,91,0.08)",
                    borderColor: bottleneckTone?.border ?? "rgba(147,59,91,0.28)",
                  }}
                >
                  <p
                    className="text-[14px] font-medium leading-snug"
                    style={{ color: bottleneckTone?.color ?? "#933B5B" }}
                  >
                    {plan.mainBottleneck}
                  </p>
                  {bottleneckPillar ? (
                    <p
                      className="mt-1.5 text-[11px] font-medium uppercase tracking-wider"
                      style={{ color: bottleneckTone?.color ?? "#933B5B" }}
                    >
                      Linked to {bottleneckPillar.name}
                    </p>
                  ) : null}
                </div>
              </Section>

              <Section eyebrow={`Strategic priorities · top ${priorities.length}`}>
                {priorities.length === 0 ? (
                  <EmptyHint text="Priorities appear once pillars have actions." />
                ) : (
                  <ul className="flex flex-col gap-2">
                    {priorities.map((p, i) => (
                      <li
                        key={`${p.pillarId}-${i}`}
                        className="rounded-2xl border bg-white/50 px-4 py-3"
                        style={{ borderColor: p.tone.border }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: p.tone.color }}
                          />
                          <span
                            className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                            style={{ color: p.tone.color }}
                          >
                            {p.pillarName}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13.5px] leading-snug text-[#2C4F52]">
                          {p.action}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section eyebrow="Cut, defer, keep, double down">
                {cutGroups.length === 0 ? (
                  <EmptyHint text="The plan has no cut list yet." />
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {cutGroups.map((group) => (
                      <div key={group.key} className="flex flex-col gap-1.5">
                        {group.items.map((item) => {
                          const tone = CUT_TONE[group.key];
                          return (
                            <div
                              key={item.id}
                              className="rounded-2xl border bg-white/50 px-4 py-3"
                              style={{ borderColor: tone.border }}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
                                  style={{
                                    color: tone.color,
                                    backgroundColor: tone.soft,
                                  }}
                                >
                                  {CUT_LABEL[group.key]}
                                </span>
                                <span className="text-[13.5px] font-medium text-[#2C4F52]">
                                  {item.activity}
                                </span>
                              </div>
                              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#6B6B6B]">
                                {item.reason}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section eyebrow="Risks to watch">
                {risks.length === 0 ? (
                  <EmptyHint text="No active risks flagged on the plan." />
                ) : (
                  <ul className="flex flex-col gap-2">
                    {risks.map((risk) => {
                      const tone =
                        risk.severity === "High"
                          ? CUT_TONE.Cut
                          : risk.severity === "Medium"
                            ? CUT_TONE.Defer
                            : CUT_TONE.Keep;
                      return (
                        <li
                          key={risk.id}
                          className="rounded-2xl border bg-white/50 px-4 py-3"
                          style={{ borderColor: tone.border }}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
                              style={{ color: tone.color, backgroundColor: tone.soft }}
                            >
                              {risk.severity}
                            </span>
                            <span className="text-[13.5px] font-medium leading-snug text-[#2C4F52]">
                              {risk.title}
                            </span>
                          </div>
                          <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#6B6B6B]">
                            {risk.explanation}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Section>

              <p className="mt-4 text-[11px] text-[#9F9679]">
                Press{" "}
                <kbd className="rounded border border-[#D5CFBD]/60 bg-white/70 px-1 py-0.5 text-[10px] font-medium text-[#6B6B6B]">
                  Esc
                </kbd>{" "}
                to close. The web stays in place behind the brief.
              </p>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Section({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9F9679]">
        {eyebrow}
      </h3>
      {children}
    </section>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-[12.5px] italic text-[#9F9679]">{text}</p>;
}
