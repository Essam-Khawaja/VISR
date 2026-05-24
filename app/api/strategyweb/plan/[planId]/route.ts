import { NextResponse } from "next/server";
import {
  DEMO_PLAN_ID,
  demoStrategyPlan,
  demoStudentProfile,
} from "@/lib/strategyweb/demoData";
import { createSupabaseAnonClient } from "@/lib/shared/supabase";

type Params = {
  params: {
    planId: string;
  };
};

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: Params) {
  if (params.planId === DEMO_PLAN_ID) {
    return NextResponse.json({
      plan: demoStrategyPlan,
      profile: demoStudentProfile,
    });
  }

  const sb = createSupabaseAnonClient();
  if (!sb) {
    return NextResponse.json(
      {
        error: {
          code: "SUPABASE_UNAVAILABLE",
          message:
            "Supabase is not configured. Open the demo or generate a plan from onboarding.",
        },
      },
      { status: 503 },
    );
  }

  try {
    const { data: planRow, error: planErr } = await sb
      .from("strategy_plans")
      .select("id, plan, state, last_reviewed_at, student_id")
      .eq("id", params.planId)
      .maybeSingle();
    if (planErr || !planRow) {
      return NextResponse.json(
        {
          error: {
            code: "PLAN_NOT_FOUND",
            message: "No plan found for that id.",
          },
        },
        { status: 404 },
      );
    }

    let profile = null;
    if (planRow.student_id) {
      const { data: profileRow } = await sb
        .from("student_profiles")
        .select(
          "id, degree, year, university, target_goal, courses, commitments, work_hours_per_week, constraints, brain_dump, created_at",
        )
        .eq("id", planRow.student_id)
        .maybeSingle();
      profile = profileRow ?? null;
    }

    return NextResponse.json({ plan: planRow.plan, profile });
  } catch (e) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL",
          message: e instanceof Error ? e.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}
