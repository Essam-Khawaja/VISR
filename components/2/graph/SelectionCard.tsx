"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/2/ui/Badge";
import type {
  ActionItem,
  CutItem,
  NodeStatus,
  PillarStatus,
  RiskItem,
  StrategicPillar,
  StrategyPlan,
} from "@/lib/2/types";
import type { ActionState } from "@/lib/2/planStore";
import type { GraphSelection } from "./graphTypes";

type Props = {
  plan: StrategyPlan;
  selection: GraphSelection;
  actionStates: Record<string, ActionState>;
  onSelect: (selection: GraphSelection) => void;
  onClose: () => void;
  onToggleAction: (actionId: string, state: ActionState) => void;
  isDemo: boolean;
};

type Resolved =
  | { kind: "pillar"; pillar: StrategicPillar }
  | {
      kind: "action";
      pillar: StrategicPillar;
      action: StrategicPillar["actions"][number];
    }
  | null;

function resolveSelection(
  plan: StrategyPlan,
  selection: GraphSelection,
): Resolved {
  if (!selection) return null;
  if (selection.kind === "pillar") {
    const pillar = plan.strategicPillars.find((p) => p.id === selection.nodeId);
    if (!pillar) return null;
    return { kind: "pillar", pillar };
  }
  for (const pillar of plan.strategicPillars) {
    const action = pillar.actions.find((a) => a.id === selection.nodeId);
    if (action) return { kind: "action", pillar, action };
  }
  return null;
}

function pillarTone(s: PillarStatus): "success" | "warning" | "danger" {
  if (s === "Strong") return "success";
  if (s === "Okay") return "warning";
  return "danger";
}

function actionTone(
  s: NodeStatus,
): "success" | "warning" | "danger" | "muted" {
  if (s === "On Track") return "success";
  if (s === "Behind") return "warning";
  if (s === "At Risk") return "danger";
  return "muted";
}

function filterIntelligence(plan: StrategyPlan, pillarName: string) {
  const lower = pillarName.toLowerCase();
  const next7 = plan.nextSevenDays.filter((n) =>
    n.category.toLowerCase().includes(lower) ||
    lower.includes(n.category.toLowerCase()),
  );
  const cuts = plan.cutList.filter((c) =>
    c.reason.toLowerCase().includes(lower) ||
    c.activity.toLowerCase().includes(lower),
  );
  const risks = plan.risks.filter((r) =>
    r.title.toLowerCase().includes(lower) ||
    r.explanation.toLowerCase().includes(lower),
  );
  return { next7, cuts, risks };
}

