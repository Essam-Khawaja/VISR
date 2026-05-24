/**
 * Pathwise demo plan id. Kept here (in shared) to avoid pulling the heavier
 * Pathwise fixture into client bundles that only need the identifier.
 */
export const DEMO_PLAN_ID = "demo-cs-student-001";

/** Plan ID used by the "View demo" CTA on landing. */
export const demoPlanId =
  process.env.NEXT_PUBLIC_DEMO_PLAN_ID || DEMO_PLAN_ID;
