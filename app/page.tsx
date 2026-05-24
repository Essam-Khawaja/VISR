import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  Compass,
  Lightbulb,
  Sparkles,
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
          Stop organizing chaos.
          <br />
          <span className="bg-gradient-to-r from-amaranth via-thulian to-amaranth bg-clip-text italic text-transparent">
            Find the route.
          </span>
        </h1>
        <p className="mt-7 max-w-2xl text-[16px] leading-relaxed text-secondary sm:text-[17px]">
          Pathwise turns a messy student life into one connected workspace:
          the bottleneck, the strategy map, the tasks due today, and the
          tradeoffs behind every new opportunity.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/2/dashboard/${demoPlanId}`}
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
          >
            Open Strategy Map
            <ArrowUpRight className="size-4" strokeWidth={1.8} />
          </Link>
          <Link
            href="/1"
            className="rounded-full border border-border bg-white/70 px-5 py-2.5 text-sm font-semibold text-secondary transition-colors hover:border-border-strong hover:text-primary"
          >
            Today
          </Link>
        </div>
      </section>

      <section className="relative mx-auto mt-16 grid w-full max-w-6xl gap-4 sm:mt-20 md:grid-cols-4">
        <WorkspaceCard
          href="/1"
          title="Today"
          description="The dated strategy tasks, events, routines, and free-time blocks that matter now."
          icon={<Sparkles className="size-4" strokeWidth={1.7} />}
        />
        <WorkspaceCard
          href="/1/week"
          title="Week"
          description="Future strategy tasks land on the correct day beside your actual calendar."
          icon={<Calendar className="size-4" strokeWidth={1.7} />}
        />
        <WorkspaceCard
          href={`/2/dashboard/${demoPlanId}`}
          title="Strategy Map"
          description="Your destination, bottleneck, cut list, risks, and graph are in one dashboard."
          icon={<Compass className="size-4" strokeWidth={1.7} />}
        />
        <WorkspaceCard
          href={`/2/opportunity/${demoPlanId}`}
          title="Opportunities"
          description="Check whether a new commitment fits the strategy before saying yes."
          icon={<Lightbulb className="size-4" strokeWidth={1.7} />}
        />
      </section>

      <section className="relative mx-auto mt-6 grid w-full max-w-6xl gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <PreviewPanel
          href="/1"
          title="Today pulls from the map"
          body="Add a task to a goal or pillar, give it a due date, and it appears in Today and Week automatically."
        />
        <PreviewPanel
          href={`/2/dashboard/${demoPlanId}`}
          title="Demo-ready CS strategy"
          body="Software engineering internship, bottleneck identified, cut list visible, seven-day route ready."
        />
      </section>

      <div className="mt-24 sm:mt-28" />
    </>
  );
}

function WorkspaceCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-48 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface/80 p-5 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
        {icon}
      </div>
      <div>
        <h2 className="font-display text-2xl font-medium tracking-tight text-primary">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          {description}
        </p>
      </div>
      <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-accent-strong">
        Open
        <ArrowUpRight
          className="size-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={1.8}
        />
      </span>
    </Link>
  );
}

function PreviewPanel({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-white/65 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:bg-white/85 hover:shadow-soft"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-medium tracking-tight text-primary">
            {title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-secondary">
            {body}
          </p>
        </div>
        <span className="rounded-full border border-border bg-white px-3 py-1 text-[11px] font-semibold text-secondary">
          Connected
        </span>
      </div>
    </Link>
  );
}
