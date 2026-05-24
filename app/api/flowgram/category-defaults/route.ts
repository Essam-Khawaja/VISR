import { getSupabase } from "@/lib/flowgram/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let query = supabase.from("category_default_items").select("*, items(*)");

  if (category) {
    query = query.eq("category", category);
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
  const { category, item_id } = body;

  if (!category || !item_id) {
    return NextResponse.json(
      { error: "category and item_id are required" },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("category_default_items")
    .select("*")
    .eq("category", category)
    .eq("item_id", item_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(existing);
  }

  const { data, error } = await supabase
    .from("category_default_items")
    .insert({ category, item_id })
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

  const { error } = await supabase
    .from("category_default_items")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
