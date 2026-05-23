import { getSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const date =
    searchParams.get("date") ?? new Date().toISOString().split("T")[0];
  const dateEnd = searchParams.get("date_end") ?? date;
  const includeIncomplete = searchParams.get("incomplete_only") === "true";

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${dateEnd}T23:59:59`);

  let query = supabase
    .from("events")
    .select("*")
    .gte("start_time", dayStart.toISOString())
    .lte("start_time", dayEnd.toISOString())
    .order("start_time", { ascending: true });

  if (includeIncomplete) {
    query = query.eq("completed", false);
  }

  const { data, error } = await query;

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
    start_time,
    end_time,
    location,
    location_id,
    auto_transit,
    is_recurring,
    recurrence_rule,
    notes,
    note_status,
  } = body;

  if (!title || !category || !start_time || !end_time) {
    return NextResponse.json(
      { error: "title, category, start_time, and end_time are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      title,
      description: description ?? null,
      category,
      start_time,
      end_time,
      location: location ?? null,
      location_id: location_id ?? null,
      auto_transit: auto_transit ?? false,
      is_recurring: is_recurring ?? false,
      recurrence_rule: recurrence_rule ?? null,
      notes: notes ?? null,
      note_status: note_status ?? null,
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
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("events")
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

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
