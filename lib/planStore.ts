"use client";

import { createSupabaseAnonClient } from "./supabase";
import type { OpportunityCheck, StrategyPlan } from "./types";

export type ActionState = "open" | "doing" | "done" | "skipped";

export type JournalEntry = {
  id: string;
  createdAt: string;
  text: string;
};

export type Commitment = {
  id: string;
  source: "opportunity" | "manual";
  title: string;
  condition?: string;
  createdAt: string;
};

export type StoredPlan = {
  plan: StrategyPlan;
  actionStates: Record<string, ActionState>;
  appliedCuts: string[];
  commitments: Commitment[];
  journal: JournalEntry[];
  opportunityHistory: OpportunityCheck[];
  lastReviewedAt: string;
};

const KEY_INDEX = "pathwise.plans";
const planKey = (id: string) => `pathwise.plan.${id}`;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadPlanIndex(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY_INDEX);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function saveIndex(ids: string[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(KEY_INDEX, JSON.stringify(ids));
  } catch {}
}

function emptyStored(plan: StrategyPlan): StoredPlan {
  return {
    plan,
    actionStates: {},
    appliedCuts: [],
    commitments: [],
    journal: [],
    opportunityHistory: [],
    lastReviewedAt: new Date().toISOString(),
  };
}

export function savePlan(planId: string, plan: StrategyPlan): void {
  if (!isBrowser()) return;
  const existing = loadStoredPlan(planId);
  const next: StoredPlan = existing
    ? { ...existing, plan, lastReviewedAt: new Date().toISOString() }
    : emptyStored(plan);
  try {
    window.localStorage.setItem(planKey(planId), JSON.stringify(next));
    const ids = loadPlanIndex();
    if (!ids.includes(planId)) saveIndex([planId, ...ids]);
  } catch {}
}

export function loadStoredPlan(planId: string): StoredPlan | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(planKey(planId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPlan;
    if (!parsed || typeof parsed !== "object" || !parsed.plan) return null;
    return {
      ...parsed,
      actionStates: parsed.actionStates ?? {},
      appliedCuts: parsed.appliedCuts ?? [],
      commitments: parsed.commitments ?? [],
      journal: parsed.journal ?? [],
      opportunityHistory: parsed.opportunityHistory ?? [],
      lastReviewedAt: parsed.lastReviewedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function setActionState(
  planId: string,
  actionId: string,
  state: ActionState,
): StoredPlan | null {
  const stored = loadStoredPlan(planId);
  if (!stored) return null;
  const nextStates = { ...stored.actionStates };
  if (state === "open") {
    delete nextStates[actionId];
  } else {
    nextStates[actionId] = state;
  }
  const next: StoredPlan = {
    ...stored,
    actionStates: nextStates,
    lastReviewedAt: new Date().toISOString(),
  };
  if (!isBrowser()) return next;
  try {
    window.localStorage.setItem(planKey(planId), JSON.stringify(next));
  } catch {}
  syncToSupabase(planId, next);
  return next;
}

export function applyOpportunity(
  planId: string,
  check: OpportunityCheck,
): StoredPlan | null {
  const stored = loadStoredPlan(planId);
  if (!stored) return null;
  const now = new Date().toISOString();
  const newCuts = [...stored.appliedCuts];
  for (const c of check.cutsRequired) {
    if (!newCuts.includes(c)) newCuts.push(c);
  }
  const newCommitments: Commitment[] = check.conditions.map((cond, i) => ({
    id: `commitment-${check.id}-${i}`,
    source: "opportunity",
    title: check.opportunityText.slice(0, 80),
    condition: cond,
    createdAt: now,
  }));
  const next: StoredPlan = {
    ...stored,
    appliedCuts: newCuts,
    commitments: [...stored.commitments, ...newCommitments],
    opportunityHistory: [check, ...stored.opportunityHistory].slice(0, 20),
    lastReviewedAt: now,
  };
  if (!isBrowser()) return next;
  try {
    window.localStorage.setItem(planKey(planId), JSON.stringify(next));
  } catch {}
  return next;
}

export function addJournalEntry(planId: string, text: string): StoredPlan | null {
  const stored = loadStoredPlan(planId);
  if (!stored) return null;
  const entry: JournalEntry = {
    id: `journal-${Date.now()}`,
    createdAt: new Date().toISOString(),
    text,
  };
  const next: StoredPlan = {
    ...stored,
    journal: [entry, ...stored.journal].slice(0, 50),
    lastReviewedAt: new Date().toISOString(),
  };
  if (!isBrowser()) return next;
  try {
    window.localStorage.setItem(planKey(planId), JSON.stringify(next));
  } catch {}
  return next;
}

export function addTasksToNode(
  planId: string,
  parentNodeId: string,
  tasks: Array<{ name: string; recommendation: string }>,
): import("./types").ActionNode[] {
  const stored = loadStoredPlan(planId);
  if (!stored) return [];

  const created: import("./types").ActionNode[] = tasks.map((t) => ({
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: t.name,
    status: "On Track" as const,
    recommendation: t.recommendation,
  }));

  let attached = false;
  for (const pillar of stored.plan.strategicPillars) {
    if (pillar.id === parentNodeId) {
      pillar.actions.push(...created);
      attached = true;
      break;
    }
    if (attachToAction(pillar.actions, parentNodeId, created)) {
      attached = true;
      break;
    }
  }

  if (attached) {
    try {
      window.localStorage.setItem(
        `pathwise.plan.${planId}`,
        JSON.stringify(stored),
      );
    } catch {}
    syncToSupabase(planId, stored);
  }

  return created;
}

function attachToAction(
  actions: import("./types").ActionNode[],
  parentId: string,
  children: import("./types").ActionNode[],
): boolean {
  for (const action of actions) {
    if (action.id === parentId) {
      action.children = [...(action.children ?? []), ...children];
      return true;
    }
    if (
      action.children &&
      attachToAction(action.children, parentId, children)
    ) {
      return true;
    }
  }
  return false;
}

function syncToSupabase(planId: string, stored: StoredPlan): void {
  if (planId.startsWith("demo-") || planId === "onboarding-preview") return;
  try {
    const sb = createSupabaseAnonClient();
    if (!sb) return;
    sb.from("strategy_plans")
      .update({
        plan: stored.plan,
        action_states: stored.actionStates,
      })
      .eq("id", planId)
      .then(() => {});
  } catch {}
}

export function deletePlan(planId: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(planKey(planId));
    saveIndex(loadPlanIndex().filter((id) => id !== planId));
  } catch {}
}
