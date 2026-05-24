/**
 * /api/flowgram/events
 *
 * CRUD for the Flowgram `events` table.
 *   GET   : List events for a date or date range. Day bounds respect the
 *           user's saved IANA timezone so cross-midnight events still show
 *           up on the right day.
 *   POST  : Create an event.
 *   PATCH : Field-whitelisted update.
 *   DELETE: Remove an event.
 */

import { getSupabase } from "@/lib/flowgram/supabase";
import { NextRequest, NextResponse } from "next/server";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function localISO(date: string): string {
  const parts = date.split("-").map(Number);
  if (parts.length !== 3 || parts.some((p) => Number.isNaN(p))) {
    return new Date().toISOString();
  }
  return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0).toISOString();
}

async function offsetMinutesForTimezone(tz: string | null): Promise<number | null> {
  if (!tz) return null;
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    const parts = fmt.formatToParts(new Date());
    const off = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    const m = off.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!m) return null;
    const sign = m[1] === "+" ? 1 : -1;
    const hours = Number(m[2]);
    const minutes = Number(m[3] ?? 0);
    return sign * (hours * 60 + minutes);
  } catch {
    return null;
  }
}

function isoFromDateInTz(date: string, offsetMin: number, endOfDay = false): string {
  const parts = date.split("-").map(Number);
  if (parts.length !== 3 || parts.some((p) => Number.isNaN(p))) {
    return new Date().toISOString();
  }
  const [y, mo, d] = parts;
  const h = endOfDay ? 23 : 0;
  const mi = endOfDay ? 59 : 0;
  const s = endOfDay ? 59 : 0;
  const utcMillis = Date.UTC(y, mo - 1, d, h, mi, s) - offsetMin * 60 * 1000;
  return new Date(utcMillis).toISOString();
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const today = new Date();
  const fallbackDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const date = searchParams.get("date") ?? fallbackDate;
  const dateEnd = searchParams.get("date_end") ?? date;
  const includeIncomplete = searchParams.get("incomplete_only") === "true";

  const { data: settings } = await supabase
    .from("user_settings")
    .select("timezone")
    .limit(1)
    .maybeSingle();
  const offset = await offsetMinutesForTimezone(settings?.timezone ?? null);

  const startIso =
    offset !== null ? isoFromDateInTz(date, offset) : localISO(date);
  const endIso =
    offset !== null
      ? isoFromDateInTz(dateEnd, offset, true)
      : new Date(`${dateEnd}T23:59:59`).toISOString();

  let query = supabase
    .from("events")
    .select("*")
    .gte("start_time", startIso)
    .lte("start_time", endIso)
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

const ALLOWED_EVENT_PATCH_FIELDS = new Set([
  "title",
  "description",
  "category",
  "start_time",
  "end_time",
  "location",
  "location_id",
  "auto_transit",
  "is_recurring",
  "recurrence_rule",
  "notes",
  "note_status",
  "completed",
]);

export async function PATCH(request: NextRequest) {
  const supabase = getSupabase();
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const filtered: Record<string, unknown> = {};
  for (const key of Object.keys(updates)) {
    if (ALLOWED_EVENT_PATCH_FIELDS.has(key)) {
      filtered[key] = (updates as Record<string, unknown>)[key];
    }
  }

  const { data, error } = await supabase
    .from("events")
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

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
