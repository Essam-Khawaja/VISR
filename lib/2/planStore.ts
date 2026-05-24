"use client";

import { createSupabaseAnonClient } from "@/lib/shared/supabase";
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
const KEY_MIGRATED = "pathwise.migrated.v1";
const KEY_ACTIVE_PLAN = "pathwise.activePlanId";
const planKey = (id: string) => `pathwise.plan.${id}`;

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function isDemoOrPreview(planId: string): boolean {
  return planId.startsWith("demo-") || planId === "onboarding-preview";
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

export function getActivePlanId(): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(KEY_ACTIVE_PLAN);
  } catch {
    return null;
  }
}

export function setActivePlanId(planId: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(KEY_ACTIVE_PLAN, planId);
  } catch {}
}

export function clearActivePlanId(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(KEY_ACTIVE_PLAN);
  } catch {}
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

function writeLocal(planId: string, stored: StoredPlan) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(planKey(planId), JSON.stringify(stored));
    const ids = loadPlanIndex();
    if (!ids.includes(planId)) saveIndex([planId, ...ids]);
  } catch {}
}

// -------------------------------------------------------------
// Read API (sync, returns local cache - fast paint path)
// -------------------------------------------------------------

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

// -------------------------------------------------------------
// Supabase shape mapping
// -------------------------------------------------------------

type DbStateColumn = {
  actionStates?: Record<string, ActionState>;
  appliedCuts?: string[];
  commitments?: Commitment[];
  journal?: JournalEntry[];
  opportunityHistory?: OpportunityCheck[];
};

function storedToRow(planId: string, stored: StoredPlan) {
  const state: DbStateColumn = {
    actionStates: stored.actionStates,
    appliedCuts: stored.appliedCuts,
    commitments: stored.commitments,
    journal: stored.journal,
    opportunityHistory: stored.opportunityHistory,
  };
  return {
    id: planId,
    student_id: stored.plan.studentId || null,
    plan: stored.plan,
    state,
    last_reviewed_at: stored.lastReviewedAt,
  };
}

function rowToStored(row: Record<string, unknown>): StoredPlan | null {
  if (!row || !row.plan) return null;
  const state = (row.state ?? {}) as DbStateColumn;
  const plan = row.plan as StrategyPlan;
  return {
    plan,
    actionStates: state.actionStates ?? {},
    appliedCuts: state.appliedCuts ?? [],
    commitments: state.commitments ?? [],
    journal: state.journal ?? [],
    opportunityHistory: state.opportunityHistory ?? [],
    lastReviewedAt:
      (row.last_reviewed_at as string) ?? new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// Async Supabase pulls / pushes (write-through cache)
// -------------------------------------------------------------

export async function fetchStoredPlanFromSupabase(
  planId: string,
): Promise<StoredPlan | null> {
  if (isDemoOrPreview(planId)) return null;
  const sb = createSupabaseAnonClient();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("strategy_plans")
      .select("id, student_id, plan, state, last_reviewed_at")
      .eq("id", planId)
      .maybeSingle();
    if (error || !data) return null;
    const stored = rowToStored(data as Record<string, unknown>);
    if (stored) writeLocal(planId, stored);
    return stored;
  } catch {
    return null;
  }
}

function syncStoredToSupabase(planId: string, stored: StoredPlan): void {
  if (isDemoOrPreview(planId)) return;
  const sb = createSupabaseAnonClient();
  if (!sb) return;
  try {
    void sb
      .from("strategy_plans")
      .upsert(storedToRow(planId, stored), { onConflict: "id" })
      .then(() => {});
  } catch {
    /* best effort */
  }
}

function syncOpportunityCheck(planId: string, check: OpportunityCheck): void {
  if (isDemoOrPreview(planId)) return;
  const sb = createSupabaseAnonClient();
  if (!sb) return;
  try {
    void sb
      .from("opportunity_checks")
      .upsert(
        {
          id: check.id,
          plan_id: planId,
          opportunity_text: check.opportunityText,
          result: check,
        },
        { onConflict: "id" },
      )
      .then(() => {});
  } catch {
    /* best effort */
  }
}

// -------------------------------------------------------------
// Write API (sync local + fire-and-forget Supabase)
// -------------------------------------------------------------

export function savePlan(planId: string, plan: StrategyPlan): void {
  const existing = loadStoredPlan(planId);
  const next: StoredPlan = existing
    ? { ...existing, plan, lastReviewedAt: new Date().toISOString() }
    : emptyStored(plan);
  writeLocal(planId, next);
  setActivePlanId(planId);
  syncStoredToSupabase(planId, next);
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
  writeLocal(planId, next);
  syncStoredToSupabase(planId, next);
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
  writeLocal(planId, next);
  syncStoredToSupabase(planId, next);
  syncOpportunityCheck(planId, check);
  return next;
}

export function addJournalEntry(
  planId: string,
  text: string,
): StoredPlan | null {
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
  writeLocal(planId, next);
  syncStoredToSupabase(planId, next);
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
    const next: StoredPlan = {
      ...stored,
      lastReviewedAt: new Date().toISOString(),
    };
    writeLocal(planId, next);
    syncStoredToSupabase(planId, next);
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

export function deletePlan(planId: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(planKey(planId));
    saveIndex(loadPlanIndex().filter((id) => id !== planId));
    if (getActivePlanId() === planId) clearActivePlanId();
  } catch {}
  if (isDemoOrPreview(planId)) return;
  const sb = createSupabaseAnonClient();
  if (!sb) return;
  try {
    void sb.from("strategy_plans").delete().eq("id", planId).then(() => {});
  } catch {
    /* best effort */
  }
}

// -------------------------------------------------------------
// One-time migration: ship anything currently in localStorage
// up to Supabase. Idempotent (uses upsert), guarded by a flag.
// -------------------------------------------------------------

export async function migrateLocalToSupabase(): Promise<{
  migrated: number;
  skipped: number;
}> {
  if (!isBrowser()) return { migrated: 0, skipped: 0 };
  if (window.localStorage.getItem(KEY_MIGRATED) === "1") {
    return { migrated: 0, skipped: 0 };
  }
  const sb = createSupabaseAnonClient();
  if (!sb) return { migrated: 0, skipped: 0 };

  const ids = loadPlanIndex();
  let migrated = 0;
  let skipped = 0;

  for (const id of ids) {
    if (isDemoOrPreview(id)) {
      skipped += 1;
      continue;
    }
    const stored = loadStoredPlan(id);
    if (!stored) {
      skipped += 1;
      continue;
    }
    try {
      const { error } = await sb
        .from("strategy_plans")
        .upsert(storedToRow(id, stored), { onConflict: "id" });
      if (error) {
        skipped += 1;
        continue;
      }
      for (const check of stored.opportunityHistory) {
        await sb
          .from("opportunity_checks")
          .upsert(
            {
              id: check.id,
              plan_id: id,
              opportunity_text: check.opportunityText,
              result: check,
            },
            { onConflict: "id" },
          );
      }
      migrated += 1;
    } catch {
      skipped += 1;
    }
  }

  try {
    window.localStorage.setItem(KEY_MIGRATED, "1");
  } catch {}

  return { migrated, skipped };
}
