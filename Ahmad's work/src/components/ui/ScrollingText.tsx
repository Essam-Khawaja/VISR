"use client";

import { useEffect, useRef, useState } from "react";

type ScrollingTextProps = {
  text: string;
  className?: string;
};

export default function ScrollingText({ text, className = "" }: ScrollingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    const measure = measureRef.current;
    if (!el || !measure) return;

    const check = () => {
      setScroll(measure.scrollWidth > el.clientWidth + 1);
    };

    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  if (!scroll) {
    return (
      <div ref={containerRef} className={`min-w-0 overflow-hidden ${className}`}>
        <span ref={measureRef} className="block truncate">
          {text}
        </span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`min-w-0 overflow-hidden ${className}`}>
      <span ref={measureRef} className="sr-only">
        {text}
      </span>
      <div className="marquee-track flex w-max">
        <span className="marquee-item whitespace-nowrap pr-6">{text}</span>
        <span className="marquee-item whitespace-nowrap pr-6" aria-hidden="true">
          {text}
        </span>
      </div>
    </div>
  );
}
