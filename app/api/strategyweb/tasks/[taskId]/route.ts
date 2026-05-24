import { NextResponse } from "next/server";
import {
  createSupabaseAnonClient,
  createSupabaseServiceClient,
} from "@/lib/shared/supabase";
import { rowToTask } from "@/lib/strategyweb/taskStore";
import { StrategyTaskUpdateSchema } from "@/lib/strategyweb/validate";

type Params = {
  params: {
    taskId: string;
  };
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(
  code: string,
  message: string,
  status: number,
) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function PATCH(req: Request, { params }: Params) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_REQUEST", "Invalid JSON body.", 400);
  }

  const parse = StrategyTaskUpdateSchema.safeParse(body);
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

  const patch = parse.data;
  const rowPatch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.title !== undefined) rowPatch.title = patch.title;
  if (patch.recommendation !== undefined) rowPatch.recommendation = patch.recommendation;
  if (patch.notes !== undefined) rowPatch.notes = patch.notes;
  if (patch.priority !== undefined) rowPatch.priority = patch.priority;
  if (patch.dueDate !== undefined) rowPatch.due_date = patch.dueDate;
  if (patch.status !== undefined) {
    rowPatch.status = patch.status;
    rowPatch.completed_at =
      patch.status === "done" ? new Date().toISOString() : null;
  }

  const { data, error } = await sb
    .from("strategy_tasks")
    .update(rowPatch)
    .eq("id", params.taskId)
    .select("*")
    .maybeSingle();

  if (error) return errorResponse("TASK_SAVE_FAILED", error.message, 500);
  if (!data) return errorResponse("TASK_NOT_FOUND", "Task not found.", 404);

  return NextResponse.json({
    task: rowToTask(data as Record<string, unknown>),
  });
}
