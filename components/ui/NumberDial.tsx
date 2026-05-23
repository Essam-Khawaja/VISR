"use client";

import {
  animate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

type Props = {
  to: number;
  duration?: number;
  className?: string;
  /** Decimal places. */
  precision?: number;
  /** Append a suffix like "%". */
  suffix?: string;
  /** Pad integer portion with leading zeros to this many digits. */
  pad?: number;
  /** Trigger the animation. Defaults to true. */
  play?: boolean;
};

function formatNumber(value: number, precision: number, pad: number): string {
  const fixed = value.toFixed(precision);
  if (!pad) return fixed;
  const [intPart, decPart] = fixed.split(".");
  const padded = intPart.padStart(pad, "0");
  return decPart ? `${padded}.${decPart}` : padded;
}

export function NumberDial({
  to,
  duration = 1.2,
  className,
  precision = 0,
  suffix,
  pad = 0,
  play = true,
}: Props) {
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(reduce ? to : 0);
  const rounded = useTransform(motionValue, (v) =>
    formatNumber(v, precision, pad),
  );
  const [display, setDisplay] = useState<string>(() =>
    formatNumber(reduce ? to : 0, precision, pad),
  );

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return () => unsubscribe();
  }, [rounded]);

  useEffect(() => {
    if (!play) return;
    if (reduce) {
      motionValue.set(to);
      return;
    }
    const controls = animate(motionValue, to, {
      duration,
      ease,
    });
    return () => controls.stop();
  }, [to, duration, play, reduce, motionValue]);

  return (
    <span className={cn("tabular", className)}>
      {display}
      {suffix}
    </span>
  );
}
