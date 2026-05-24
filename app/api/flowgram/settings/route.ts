import { getSupabase } from "@/lib/flowgram/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const body = await request.json();
  const { city, country, country_code, timezone, wake_time, sleep_time } = body;

  const { data: existing } = await supabase
    .from("user_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("user_settings")
      .update({
        city: city ?? existing.city,
        country: country ?? existing.country,
        country_code: country_code ?? existing.country_code,
        timezone: timezone ?? existing.timezone,
        wake_time: wake_time ?? existing.wake_time,
        sleep_time: sleep_time ?? existing.sleep_time,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from("user_settings")
    .insert({
      city: city ?? "",
      country: country ?? "",
      country_code: country_code ?? "",
      timezone: timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      wake_time: wake_time ?? "07:00",
      sleep_time: sleep_time ?? "23:00",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
