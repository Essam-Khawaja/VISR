import { NextResponse } from "next/server";
import {
  createSupabaseAnonClient,
  createSupabaseServiceClient,
} from "@/lib/shared/supabase";
import { rowToTask, taskToRow } from "@/lib/strategyweb/taskStore";
import {
  StrategyTaskCreateSchema,
  StrategyTaskQuerySchema,
} from "@/lib/strategyweb/validate";
import type { StrategyTask } from "@/lib/strategyweb/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(
  code: string,
  message: string,
  status: number,
) {
  return NextResponse.json({ error: { code, message } }, { status });
}

function randomUUID(): string {
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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parse = StrategyTaskQuerySchema.safeParse({
    planId: url.searchParams.get("planId") ?? "",
    date: url.searchParams.get("date") ?? undefined,
    dateFrom: url.searchParams.get("dateFrom") ?? undefined,
    dateTo: url.searchParams.get("dateTo") ?? undefined,
    parentNodeId: url.searchParams.get("parentNodeId") ?? undefined,
    parentTaskId: url.searchParams.get("parentTaskId") ?? undefined,
  });
  if (!parse.success) {
    return errorResponse(
      "INVALID_REQUEST",
      parse.error.issues[0]?.message ?? "Bad request",
      400,
    );
  }

  const sb = createSupabaseAnonClient();
  if (!sb) {
    return errorResponse("SUPABASE_UNAVAILABLE", "Supabase is not configured.", 503);
  }

  const filters = parse.data;
  let query = sb
    .from("strategy_tasks")
    .select("*")
    .eq("plan_id", filters.planId)
    .order("due_date", { ascending: true })
    .order("sort_order", { ascending: true });

  if (filters.date) query = query.eq("due_date", filters.date);
  if (filters.dateFrom) query = query.gte("due_date", filters.dateFrom);
  if (filters.dateTo) query = query.lte("due_date", filters.dateTo);
  if (filters.parentNodeId) query = query.eq("parent_node_id", filters.parentNodeId);
  if (filters.parentTaskId) query = query.eq("parent_task_id", filters.parentTaskId);

  const { data, error } = await query;
  if (error) return errorResponse("TASK_SAVE_FAILED", error.message, 500);
  const tasks = (data ?? [])
    .map((row) => rowToTask(row as Record<string, unknown>))
    .filter(Boolean) as StrategyTask[];
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_REQUEST", "Invalid JSON body.", 400);
  }

  const parse = StrategyTaskCreateSchema.safeParse(body);
  if (!parse.success) {
    return errorResponse(
      "INVALID_REQUEST",
      parse.error.issues[0]?.message ?? "Bad request",
      400,
    );
  }

  const sb = createSupabaseServiceClient() ?? createSupabaseAnonClient();
  if (!sb) {
    return errorResponse("SUPABASE_UNAVAILABLE", "Supabase is not configured.", 503);
  }

  const now = nowIso();
  const task: StrategyTask = {
    id: randomUUID(),
    planId: parse.data.planId,
    studentId: parse.data.studentId ?? null,
    parentNodeId: parse.data.parentNodeId,
    parentNodeKind: parse.data.parentNodeKind,
    parentTaskId: parse.data.parentTaskId ?? null,
    title: parse.data.title,
    recommendation: parse.data.recommendation,
    notes: parse.data.notes,
    priority: parse.data.priority,
    status: "open",
    dueDate: parse.data.dueDate,
    completedAt: null,
    source: parse.data.source,
    sourceActionId: parse.data.sourceActionId ?? null,
    sortOrder: parse.data.sortOrder,
    createdAt: now,
    updatedAt: now,
  };

  const { data, error } = await sb
    .from("strategy_tasks")
    .insert(taskToRow(task))
    .select("*")
    .single();
  if (error || !data) {
    return errorResponse(
      "TASK_SAVE_FAILED",
      error?.message ?? "Could not save task.",
      500,
    );
  }

  return NextResponse.json({
    task: rowToTask(data as Record<string, unknown>) ?? task,
  });
}
