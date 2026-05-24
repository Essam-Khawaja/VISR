import { DEMO_PLAN_ID, fixturePlan } from "./fixture";
import type { StrategyPlan } from "./types";

/**
 * Fetch a strategy plan by id. Falls back to the local fixture when:
 *   - the planId matches DEMO_PLAN_ID (configured via env)
 *   - Supabase env vars are not configured (local dev / pre-merge)
 *
 * Real Supabase wiring is added by the AI pipeline feature; this helper
 * keeps the UI fully functional in isolation.
 */
export async function fetchStrategyPlan(
  planId: string,
): Promise<StrategyPlan | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isDemo =
    planId === DEMO_PLAN_ID ||
    planId === process.env.NEXT_PUBLIC_DEMO_PLAN_ID ||
    planId === process.env.DEMO_PLAN_ID;

  if (isDemo || !url || !key) {
    return { ...fixturePlan, id: planId };
  }

  try {
    const res = await fetch(
      `${url}/rest/v1/strategy_plans?id=eq.${encodeURIComponent(
        planId,
      )}&select=*`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<Record<string, unknown>>;
    if (!rows.length) return null;
    const row = rows[0];
    return mapRow(row);
  } catch {
    return null;
  }
}

function mapRow(row: Record<string, unknown>): StrategyPlan {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    destination: String(row.destination),
    currentStage: String(row.current_stage),
    mainBottleneck: String(row.main_bottleneck),
    routeStatus: row.route_status as StrategyPlan["routeStatus"],
    alignmentScore: Number(row.alignment_score),
    strategicPillars: row.strategic_pillars as StrategyPlan["strategicPillars"],
    semesterPriorities: row.semester_priorities as string[],
    cutList: row.cut_list as StrategyPlan["cutList"],
    nextSevenDays: row.next_seven_days as StrategyPlan["nextSevenDays"],
    risks: row.risks as StrategyPlan["risks"],
    createdAt: String(row.created_at),
  };
}
