import Link from "next/link";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export default function OnboardingPage() {
  return (
    <main className="relative min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto flex w-full max-w-[640px] items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-secondary transition-colors hover:text-primary"
        >
          <span aria-hidden>&larr;</span>
          Pathwise
        </Link>
        <span className="text-[10px] uppercase tracking-widest text-secondary">
          Onboarding &middot; ~3 min
        </span>
      </div>
      <div className="mt-10">
        <OnboardingForm />
      </div>
    </main>
  );
}
