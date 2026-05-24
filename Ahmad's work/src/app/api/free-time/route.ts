import { getSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { findFreeSlots } from "@/lib/timeline-utils";
import { TimelineEvent, PersonalTimeBlock } from "@/types";

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

  const [eventsRes, personalRes] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .gte("start_time", dayStart.toISOString())
      .lte("start_time", dayEnd.toISOString())
      .order("start_time", { ascending: true }),
    supabase.from("personal_time_blocks").select("*").eq("active", true),
  ]);

  if (eventsRes.error) {
    return NextResponse.json(
      { error: eventsRes.error.message },
      { status: 500 }
    );
  }

  const events = (eventsRes.data ?? []) as TimelineEvent[];
  const blocks = (personalRes.data ?? []) as PersonalTimeBlock[];

  const target = new Date(`${date}T12:00:00`);
  const targetWeekday = target.getDay();

  const phantomEvents: TimelineEvent[] = blocks
    .filter((b) => {
      if (b.specific_date) return b.specific_date === date;
      if (b.weekday != null) return b.weekday === targetWeekday;
      return false;
    })
    .map((b, idx) => {
      const [sh, sm] = b.start_time.split(":").map(Number);
      const [eh, em] = b.end_time.split(":").map(Number);
      const start = new Date(dayStart);
      start.setHours(sh, sm, 0, 0);
      const end = new Date(dayStart);
      end.setHours(eh, em, 0, 0);
      return {
        id: `personal-${b.id}-${idx}`,
        title: b.label,
        description: null,
        category: "personal",
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        location: null,
        location_id: null,
        auto_transit: false,
        is_recurring: false,
        recurrence_rule: null,
        notes: null,
        note_status: null,
        completed: false,
        created_at: new Date().toISOString(),
      } as TimelineEvent;
    });

  const slots = findFreeSlots(
    [...events, ...phantomEvents],
    effectiveStart,
    effectiveEnd,
    minMinutes
  );

  return NextResponse.json(slots);
}
