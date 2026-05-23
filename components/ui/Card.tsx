"use client";

import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

export function Card({ children }: PropsWithChildren) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-surface)]/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur transition-colors hover:bg-[color:var(--bg-elevated)]"
    >
      {children}
    </motion.div>
  );
}
