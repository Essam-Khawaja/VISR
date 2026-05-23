import { LinkButton } from "@/components/ui/Button";
import { demoPlanId } from "@/lib/env";

export default function NotFound() {
  return (
    <main
      id="main"
      className="relative flex min-h-screen items-center justify-center bg-base px-6"
    >
      <div className="w-full max-w-[520px] rounded-3xl border border-border bg-surface p-8 shadow-card sm:p-10">
        <p className="text-[11px] font-medium text-tertiary">Pathwise · 404</p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight text-primary sm:text-5xl">
          Off route.
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-secondary">
          That destination isn&rsquo;t on the map. Start a new strategy, or
          jump into the demo to see what Pathwise looks like in action.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <LinkButton href="/onboarding">Start a new strategy</LinkButton>
          <LinkButton href={`/dashboard/${demoPlanId}`} variant="secondary">
            View demo
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
