"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getActivePlanId } from "@/lib/2/planStore";
import { demoPlanId } from "@/lib/shared/env";

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (searchParams.get("demo") !== null) {
      router.replace(`/2/dashboard/${demoPlanId}`);
      return;
    }

    const activePlan = getActivePlanId();
    if (activePlan) {
      router.replace(`/2/dashboard/${activePlan}`);
    } else {
      router.replace("/2/onboarding");
    }
    setChecking(false);
  }, [router, searchParams]);

  if (!checking) return null;

  return (
    <div className="flex h-screen items-center justify-center bg-base">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        <p className="text-sm text-secondary">Loading Pathwise…</p>
      </div>
    </div>
  );
}
