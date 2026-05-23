import Link from "next/link";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export default function OnboardingPage() {
  return (
    <main id="main" className="relative min-h-screen bg-base px-6 py-10 sm:px-10">
      <div className="mx-auto flex w-full max-w-[640px] items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] text-secondary shadow-soft transition-colors hover:border-border-strong hover:text-primary"
        >
          <span aria-hidden>←</span>
          Pathwise
        </Link>
        <span className="text-[12px] text-tertiary">~3 min · No signup</span>
      </div>
      <div className="mt-10">
        <OnboardingForm />
      </div>
    </main>
  );
}
