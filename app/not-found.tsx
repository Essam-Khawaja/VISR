import { LinkButton } from "@/components/2/ui/Button";
import { demoPlanId } from "@/lib/shared/env";

export default function NotFound() {
  return (
    <main
      id="main"
      className="relative z-[1] flex min-h-screen items-center justify-center px-6"
    >
      <div className="w-full max-w-[520px] rounded-[28px] border border-border bg-surface/80 p-8 backdrop-blur-sm shadow-soft sm:p-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-tertiary">
          Pathwise · 404
        </p>
        <h1 className="mt-2 font-display text-4xl font-medium leading-tight tracking-tight text-primary sm:text-5xl">
          Off route.
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-secondary">
          That destination isn&rsquo;t on the map. Open the demo, start a new
          strategy, or jump back into today.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <LinkButton href="/2/onboarding">Start a new strategy</LinkButton>
          <LinkButton
            href={`/2/dashboard/${demoPlanId}`}
            variant="secondary"
          >
            View demo
          </LinkButton>
          <LinkButton href="/1" variant="ghost">
            Open today
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
