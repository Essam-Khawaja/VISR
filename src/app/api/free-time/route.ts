import { getSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { findFreeSlots } from "@/lib/timeline-utils";
import { TimelineEvent } from "@/types";

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const date =
    searchParams.get("date") ?? new Date().toISOString().split("T")[0];
  const minMinutes = parseInt(searchParams.get("min_minutes") ?? "15", 10);
  const wakeTime = searchParams.get("wake_time") ?? "07:00";
  const sleepTime = searchParams.get("sleep_time") ?? "23:00";

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  const [wakeH, wakeM] = wakeTime.split(":").map(Number);
  const [sleepH, sleepM] = sleepTime.split(":").map(Number);

  const effectiveStart = new Date(dayStart);
  effectiveStart.setHours(wakeH || 7, wakeM || 0, 0, 0);

  const effectiveEnd = new Date(dayStart);
  effectiveEnd.setHours(sleepH || 23, sleepM || 0, 0, 0);

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .gte("start_time", dayStart.toISOString())
    .lte("start_time", dayEnd.toISOString())
    .order("start_time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const slots = findFreeSlots(
    events as TimelineEvent[],
    effectiveStart,
    effectiveEnd,
    minMinutes
  );

  return NextResponse.json(slots);
}
