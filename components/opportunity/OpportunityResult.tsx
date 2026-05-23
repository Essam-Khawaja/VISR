"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { FitScoreGauge } from "./FitScoreGauge";
import { RecommendationStamp } from "./RecommendationStamp";
import { ease, stagger } from "@/lib/motion";
import type { OpportunityCheck } from "@/lib/types";

type Props = {
  check: OpportunityCheck;
};

type Section = {
  label: string;
  items: string[];
  tone?: "default" | "success" | "warning" | "danger" | "accent";
};

const toneColor: Record<NonNullable<Section["tone"]>, string> = {
  default: "var(--text-secondary)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  accent: "var(--accent)",
};

export function OpportunityResult({ check }: Props) {
  const sections: Section[] = [
    { label: "Why it fits", items: check.whyItFits, tone: "success" },
    { label: "Tradeoffs", items: check.tradeoffs, tone: "warning" },
    { label: "Conditions", items: check.conditions, tone: "accent" },
    { label: "Cut to make room", items: check.cutsRequired, tone: "danger" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card noHover className="relative overflow-hidden">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
          <div className="flex flex-col gap-3">
            <FitScoreGauge score={check.fitScore} />
          </div>
          <div className="flex flex-1 flex-col gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-secondary">
                Verdict
              </span>
              <div className="mt-2">
                <RecommendationStamp recommendation={check.recommendation} />
              </div>
            </div>
            <p className="text-[15px] leading-relaxed text-primary">
              {check.reasoning}
            </p>
            <p className="text-[12px] uppercase tracking-widest text-secondary">
              Asked: <span className="text-primary">{check.opportunityText}</span>
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
        {sections.map((section, i) => (
          <Card key={section.label} index={i + 2}>
            <SectionList section={section} />
          </Card>
        ))}
      </div>
    </div>
  );
}

function SectionList({ section }: { section: Section }) {
  const color = toneColor[section.tone ?? "default"];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] uppercase tracking-widest"
          style={{ color }}
        >
          {section.label}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-secondary tabular">
          {section.items.length}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {section.items.length === 0 ? (
          <li className="text-[12px] text-secondary opacity-70">None.</li>
        ) : null}
        {section.items.map((it, i) => (
          <motion.li
            key={`${section.label}-${i}`}
            initial={{ opacity: 0, x: -4 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.3,
              ease,
              delay: i * stagger.brief,
            }}
            className="relative pl-4 text-[14px] leading-snug text-primary"
          >
            <span
              aria-hidden
              className="absolute left-0 top-2 inline-block h-1 w-2"
              style={{ backgroundColor: color }}
            />
            {it}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
