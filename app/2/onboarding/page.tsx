import { OnboardingShell } from "@/components/2/onboarding/OnboardingShell";

export default function OnboardingPage() {
  return (
    <div className="relative z-[1] min-h-[100dvh] overflow-hidden">
      <div className="absolute right-4 top-4 z-30 sm:right-6 sm:top-6">
        <span className="text-[12px] text-tertiary">~3 min · No signup</span>
      </div>
      <OnboardingShell />
    </div>
  );
}
