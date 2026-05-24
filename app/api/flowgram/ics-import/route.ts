/**
 * /api/flowgram/ics-import
 *
 * Parses an .ics file or feed and bulk-inserts events. URL imports are
 * SSRF-guarded against private hosts. Each event is run through
 * `guessCategory` so the chronology adopts the right styling.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/flowgram/supabase";
import { parseICS } from "@/lib/flowgram/ics";
import { EventCategory } from "@/lib/flowgram/types";

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

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254",
]);

function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(h)) return true;
  if (h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (/^fc00:/i.test(h) || /^fd00:/i.test(h)) return true;
  if (/^fe80:/i.test(h)) return true;
  return false;
}

async function fetchICSFromUrl(rawUrl: string): Promise<string> {
  const httpsRaw = rawUrl.replace(/^webcal:\/\//i, "https://");
  let parsed: URL;
  try {
    parsed = new URL(httpsRaw);
  } catch {
    throw new Error("Invalid calendar URL");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Only http(s) calendar URLs are supported");
  }
  if (isBlockedHost(parsed.hostname)) {
    throw new Error("This host is not allowed");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(parsed.toString(), {
      headers: { Accept: "text/calendar, text/plain, */*" },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error(`Calendar URL returned ${res.status}`);
    }
    const text = await res.text();
    if (text.length > 5_000_000) {
      throw new Error("Calendar file is too large");
    }
    return text;
  } finally {
    clearTimeout(timeout);
  }
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
