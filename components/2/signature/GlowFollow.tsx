"use client";

import { useEffect, useRef } from "react";

type Props = {
  size?: number;
  className?: string;
};

/**
 * Soft radial glow that follows the cursor with an 80ms lag.
 * Disabled on touch devices and under prefers-reduced-motion.
 */
export function GlowFollow({ size = 420, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reduce) return;

    const node = ref.current;
    if (!node) return;

    target.current.x = window.innerWidth / 2;
    target.current.y = window.innerHeight / 3;
    current.current = { ...target.current };

    const onMove = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.12;
      current.current.y += (target.current.y - current.current.y) * 0.12;
      node.style.transform = `translate3d(${current.current.x - size / 2}px, ${
        current.current.y - size / 2
      }px, 0)`;
      rafRef.current = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [size]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none fixed left-0 top-0 z-0 hidden mix-blend-screen md:block ${
        className ?? ""
      }`}
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at center, var(--accent-glow) 0%, transparent 65%)",
        willChange: "transform",
        opacity: 0.55,
      }}
    />
  );
}
