import { getSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  let query = supabase
    .from("manual_checklist_items")
    .select("*")
    .order("created_at", { ascending: true });

  if (date) {
    query = query.eq("for_date", date);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED_MANUAL_PATCH_FIELDS = new Set(["checked", "item_name"]);

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const body = await request.json();
  const { item_name, for_date } = body;

  if (!item_name || !for_date) {
    return NextResponse.json(
      { error: "item_name and for_date are required" },
      { status: 400 }
    );
  }
  if (!DATE_RE.test(for_date)) {
    return NextResponse.json(
      { error: "for_date must be YYYY-MM-DD" },
      { status: 400 }
    );
  }
  const trimmed = String(item_name).trim();
  if (trimmed.length === 0 || trimmed.length > 200) {
    return NextResponse.json(
      { error: "item_name must be 1-200 characters" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("manual_checklist_items")
    .insert({
      item_name: trimmed,
      for_date,
      checked: false,
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

  const filtered: Record<string, unknown> = {};
  for (const key of Object.keys(updates)) {
    if (ALLOWED_MANUAL_PATCH_FIELDS.has(key)) {
      filtered[key] = (updates as Record<string, unknown>)[key];
    }
  }

  const { data, error } = await supabase
    .from("manual_checklist_items")
    .update(filtered)
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

  const { error } = await supabase
    .from("manual_checklist_items")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
