"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ease, letterReveal } from "@/lib/motion";
import { demoPlanId } from "@/lib/env";

const tagline = "You say the what.";
const taglineLine2 = "We tell you the how.";
const words = tagline.split(" ");
const wordsLine2 = taglineLine2.split(" ");

export function LandingHero() {
  const reduce = useReducedMotion();
  return (
    <main
      id="main"
      className="relative isolate flex min-h-screen flex-col overflow-hidden bg-base"
    >
      <BackgroundField />

      <header
        aria-label="Pathwise"
        className="relative z-[2] flex items-center justify-between px-6 pt-6 sm:px-10"
      >
        <Logo />
        <Badge tone="success" dot>
          Online
        </Badge>
      </header>

      <section className="relative z-[2] mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 shadow-soft"
        >
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
          />
          <span className="text-[11px] font-medium tracking-wide text-secondary">
            Strategy, not a to-do list
          </span>
        </motion.div>

        <h1 className="font-display font-semibold leading-[0.98] tracking-[-0.025em] text-primary">
          <span className="block text-[10vw] text-balance sm:text-[64px] lg:text-[88px]">
            {words.map((word, i) => (
              <span key={`${word}-${i}`} className="inline-block">
                <motion.span
                  variants={letterReveal}
                  initial={reduce ? false : "hidden"}
                  animate="show"
                  custom={i}
                  className="inline-block"
                >
                  {word}
                </motion.span>
                {i < words.length - 1 ? <span>&nbsp;</span> : null}
              </span>
            ))}
          </span>
          <span className="mt-1 block text-[10vw] text-tertiary sm:text-[64px] lg:text-[88px]">
            {wordsLine2.map((word, i) => (
              <span key={`l2-${word}-${i}`} className="inline-block">
                <motion.span
                  variants={letterReveal}
                  initial={reduce ? false : "hidden"}
                  animate="show"
                  custom={i + words.length}
                  className="inline-block"
                >
                  {word}
                </motion.span>
                {i < wordsLine2.length - 1 ? <span>&nbsp;</span> : null}
              </span>
            ))}
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.5 }}
          className="mt-10 max-w-xl text-balance text-[16px] leading-relaxed text-secondary"
        >
          Pathwise builds a map of your situation, names your single biggest
          bottleneck, and tells you exactly what to cut, defer, keep, or double
          down on. Not a to-do list. A route.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.7 }}
          className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
        >
          <LinkButton href="/onboarding" size="lg">
            Get my strategy
          </LinkButton>
          <LinkButton
            href={`/dashboard/${demoPlanId}`}
            variant="secondary"
            size="lg"
          >
            View demo strategy
          </LinkButton>
          <span className="text-[12px] text-tertiary sm:ml-2">
            ~3 min · No signup
          </span>
        </motion.div>
      </section>

      <FooterStrip />
    </main>
  );
}

function Logo() {
  return (
    <div
      role="img"
      aria-label="Pathwise"
      className="flex items-center gap-2.5"
    >
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
        <circle
          cx="11"
          cy="11"
          r="9.5"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeDasharray="2 4"
        />
        <circle cx="11" cy="11" r="3" fill="var(--accent)" />
      </svg>
      <span className="font-display text-[15px] font-semibold tracking-tight text-primary">
        Pathwise
      </span>
    </div>
  );
}

function FooterStrip() {
  return (
    <footer className="relative z-[2] flex items-center justify-between px-6 pb-6 text-[11px] text-tertiary sm:px-10">
      <span>v0.2 · Hackathon build</span>
      <span className="hidden sm:inline">Strategy &mdash; not execution</span>
    </footer>
  );
}

function BackgroundField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
      <div
        className="absolute left-1/2 top-1/3 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, var(--accent-soft) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}
