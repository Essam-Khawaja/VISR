import { createSupabaseAnonClient } from "@/lib/shared/supabase";
import type {
  AcademicTerm,
  StrategyGraphScope,
  StrategyNode,
  StrategyNodeKind,
  StrategyNodeStatus,
} from "./types";

export type CreateStrategyNodeInput = {
  planId: string;
  parentNodeId?: string | null;
  kind: StrategyNodeKind;
  title: string;
  subtitle?: string;
  status?: StrategyNodeStatus;
  scope: StrategyGraphScope;
  yearIndex?: number;
  term?: AcademicTerm;
  startDate?: string;
  endDate?: string;
  sortOrder?: number;
  metadata?: Record<string, unknown>;
};

export type UpdateStrategyNodeInput = Partial<
  Pick<
    StrategyNode,
    | "parentNodeId"
    | "title"
    | "subtitle"
    | "status"
    | "yearIndex"
    | "term"
    | "startDate"
    | "endDate"
    | "sortOrder"
    | "metadata"
  >
>;

const nodeKey = (planId: string) => `pathwise.nodes.${planId}`;

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function isDemoOrPreview(planId: string): boolean {
  return planId.startsWith("demo-") || planId === "onboarding-preview";
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function nowIso(): string {
  return new Date().toISOString();
}

export function loadNodes(planId: string): StrategyNode[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(nodeKey(planId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((node): node is StrategyNode => isStrategyNodeLike(node))
      : [];
  } catch {
    return [];
  }
}

export function saveNodes(planId: string, nodes: StrategyNode[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(nodeKey(planId), JSON.stringify(nodes));
  } catch {}
}

export function clearNodesLocal(planId: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(nodeKey(planId));
  } catch {}
}

export async function fetchNodesFromSupabase(
  planId: string,
): Promise<StrategyNode[]> {
  if (isDemoOrPreview(planId)) return loadNodes(planId);
  const sb = createSupabaseAnonClient();
  if (!sb) return loadNodes(planId);

  try {
    const { data, error } = await sb
      .from("strategy_nodes")
      .select("*")
      .eq("plan_id", planId)
      .order("sort_order", { ascending: true });
    if (error || !data) return loadNodes(planId);
    const nodes = data.map(rowToNode).filter(Boolean) as StrategyNode[];
    const merged = mergeNodes(loadNodes(planId), nodes);
    saveNodes(planId, merged);
    return merged;
  } catch {
    return loadNodes(planId);
  }
}

export async function createStrategyNode(
  input: CreateStrategyNodeInput,
): Promise<StrategyNode> {
  const now = nowIso();
  const node: StrategyNode = {
    id: randomId(),
    planId: input.planId,
    parentNodeId: input.parentNodeId ?? null,
    kind: input.kind,
    title: input.title,
    subtitle: input.subtitle,
    status: input.status ?? "open",
    scope: input.scope,
    yearIndex: input.yearIndex,
    term: input.term,
    startDate: input.startDate,
    endDate: input.endDate,
    sortOrder: input.sortOrder ?? 0,
    metadata: input.metadata ?? {},
    createdAt: now,
    updatedAt: now,
  };

  const next = mergeNodes(loadNodes(input.planId), [node]);
  saveNodes(input.planId, next);
  void upsertNode(node);
  return node;
}

export async function updateStrategyNode(
  planId: string,
  nodeId: string,
  patch: UpdateStrategyNodeInput,
): Promise<StrategyNode | null> {
  const nodes = loadNodes(planId);
  const existing = nodes.find((node) => node.id === nodeId);
  if (!existing) return null;
  const nextNode: StrategyNode = {
    ...existing,
    ...patch,
    updatedAt: nowIso(),
  };
  saveNodes(
    planId,
    mergeNodes(nodes.filter((node) => node.id !== nodeId), [nextNode]),
  );
  void upsertNode(nextNode);
  return nextNode;
}

export function nodesForParent(
  nodes: StrategyNode[],
  parentNodeId: string | null,
): StrategyNode[] {
  return nodes
    .filter((node) => (node.parentNodeId ?? null) === parentNodeId)
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt),
    );
}

export function nodeToRow(node: StrategyNode) {
  return {
    id: node.id,
    plan_id: node.planId,
    parent_node_id: node.parentNodeId ?? null,
    kind: node.kind,
    title: node.title,
    subtitle: node.subtitle ?? null,
    status: node.status,
    scope: node.scope,
    year_index: node.yearIndex ?? null,
    term: node.term ?? null,
    start_date: node.startDate ?? null,
    end_date: node.endDate ?? null,
    sort_order: node.sortOrder,
    metadata: node.metadata,
    created_at: node.createdAt,
    updated_at: node.updatedAt,
  };
}

export function rowToNode(row: Record<string, unknown>): StrategyNode | null {
  if (!row.id || !row.plan_id || !row.kind || !row.title) return null;
  return {
    id: String(row.id),
    planId: String(row.plan_id),
    parentNodeId: row.parent_node_id ? String(row.parent_node_id) : null,
    kind: String(row.kind) as StrategyNodeKind,
    title: String(row.title),
    subtitle: row.subtitle ? String(row.subtitle) : undefined,
    status: String(row.status ?? "open") as StrategyNodeStatus,
    scope: String(row.scope ?? "focus") as StrategyGraphScope,
    yearIndex:
      row.year_index === null || row.year_index === undefined
        ? undefined
        : Number(row.year_index),
    term: row.term ? (String(row.term) as AcademicTerm) : undefined,
    startDate: row.start_date ? String(row.start_date) : undefined,
    endDate: row.end_date ? String(row.end_date) : undefined,
    sortOrder: Number(row.sort_order ?? 0),
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : {},
    createdAt: String(row.created_at ?? nowIso()),
    updatedAt: String(row.updated_at ?? nowIso()),
  };
}

function mergeNodes(
  existing: StrategyNode[],
  incoming: StrategyNode[],
): StrategyNode[] {
  const map = new Map<string, StrategyNode>();
  for (const node of existing) map.set(node.id, node);
  for (const node of incoming) map.set(node.id, node);
  return [...map.values()].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt),
  );
}

function isStrategyNodeLike(value: unknown): value is StrategyNode {
  if (!value || typeof value !== "object") return false;
  const node = value as Partial<StrategyNode>;
  return Boolean(node.id && node.planId && node.kind && node.title);
}

async function upsertNode(node: StrategyNode): Promise<void> {
  if (isDemoOrPreview(node.planId)) return;
  const sb = createSupabaseAnonClient();
  if (!sb) return;
  try {
    await sb.from("strategy_nodes").upsert(nodeToRow(node), { onConflict: "id" });
  } catch {}
}
