"use client";

import { useEffect, useRef } from "react";

/**
 * Renders a fixed-position gradient layer behind the app whose colors
 * follow the cursor. Updates CSS custom properties on the layer in an
 * rAF loop so we never thrash React or layout.
 *
 * Respects prefers-reduced-motion (renders a static center gradient).
 */
export function LiquidCursor() {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef({ x: 0.5, y: 0.3 });
  const currentRef = useRef({ x: 0.5, y: 0.3 });
  const rafRef = useRef<number | null>(null);
  const isReducedRef = useRef(false);

  useEffect(() => {
    isReducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function onMove(e: PointerEvent) {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      targetRef.current.x = e.clientX / w;
      targetRef.current.y = e.clientY / h;
    }

    function loop() {
      const layer = layerRef.current;
      if (!layer) {
        rafRef.current = window.requestAnimationFrame(loop);
        return;
      }
      // Ease toward target for a liquid feel.
      const ease = isReducedRef.current ? 1 : 0.07;
      currentRef.current.x +=
        (targetRef.current.x - currentRef.current.x) * ease;
      currentRef.current.y +=
        (targetRef.current.y - currentRef.current.y) * ease;
      layer.style.setProperty(
        "--cursor-x",
        `${(currentRef.current.x * 100).toFixed(2)}%`,
      );
      layer.style.setProperty(
        "--cursor-y",
        `${(currentRef.current.y * 100).toFixed(2)}%`,
      );
      rafRef.current = window.requestAnimationFrame(loop);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    rafRef.current = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <div ref={layerRef} className="liquid-layer" aria-hidden />;
}
