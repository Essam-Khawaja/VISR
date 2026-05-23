import { getSupabase } from "@/lib/supabase";
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

export async function PATCH(request: NextRequest) {
  const supabase = getSupabase();
  const body = await request.json();
  const { id, mark_complete, ...updates } = body;

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
    const intervalDays =
      routine.frequency === "weekly"
        ? 7
        : routine.frequency === "monthly"
          ? 30
          : routine.frequency === "every_n_days"
            ? routine.interval_days ?? 1
            : 1;

    const next = new Date(now);
    next.setDate(next.getDate() + intervalDays);

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

  const { data, error } = await supabase
    .from("routines")
    .update(updates)
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

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await supabase.from("routines").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
