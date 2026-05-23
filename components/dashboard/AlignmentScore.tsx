"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type AlignmentScoreProps = {
  score: number;
};

export function AlignmentScore({ score }: AlignmentScoreProps) {
  const capped = Math.max(0, Math.min(100, Math.round(score)));
  const [n, setN] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
    let frame = 0;
    const step = () => {
      const t = Math.min(1, (performance.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(eased * capped));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    step();
    return () => cancelAnimationFrame(frame);
  }, [capped]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="inline-block shrink-0 font-display text-[clamp(96px,12vw,132px)] font-bold leading-none text-[color:var(--accent)] tracking-tighter"
      aria-label={`Alignment score ${capped} percent`}
    >
      {n}
      <span className="relative -top-[0.06em] text-[0.48em] text-[color:var(--text-secondary)]">%</span>
    </motion.span>
  );
}