export function SelectionCard({
  plan,
  selection,
  actionStates,
  onSelect,
  onClose,
  onToggleAction,
  isDemo,
}: Props) {
  const reduce = useReducedMotion();
  const resolved = resolveSelection(plan, selection);

  return (
    <AnimatePresence>
      {resolved ? (
        <motion.div
          key={resolved.kind === "pillar" ? resolved.pillar.id : resolved.action.id}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
          className="pointer-events-auto absolute bottom-20 left-1/2 z-30 w-[min(440px,calc(100vw-2rem))] -translate-x-1/2 md:bottom-24"
          role="dialog"
          aria-label={
            resolved.kind === "pillar"
              ? `Pillar detail: ${resolved.pillar.name}`
              : `Action detail: ${resolved.action.name}`
          }
        >
          {resolved.kind === "pillar" ? (
            <PillarCard
              plan={plan}
              pillar={resolved.pillar}
              actionStates={actionStates}
              onSelect={onSelect}
              onClose={onClose}
              onToggleAction={onToggleAction}
              isDemo={isDemo}
            />
          ) : (
            <ActionCard
              pillar={resolved.pillar}
              action={resolved.action}
              actionStates={actionStates}
              onSelect={onSelect}
              onClose={onClose}
              onToggleAction={onToggleAction}
              isDemo={isDemo}
            />
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function CardChrome({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="relative rounded-3xl border border-border bg-surface p-5 shadow-card">
      <button
        type="button"
        onClick={onClose}
        aria-label={`Close ${title}`}
        className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-tertiary transition-colors hover:bg-elevated hover:text-primary"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path
            d="M2 2 L12 12 M12 2 L2 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {children}
    </div>
  );
}

function PillarCard({
  plan,
  pillar,
  actionStates,
  onSelect,
  onClose,
  onToggleAction,
  isDemo,
}: {
  plan: StrategyPlan;
  pillar: StrategicPillar;
  actionStates: Record<string, ActionState>;
  onSelect: (s: GraphSelection) => void;
  onClose: () => void;
  onToggleAction: (id: string, s: ActionState) => void;
  isDemo: boolean;
}) {
  const intel = filterIntelligence(plan, pillar.name);
  return (
    <CardChrome onClose={onClose} title={pillar.name}>
      <div className="flex items-center gap-2">
        <Badge tone={pillarTone(pillar.status)} dot>
          {pillar.status}
        </Badge>
        <span className="text-[11px] font-medium text-tertiary">Pillar</span>
      </div>
      <h2 className="mt-2 font-display text-[20px] font-semibold leading-tight text-primary">
        {pillar.name}
      </h2>
      <p className="mt-2 text-[13.5px] leading-relaxed text-secondary">
        {pillar.reason}
      </p>

      <div className="mt-4 flex flex-col gap-1">
        <span className="text-[11px] font-medium text-tertiary">
          Actions ({pillar.actions.length})
        </span>
        <ul className="flex flex-col">
          {pillar.actions.map((a) => {
            const state = actionStates[a.id] ?? "open";
            return (
              <li key={a.id}>
                <div className="group flex items-center gap-2 border-b border-border/60 py-2 last:border-b-0">
                  <ActionCheckbox
                    state={state}
                    label={a.name}
                    onToggle={() =>
                      onToggleAction(a.id, state === "done" ? "open" : "done")
                    }
                    isDemo={isDemo}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onSelect({ kind: "action", nodeId: a.id })
                    }
                    className="flex flex-1 items-center justify-between gap-2 text-left"
                  >
                    <span
                      className={
                        "truncate text-[13px] " +
                        (state === "done"
                          ? "text-tertiary line-through"
                          : "text-primary group-hover:text-accent-strong")
                      }
                    >
                      {a.name}
                    </span>
                    <Badge tone={actionTone(a.status)}>{a.status}</Badge>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {intel.next7.length > 0 ? (
        <IntelSection title="This week">
          <ul className="flex flex-col gap-1.5">
            {intel.next7.slice(0, 3).map((n) => (
              <Next7Item key={n.id} item={n} />
            ))}
          </ul>
        </IntelSection>
      ) : null}

      {intel.cuts.length > 0 ? (
        <IntelSection title="What this means">
          <ul className="flex flex-col gap-1.5">
            {intel.cuts.slice(0, 2).map((c) => (
              <CutItemRow key={c.id} item={c} />
            ))}
          </ul>
        </IntelSection>
      ) : null}

      {intel.risks.length > 0 ? (
        <IntelSection title="Watch out for">
          <ul className="flex flex-col gap-1.5">
            {intel.risks.slice(0, 2).map((r) => (
              <RiskRow key={r.id} item={r} />
            ))}
          </ul>
        </IntelSection>
      ) : null}
    </CardChrome>
  );
}

function ActionCard({
  pillar,
  action,
  actionStates,
  onSelect,
  onClose,
  onToggleAction,
  isDemo,
}: {
  pillar: StrategicPillar;
  action: StrategicPillar["actions"][number];
  actionStates: Record<string, ActionState>;
  onSelect: (s: GraphSelection) => void;
  onClose: () => void;
  onToggleAction: (id: string, s: ActionState) => void;
  isDemo: boolean;
}) {
  const state = actionStates[action.id] ?? "open";
  return (
    <CardChrome onClose={onClose} title={action.name}>
      <div className="flex items-center gap-2">
        <Badge tone={actionTone(action.status)} dot>
          {action.status}
        </Badge>
        <span className="text-[11px] font-medium text-tertiary">
          Action in{" "}
          <button
            type="button"
            onClick={() => onSelect({ kind: "pillar", nodeId: pillar.id })}
            className="font-medium text-secondary underline decoration-border underline-offset-2 transition-colors hover:text-primary hover:decoration-accent"
          >
            {pillar.name}
          </button>
        </span>
      </div>
      <h2 className="mt-2 font-display text-[20px] font-semibold leading-tight text-primary">
        {action.name}
      </h2>
      <p className="mt-2 text-[13.5px] leading-relaxed text-secondary">
        {action.recommendation}
      </p>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-elevated px-3 py-2.5">
        <ActionCheckbox
          state={state}
          label={action.name}
          onToggle={() =>
            onToggleAction(action.id, state === "done" ? "open" : "done")
          }
          isDemo={isDemo}
        />
        <div className="flex flex-1 flex-col">
          <span className="text-[12px] font-medium text-primary">
            {state === "done" ? "Marked done" : "Mark as done"}
          </span>
          <span className="text-[11px] text-tertiary">
            {isDemo
              ? "Demo plan — progress is in-session only"
              : "Stored locally on this device"}
          </span>
        </div>
        {state === "done" ? (
          <button
            type="button"
            onClick={() => onToggleAction(action.id, "open")}
            className="text-[11px] font-medium text-accent-strong hover:underline"
          >
            Undo
          </button>
        ) : null}
      </div>
    </CardChrome>
  );
}

function IntelSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 flex flex-col gap-2">
      <span className="text-[11px] font-medium text-tertiary">{title}</span>
      {children}
    </div>
  );
}

function Next7Item({ item }: { item: ActionItem }) {
  const tone =
    item.priority === "High"
      ? "danger"
      : item.priority === "Medium"
        ? "warning"
        : "muted";
  return (
    <li className="flex items-start gap-2.5 rounded-xl border border-border bg-surface px-3 py-2 text-[12.5px] text-primary">
      <Badge tone={tone}>{item.priority}</Badge>
      <span className="leading-snug">{item.title}</span>
    </li>
  );
}

function CutItemRow({ item }: { item: CutItem }) {
  const tone =
    item.recommendation === "Cut"
      ? "danger"
      : item.recommendation === "Defer"
        ? "warning"
        : item.recommendation === "Double Down"
          ? "success"
          : "default";
  return (
    <li className="rounded-xl border border-border bg-surface px-3 py-2 text-[12.5px]">
      <div className="flex items-center gap-2">
        <Badge tone={tone}>{item.recommendation}</Badge>
        <span className="font-medium text-primary">{item.activity}</span>
      </div>
      <p className="mt-1 text-[12px] leading-snug text-secondary">{item.reason}</p>
    </li>
  );
}

function RiskRow({ item }: { item: RiskItem }) {
  const tone =
    item.severity === "High"
      ? "danger"
      : item.severity === "Medium"
        ? "warning"
        : "muted";
  return (
    <li className="rounded-xl border border-border bg-surface px-3 py-2 text-[12.5px]">
      <div className="flex items-center gap-2">
        <Badge tone={tone} dot>
          {item.severity} risk
        </Badge>
        <span className="font-medium text-primary">{item.title}</span>
      </div>
      <p className="mt-1 text-[12px] leading-snug text-secondary">{item.explanation}</p>
    </li>
  );
}

function ActionCheckbox({
  state,
  label,
  onToggle,
}: {
  state: ActionState;
  label: string;
  onToggle: () => void;
  isDemo: boolean;
}) {
  const checked = state === "done";
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={`${checked ? "Unmark" : "Mark"} ${label} as done`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors " +
        (checked
          ? "border-success bg-success text-white"
          : "border-border-strong bg-surface text-transparent hover:border-primary")
      }
    >
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
        <path
          d="M2 5.5 L4.5 8 L9 3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
