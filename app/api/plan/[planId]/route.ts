import { NextResponse } from "next/server";
import {
  DEMO_PLAN_ID,
  demoStrategyPlan,
  demoStudentProfile,
} from "@/lib/demoData";

type Params = {
  params: {
    planId: string;
  };
};

export async function GET(_req: Request, { params }: Params) {
  if (params.planId === DEMO_PLAN_ID) {
    return NextResponse.json({
      plan: demoStrategyPlan,
      profile: demoStudentProfile,
    });
  }

  return NextResponse.json(
    {
      error: {
        code: "PLAN_NOT_FOUND",
        message:
          "Saved plan fetching is not wired yet. Open the demo or generate a local plan from onboarding.",
      },
    },
    { status: 404 },
  );
}
