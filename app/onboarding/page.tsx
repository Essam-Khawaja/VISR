import Link from "next/link";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";

export default function OnboardingPage() {
  return (
    <main id="main" className="relative h-[100dvh] overflow-hidden bg-base">
      <div className="absolute left-4 top-4 z-30 flex items-center justify-between gap-4 sm:left-6 sm:top-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/90 px-3 py-1.5 text-[12px] text-secondary shadow-soft backdrop-blur-sm transition-colors hover:border-border-strong hover:text-primary"
        >
          <span aria-hidden>&#8592;</span>
          Pathwise
        </Link>
        <span className="text-[12px] text-tertiary">~3 min &middot; No signup</span>
      </div>
      <OnboardingShell />
    </main>
  );
}
