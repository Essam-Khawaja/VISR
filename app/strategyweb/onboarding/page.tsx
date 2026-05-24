/**
 * app/strategyweb/onboarding/page.tsx
 *
 * Entry point for the strategy onboarding flow. Delegates everything to
 * `OnboardingShell` which owns the multi-step form, the live map preview,
 * and the redirect to the dashboard once a plan is generated.
 */

import { OnboardingShell } from "@/components/strategyweb/onboarding/OnboardingShell";

export default function OnboardingPage() {
  return (
    <div className="relative z-[1] min-h-[100dvh] overflow-hidden">
      <OnboardingShell />
    </div>
  );
}
