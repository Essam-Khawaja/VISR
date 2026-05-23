import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-16 px-6 py-24">
      <div className="space-y-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
          Pathwise
        </p>
        <h1 className="max-w-xl font-display text-5xl leading-[1.05] text-[color:var(--text-primary)] sm:text-6xl">
          You say the what. We tell the how.
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-[color:var(--text-secondary)]">
          A strategic planning dashboard for ambitious students — the graph is the product, not another to-do app.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/dashboard/demo-cs-student-001"
          className="inline-flex items-center justify-center rounded-xl bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-[#061018] shadow-[0_18px_50px_-20px_var(--accent-glow)] transition hover:-translate-y-px"
        >
          Open demo dashboard
        </Link>
        <Link
          href="/opportunity/demo-cs-student-001"
          className="inline-flex items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-surface)] px-6 py-3 text-sm font-semibold text-[color:var(--text-primary)] backdrop-blur transition hover:border-[color:var(--accent)] hover:bg-[color:var(--bg-elevated)]"
        >
          Opportunity check sample
        </Link>
      </div>
      <footer className="border-t border-[color:var(--border)] pt-8 text-sm text-[color:var(--text-secondary)]">
        Hackathon MVP — judges route uses cached demo scenario (no AI).
      </footer>
    </main>
  );
}
