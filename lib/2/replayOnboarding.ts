import { createSupabaseAnonClient } from "@/lib/shared/supabase";
import { clearNodesLocal } from "@/lib/2/nodeStore";
import { clearActivePlanId, deletePlan } from "@/lib/2/planStore";
import { clearTasksLocal } from "@/lib/2/taskStore";

export const ONBOARDING_DRAFT_KEY = "pathwise-onboarding-draft-v3";

function isDemoOrPreview(planId: string): boolean {
  return planId.startsWith("demo-") || planId === "onboarding-preview";
}

async function clearPlanGraphRemote(planId: string): Promise<void> {
  if (isDemoOrPreview(planId)) return;
  const sb = createSupabaseAnonClient();
  if (!sb) return;
  try {
    await sb.from("strategy_tasks").delete().eq("plan_id", planId);
    await sb.from("strategy_nodes").delete().eq("plan_id", planId);
    await sb.from("strategy_plans").delete().eq("id", planId);
  } catch {
    /* best effort */
  }
}

/** Wipes local + remote plan graph so onboarding can run fresh (demo reset). */
export async function resetPlanForReplay(planId: string): Promise<void> {
  if (typeof window === "undefined") return;

  deletePlan(planId);
  clearNodesLocal(planId);
  clearTasksLocal(planId);
  clearActivePlanId();
  sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);
  await clearPlanGraphRemote(planId);
}
