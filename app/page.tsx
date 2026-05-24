import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  Compass,
  GitBranch,
  Lightbulb,
  Sparkles,
  StickyNote,
} from "lucide-react";
import { demoPlanId } from "@/lib/shared/env";
import { AppShell } from "@/components/shared/AppShell";

export default function HomePage() {
  return (
    <AppShell>
      <main
        id="main"
        className="relative z-[1] min-h-screen overflow-hidden px-6 py-12 sm:py-16 lg:py-20"
      >
        <HomeBody />
      </main>
    </AppShell>
  );
}

function HomeBody() {
  return (
    <>
      <section className="relative mx-auto mt-10 flex w-full max-w-4xl flex-col items-center text-center sm:mt-16">
        <h1 className="font-display text-[44px] font-medium leading-[1.04] tracking-tight text-primary text-balance sm:text-[68px] lg:text-[84px]">
          One home for two ways
          <br />
          <span className="bg-gradient-to-r from-amaranth via-thulian to-amaranth bg-clip-text italic text-transparent">
            to plan your week.
          </span>
        </h1>
        <p className="mt-7 max-w-2xl text-[16px] leading-relaxed text-secondary sm:text-[17px]">
          Some weeks you need a calm map of today. Some weeks you need a
          ruthless strategist asking what to cut. Pathwise is both, in one
          place.
        </p>
      </section>

      <section className="relative mx-auto mt-16 grid w-full max-w-6xl gap-6 sm:mt-20 md:grid-cols-2">
        <PerspectiveCard
          href="/1"
          eyebrow="Perspective 1"
          title="StraighterNoodles"
          subtitle="Daily flow"
          description="A calm vertical timeline for today. Packing list, weather-aware reminders, free-time finder, routines, voice briefing. Built for chaotic mornings."
          accent="var(--amaranth)"
          gradient="linear-gradient(135deg, rgba(147,59,91,0.10) 0%, rgba(181,114,138,0.08) 60%, transparent 100%)"
          features={[
            { icon: <Sparkles className="size-3.5" strokeWidth={1.7} />, label: "Today's Flowgram" },
            { icon: <Calendar className="size-3.5" strokeWidth={1.7} />, label: "Week View" },
            { icon: <StickyNote className="size-3.5" strokeWidth={1.7} />, label: "Notes Hub" },
          ]}
        />
        <PerspectiveCard
          href={`/2/dashboard/${demoPlanId}`}
          eyebrow="Perspective 2"
          title="Pathwise Strategy"
          subtitle="Big picture"
          description="A strategy dashboard that names your bottleneck, builds a strategy map, recommends what to cut or defer, and evaluates new opportunities against your real plan."
          accent="var(--sage)"
          gradient="linear-gradient(135deg, rgba(138,154,91,0.12) 0%, rgba(170,186,174,0.10) 60%, transparent 100%)"
          features={[
            { icon: <Compass className="size-3.5" strokeWidth={1.7} />, label: "Strategy Web" },
            { icon: <GitBranch className="size-3.5" strokeWidth={1.7} />, label: "Assessments" },
            { icon: <Lightbulb className="size-3.5" strokeWidth={1.7} />, label: "Opportunity Validation" },
          ]}
        />
      </section>

      <div className="mt-24 sm:mt-28" />
    </>
  );
}

type Feature = { icon: React.ReactNode; label: string };

function PerspectiveCard({
  href,
  eyebrow,
  title,
  subtitle,
  description,
  accent,
  gradient,
  features,
}: {
  href: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  gradient: string;
  features: Feature[];
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-7 overflow-hidden rounded-[28px] border border-border bg-surface/70 p-7 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-90 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: gradient }}
      />
      <div
        aria-hidden
        className="absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-70 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: gradient }}
      />

      <div className="relative flex items-center justify-between">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: accent }}
        >
          {eyebrow}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-white/70 px-2.5 py-1 text-[11px] font-medium text-secondary transition-all duration-300 group-hover:border-border-strong group-hover:text-primary">
          Open
          <ArrowUpRight
            className="size-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={1.8}
          />
        </span>
      </div>

      <div className="relative">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-tertiary">
          {subtitle}
        </p>
        <h2 className="mt-2 font-display text-[36px] font-medium leading-[1.05] tracking-tight text-primary sm:text-[40px]">
          {title}
        </h2>
      </div>

      <p className="relative text-[14px] leading-relaxed text-secondary">
        {description}
      </p>

      <div className="relative flex flex-wrap gap-2">
        {features.map((f) => (
          <span
            key={f.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/60 px-3 py-1 text-[12px] font-medium text-secondary backdrop-blur-sm"
          >
            <span style={{ color: accent }} className="flex">
              {f.icon}
            </span>
            {f.label}
          </span>
        ))}
      </div>
    </Link>
  );
}

