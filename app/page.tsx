/**
 * app/page.tsx
 *
 * VISR landing page. Two CTAs:
 *   - "Build my route" -> /strategyweb/onboarding
 *   - "View demo"      -> /strategyweb/dashboard/{demoPlanId}
 *
 * Returning users with a saved active plan see "Open dashboard" and
 * "Re-onboard" instead. Honors `?demo` and `?onboard` query shortcuts so
 * deep links from older docs still resolve.
 */

"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Compass, RotateCcw, Sparkles } from "lucide-react";
import { clearActivePlanId, getActivePlanId } from "@/lib/strategyweb/planStore";
import { demoPlanId } from "@/lib/shared/env";

type PlanState = "loading" | "has-plan" | "no-plan";

function HomeLanding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [planState, setPlanState] = useState<PlanState>("loading");
  const [activePlanId, setActivePlanIdState] = useState<string | null>(null);

  useEffect(() => {
    // Preserve existing query-param shortcuts so deep links still work.
    if (searchParams.get("demo") !== null) {
      router.replace(`/strategyweb/dashboard/${demoPlanId}`);
      return;
    }
    if (searchParams.get("onboard") !== null) {
      router.replace("/strategyweb/onboarding");
      return;
    }

    const id = getActivePlanId();
    setActivePlanIdState(id);
    setPlanState(id ? "has-plan" : "no-plan");
  }, [router, searchParams]);

  const restartOnboarding = () => {
    clearActivePlanId();
    router.push("/strategyweb/onboarding");
  };

  if (planState === "loading") return <LoadingSplash />;

  const hasPlan = planState === "has-plan" && activePlanId;

  return (
    <div className="relative min-h-screen overflow-hidden bg-base">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 25% 20%, rgba(196, 137, 158, 0.18) 0%, transparent 55%), radial-gradient(circle at 80% 75%, rgba(160, 192, 178, 0.18) 0%, transparent 55%)",
        }}
      />
      <div className="relative z-[1] mx-auto flex min-h-screen w-full max-w-[1080px] flex-col items-center px-4 py-10 sm:px-6 sm:py-16 lg:py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/Logo.png"
            alt="VISR"
            width={72}
            height={72}
            priority
            className="h-16 w-16 rounded-2xl object-contain sm:h-[72px] sm:w-[72px]"
          />
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-tertiary">
            Visual Intelligence · Student Roadmapping
          </span>
          <h1 className="font-display text-[34px] font-semibold leading-tight text-primary sm:text-[44px]">
            VISR
          </h1>
          <p className="max-w-[42ch] text-[14px] leading-relaxed text-secondary sm:text-[15px]">
            Map your end-of-university outcome down to this week. VISR builds a
            living strategy map and a daily flowgram so you actually move on the
            things that matter.
          </p>
        </div>

        <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:mt-12 md:grid-cols-2">
          {hasPlan ? (
            <>
              <ActionCard
                accent="primary"
                icon={<Compass className="size-[18px]" strokeWidth={1.7} />}
                eyebrow="Continue"
                title="Open your strategy map"
                body="Pick up where you left off - same plan, latest tasks."
                ctaLabel="Open dashboard"
                href={`/strategyweb/dashboard/${activePlanId}`}
              />
              <ActionCard
                accent="muted"
                icon={<RotateCcw className="size-[18px]" strokeWidth={1.7} />}
                eyebrow="Start over"
                title="Re-onboard from scratch"
                body="Replace your current plan with a fresh map. Your saved plan stays in storage but a new one becomes active."
                ctaLabel="Restart onboarding"
                onClick={restartOnboarding}
              />
            </>
          ) : (
            <>
              <ActionCard
                accent="primary"
                icon={<Sparkles className="size-[18px]" strokeWidth={1.7} />}
                eyebrow="New plan"
                title="Build your strategy map"
                body="Walk through a six-step onboarding to map outcomes, courses, commitments, and weekly tasks."
                ctaLabel="Start onboarding"
                href="/strategyweb/onboarding"
              />
              <ActionCard
                accent="muted"
                icon={<Compass className="size-[18px]" strokeWidth={1.7} />}
                eyebrow="Preview"
                title="View the demo plan"
                body="See a fully populated strategy map and flowgram before you build your own."
                ctaLabel="Open demo"
                href={`/strategyweb/dashboard/${demoPlanId}`}
              />
            </>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-tertiary sm:mt-10">
          <Link
            href="/flowgram"
            className="flex items-center gap-1.5 text-secondary transition-colors hover:text-primary"
          >
            Open flowgram
            <ArrowRight className="size-[12px]" strokeWidth={1.8} />
          </Link>
          <Link
            href={`/strategyweb/dashboard/${demoPlanId}`}
            className="flex items-center gap-1.5 text-secondary transition-colors hover:text-primary"
          >
            View demo
            <ArrowRight className="size-[12px]" strokeWidth={1.8} />
          </Link>
          {hasPlan ? (
            <button
              type="button"
              onClick={restartOnboarding}
              className="flex items-center gap-1.5 text-secondary transition-colors hover:text-primary"
            >
              Re-onboard
              <ArrowRight className="size-[12px]" strokeWidth={1.8} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type ActionCardProps = {
  accent: "primary" | "muted";
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  href?: string;
  onClick?: () => void;
};

function ActionCard({
  accent,
  icon,
  eyebrow,
  title,
  body,
  ctaLabel,
  href,
  onClick,
}: ActionCardProps) {
  const isPrimary = accent === "primary";
  const cardClass =
    "group relative flex h-full flex-col gap-4 rounded-3xl border p-5 text-left shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lift sm:p-6 " +
    (isPrimary
      ? "border-accent/30 bg-accent-soft/60 hover:border-accent"
      : "border-border bg-surface/90 hover:border-border-strong");

  const iconClass =
    "flex h-10 w-10 items-center justify-center rounded-xl " +
    (isPrimary
      ? "bg-white/80 text-accent"
      : "bg-elevated text-secondary");

  const ctaClass =
    "mt-auto inline-flex items-center gap-1.5 self-start rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors " +
    (isPrimary
      ? "bg-accent text-white shadow-soft hover:bg-accent-strong"
      : "border border-border bg-white text-primary hover:border-border-strong");

  const inner = (
    <>
      <div className="flex items-center gap-3">
        <span className={iconClass} aria-hidden>
          {icon}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">
          {eyebrow}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-[20px] font-semibold leading-tight text-primary sm:text-[22px]">
          {title}
        </h2>
        <p className="text-[13.5px] leading-relaxed text-secondary">{body}</p>
      </div>
      <span className={ctaClass}>
        {ctaLabel}
        <ArrowRight className="size-[13px]" strokeWidth={2} />
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cardClass}>
      {inner}
    </button>
  );
}

function LoadingSplash() {
  return (
    <div className="flex h-screen items-center justify-center bg-base">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/Logo.png"
          alt="VISR"
          width={64}
          height={64}
          priority
          className="h-16 w-16 rounded-xl object-contain"
        />
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        <p className="text-sm text-secondary">Loading VISR…</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingSplash />}>
      <HomeLanding />
    </Suspense>
  );
}
