import { LinkButton } from "@/components/ui/Button";
import { Reticle } from "@/components/signature/Reticle";
import { demoPlanId } from "@/lib/env";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-6">
      <div className="relative flex w-full max-w-[520px] flex-col items-start gap-6">
        <Reticle
          className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30"
          size={420}
          color="var(--border)"
        />
        <p className="relative text-[10px] uppercase tracking-widest text-secondary">
          Pathwise &middot; 404
        </p>
        <h1 className="relative font-display text-5xl font-semibold leading-tight tracking-[-0.02em] text-primary">
          Off route.
        </h1>
        <p className="relative max-w-md text-[15px] leading-relaxed text-secondary">
          That destination isn&rsquo;t on the map. Start a new strategy, or
          jump into the demo to see what Pathwise looks like in action.
        </p>
        <div className="relative mt-2 flex flex-wrap items-center gap-3">
          <LinkButton href="/onboarding">Start a new strategy</LinkButton>
          <LinkButton href={`/dashboard/${demoPlanId}`} variant="secondary">
            View demo
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
