import { getSupabase } from "@/lib/1/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("event_id");
  const eventIdsRaw = searchParams.get("event_ids");

  if (!eventId && !eventIdsRaw) {
    return NextResponse.json(
      { error: "event_id or event_ids is required" },
      { status: 400 }
    );
  }

  let query = supabase.from("event_items").select("*, items(*)");
  if (eventIdsRaw) {
    const ids = eventIdsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length === 0) {
      return NextResponse.json([]);
    }
    query = query.in("event_id", ids);
  } else if (eventId) {
    query = query.eq("event_id", eventId);
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
  const { event_id, item_id, is_one_time } = body;

  if (!event_id || !item_id) {
    return NextResponse.json(
      { error: "event_id and item_id are required" },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("event_items")
    .select("*")
    .eq("event_id", event_id)
    .eq("item_id", item_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(existing);
  }

  const { data, error } = await supabase
    .from("event_items")
    .insert({
      event_id,
      item_id,
      is_one_time: is_one_time ?? false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await supabase.from("event_items").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
