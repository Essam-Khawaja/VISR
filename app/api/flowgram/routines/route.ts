/**
 * /api/flowgram/routines
 *
 * CRUD for recurring routines (daily, weekly, monthly, every-N-days).
 * PATCH supports `mark_complete` / `mark_incomplete` mode and DELETE
 * supports a soft end via `from_date` so we don't lose history.
 */
import { getSupabase } from "@/lib/flowgram/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .order("next_due", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const body = await request.json();
  const {
    title,
    description,
    category,
    frequency,
    interval_days,
    preferred_time,
  } = body;

  if (!title || !frequency) {
    return NextResponse.json(
      { error: "title and frequency are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("routines")
    .insert({
      title,
      description: description ?? null,
      category: category ?? "personal",
      frequency,
      interval_days: interval_days ?? 1,
      preferred_time: preferred_time ?? null,
      next_due: new Date().toISOString(),
      active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

function advanceFrom(date: Date, frequency: string, intervalDays: number | null): Date {
  const next = new Date(date);
  if (frequency === "monthly") {
    next.setMonth(next.getMonth() + 1);
  } else if (frequency === "weekly") {
    next.setDate(next.getDate() + 7);
  } else if (frequency === "every_n_days") {
    next.setDate(next.getDate() + Math.max(1, intervalDays ?? 1));
  } else {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

function rewindFrom(date: Date, frequency: string, intervalDays: number | null): Date {
  const prev = new Date(date);
  if (frequency === "monthly") {
    prev.setMonth(prev.getMonth() - 1);
  } else if (frequency === "weekly") {
    prev.setDate(prev.getDate() - 7);
  } else if (frequency === "every_n_days") {
    prev.setDate(prev.getDate() - Math.max(1, intervalDays ?? 1));
  } else {
    prev.setDate(prev.getDate() - 1);
  }
  return prev;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function isoDateLocal(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const ALLOWED_PATCH_FIELDS = new Set([
  "title",
  "description",
  "category",
  "frequency",
  "interval_days",
  "preferred_time",
  "active",
  "ends_on",
]);

export async function PATCH(request: NextRequest) {
  const supabase = getSupabase();
  const body = await request.json();
  const { id, mark_complete, mark_incomplete, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (mark_complete) {
    const { data: routine } = await supabase
      .from("routines")
      .select("*")
      .eq("id", id)
      .single();

    if (!routine) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const now = new Date();
    const next = advanceFrom(now, routine.frequency, routine.interval_days);

    const { data, error } = await supabase
      .from("routines")
      .update({
        last_completed: now.toISOString(),
        next_due: next.toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }

  if (mark_incomplete) {
    const { data: routine } = await supabase
      .from("routines")
      .select("*")
      .eq("id", id)
      .single();

    if (!routine) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    void rewindFrom(
      routine.last_completed ? new Date(routine.last_completed) : new Date(),
      routine.frequency,
      routine.interval_days
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("routines")
      .update({
        last_completed: null,
        next_due: today.toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }

  const filteredUpdates: Record<string, unknown> = {};
  for (const key of Object.keys(updates)) {
    if (ALLOWED_PATCH_FIELDS.has(key)) {
      filteredUpdates[key] = (updates as Record<string, unknown>)[key];
    }
  }

  const { data, error } = await supabase
    .from("routines")
    .update(filteredUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const fromDate = searchParams.get("from_date");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (fromDate) {
    const [y, m, d] = fromDate.split("-").map(Number);
    if (!y || !m || !d) {
      return NextResponse.json({ error: "invalid from_date" }, { status: 400 });
    }
    const target = new Date(y, m - 1, d);
    target.setDate(target.getDate() - 1);
    const endsOnIso = isoDateLocal(target);

    const { error } = await supabase
      .from("routines")
      .update({ ends_on: endsOnIso })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, ended: endsOnIso });
  }

  const { error } = await supabase.from("routines").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
