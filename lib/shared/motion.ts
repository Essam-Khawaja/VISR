/**
 * Framer Motion design tokens.
 *
 * Keeping easing curves, durations, and stagger values centralised lets the
 * UI feel cohesive: cards share entry timing, route lines draw at the same
 * pace, and reveal animations don't compete with each other.
 */
import type { Transition, Variants } from "framer-motion";

export const ease = [0.2, 0.8, 0.2, 1] as const;

export const stagger = {
  card: 0.04,
  brief: 0.06,
  letter: 0.025,
} as const;

export const dur = {
  card: 0.3,
  score: 1.2,
  gauge: 0.8,
  route: 0.4,
  step: 0.22,
  reveal: 0.6,
} as const;

export const cardEnter: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: dur.card,
      ease,
      delay: i * stagger.card,
    },
  }),
};

export const cardHover: Transition = {
  duration: 0.15,
  ease,
};

export const routeDraw: Transition = {
  duration: dur.route,
  ease,
};

export const letterReveal: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease,
      delay: i * stagger.letter,
    },
  }),
};
