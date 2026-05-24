"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/2/ui/Badge";
import { Button } from "@/components/2/ui/Button";
import { Card } from "@/components/2/ui/Card";
import { FitScoreGauge } from "./FitScoreGauge";
import { RecommendationStamp } from "./RecommendationStamp";
import { ease, stagger } from "@/lib/shared/motion";
import type { OpportunityCheck } from "@/lib/2/types";

type Props = {
  check: OpportunityCheck;
  applied: boolean;
  onApply: () => void;
  planId: string;
  isDemo: boolean;
};

type SectionTone = "success" | "warning" | "accent" | "danger";

type Section = {
  label: string;
  items: string[];
  tone: SectionTone;
};

export function OpportunityResult({
  check,
  applied,
  onApply,
  planId,
  isDemo,
}: Props) {
  const sections: Section[] = [
    { label: "Why it fits", items: check.whyItFits, tone: "success" },
    { label: "Tradeoffs", items: check.tradeoffs, tone: "warning" },
    { label: "Conditions", items: check.conditions, tone: "accent" },
    { label: "Cut to make room", items: check.cutsRequired, tone: "danger" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card noHover>
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
          <FitScoreGauge score={check.fitScore} />
          <div className="flex flex-1 flex-col gap-4">
            <span className="text-[11px] font-medium uppercase tracking-wider text-tertiary">
              Pathwise says
            </span>
            <RecommendationStamp recommendation={check.recommendation} />
            <p className="text-[15px] leading-relaxed text-primary">
              {check.reasoning}
            </p>
            <p className="text-[12px] text-tertiary">
              You asked:{" "}
              <span className="font-medium text-primary">
                {check.opportunityText}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-border bg-elevated p-4 sm:flex-row sm:items-center sm:justify-between">
          {applied ? (
            <>
              <p className="text-[13px] text-success">
                Applied. Conditions and cuts have been added to your plan.
              </p>
              <Link href={`/2/dashboard/${planId}`}>
                <Button size="sm" variant="secondary">
                  Open dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <p className="text-[13px] text-secondary">
                {isDemo
                  ? "On the demo plan this is in-session only. On your own plan it persists."
                  : "Apply this verdict to your plan — adds cuts + conditions and stores it locally."}
              </p>
              <Button size="sm" onClick={onApply}>
                Apply to my plan
              </Button>
            </>
          )}
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
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Badge tone={section.tone}>{section.label}</Badge>
        <span className="text-[11px] text-tertiary tabular">
          {section.items.length}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {section.items.length === 0 ? (
          <li className="text-[12.5px] text-tertiary">None.</li>
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
            className="rounded-xl border border-border bg-surface px-3 py-2 text-[14px] leading-snug text-primary"
          >
            {it}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
