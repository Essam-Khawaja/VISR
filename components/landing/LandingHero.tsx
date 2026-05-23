"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LinkButton } from "@/components/ui/Button";
import { RouteLine } from "@/components/signature/RouteLine";
import { ease, letterReveal } from "@/lib/motion";
import { demoPlanId } from "@/lib/env";

const tagline = "You say the what. We tell you the how.";
const words = tagline.split(" ");

export function LandingHero() {
  const reduce = useReducedMotion();
  return (
    <main
      id="main"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <BackgroundField />

      <header
        aria-label="Pathwise"
        className="relative z-[2] flex items-center justify-between px-6 pt-6 sm:px-10"
      >
        <div className="flex items-center gap-3">
          <Logo />
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-secondary">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 animate-breathe rounded-full bg-success"
            style={{ boxShadow: "0 0 10px var(--success)" }}
          />
          System Online
        </div>
      </header>

      <section className="relative z-[2] mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-16 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="mb-10 max-w-xl"
        >
          <RouteLine
            waypoints={[
              { label: "Destination", value: "Goal", tone: "accent" },
              { label: "Stage", value: "Now" },
              { label: "Bottleneck", value: "Found", tone: "danger" },
              { label: "Route", value: "Clear", tone: "success" },
            ]}
          />
        </motion.div>

        <h1 className="font-display text-[12vw] font-semibold leading-[0.95] tracking-[-0.03em] text-primary sm:text-[80px] lg:text-[112px]">
          <span className="block text-balance">
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
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.5 }}
          className="mt-8 max-w-xl text-balance text-[15px] leading-relaxed text-secondary sm:text-base"
        >
          Pathwise builds a strategic map of your situation, names your single
          biggest bottleneck, and tells you what to cut, defer, keep, or double
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
          <span className="text-[10px] uppercase tracking-widest text-secondary sm:ml-2">
            ~3 min &middot; No signup
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
          strokeWidth="1.25"
          strokeDasharray="2 4"
        />
        <circle cx="11" cy="11" r="3" fill="var(--accent)" />
        <line
          x1="0"
          y1="11"
          x2="6"
          y2="11"
          stroke="var(--accent)"
          strokeWidth="1.25"
        />
        <line
          x1="16"
          y1="11"
          x2="22"
          y2="11"
          stroke="var(--accent)"
          strokeWidth="1.25"
        />
      </svg>
      <span className="font-display text-[15px] font-semibold tracking-[0.18em] text-primary">
        PATHWISE
      </span>
    </div>
  );
}

function FooterStrip() {
  return (
    <footer className="relative z-[2] flex items-center justify-between px-6 pb-6 text-[10px] uppercase tracking-widest text-secondary sm:px-10">
      <span>v0.1 · Hackathon build</span>
      <span className="hidden sm:inline">Strategy &mdash; not execution</span>
      <span className="tabular">N 51&deg; · W 114&deg;</span>
    </footer>
  );
}

function BackgroundField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full opacity-[0.08]"
      >
        <defs>
          <pattern
            id="grid"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 6 0 L 0 0 0 6"
              fill="none"
              stroke="var(--border)"
              strokeWidth="0.15"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
      </svg>
      <div
        className="absolute left-1/2 top-1/3 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, var(--accent-glow) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}
