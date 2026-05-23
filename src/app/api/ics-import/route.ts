import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { parseICS } from "@/lib/ics";
import { EventCategory } from "@/types";

function guessCategory(summary: string): EventCategory {
  const s = summary.toLowerCase();
  if (/lecture|class|lab|tutorial|seminar/.test(s)) return "class";
  if (/exam|midterm|final|quiz|assignment|due|homework/.test(s))
    return "assignment";
  if (/meeting|sync|call|interview|standup/.test(s)) return "meeting";
  if (/gym|workout|run|yoga|fitness/.test(s)) return "gym";
  if (/grocer|shop|errand/.test(s)) return "grocery";
  if (/transit|commute|drive|bus/.test(s)) return "transit";
  if (/lunch|dinner|break|coffee/.test(s)) return "break";
  if (/club|exec|society/.test(s)) return "club";
  if (/project|hackathon|build|code/.test(s)) return "project";
  if (/friend|hangout|party|date/.test(s)) return "social";
  return "personal";
}

async function fetchICSFromUrl(url: string): Promise<string> {
  const httpsUrl = url.replace(/^webcal:\/\//i, "https://");
  const res = await fetch(httpsUrl, {
    headers: { Accept: "text/calendar, text/plain, */*" },
  });
  if (!res.ok) {
    throw new Error(`Calendar URL returned ${res.status}`);
  }
  return res.text();
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();

  try {
    const contentType = request.headers.get("content-type") ?? "";
    let body: string;

    if (contentType.includes("application/json")) {
      const json = await request.json();
      if (!json.url || typeof json.url !== "string") {
        return NextResponse.json(
          { error: "Provide a calendar URL" },
          { status: 400 }
        );
      }
      body = await fetchICSFromUrl(json.url);
    } else {
      body = await request.text();
    }

    const parsed = parseICS(body);

    if (parsed.length === 0) {
      return NextResponse.json({ imported: 0, events: [] });
    }

    const rows = parsed.map((e) => ({
      title: e.summary,
      description: e.description ?? null,
      category: guessCategory(e.summary),
      start_time: e.start.toISOString(),
      end_time: e.end.toISOString(),
      location: e.location ?? null,
    }));

    const { data, error } = await supabase
      .from("events")
      .insert(rows)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ imported: data?.length ?? 0, events: data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to parse ICS" },
      { status: 400 }
    );
  }
}
