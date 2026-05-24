import { getSupabase } from "@/lib/flowgram/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("personal_time_blocks")
    .select("*")
    .order("weekday", { ascending: true, nullsFirst: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const body = await request.json();
  const { label, weekday, specific_date, start_time, end_time } = body;

  if (!label || !start_time || !end_time) {
    return NextResponse.json(
      { error: "label, start_time, and end_time are required" },
      { status: 400 }
    );
  }

  if (weekday == null && !specific_date) {
    return NextResponse.json(
      { error: "either weekday or specific_date is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("personal_time_blocks")
    .insert({
      label,
      weekday: weekday ?? null,
      specific_date: specific_date ?? null,
      start_time,
      end_time,
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
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("personal_time_blocks")
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

  const { error } = await supabase
    .from("personal_time_blocks")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
