import { getSupabase } from "@/lib/1/supabase";
import { NextRequest, NextResponse } from "next/server";

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("custom_categories")
    .select("*")
    .order("label", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const body = await request.json();
  const { label } = body;

  if (!label || typeof label !== "string" || !label.trim()) {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }

  const cleanLabel = label.trim();
  const name = slugify(cleanLabel);
  if (!name) {
    return NextResponse.json(
      { error: "label must contain letters or numbers" },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("custom_categories")
    .select("*")
    .ilike("name", name)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(existing);
  }

  const { data, error } = await supabase
    .from("custom_categories")
    .insert({ name, label: cleanLabel })
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
    .from("custom_categories")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
