"use client";

import { motion } from "framer-motion";
import type { OrbitalNodeData } from "@/lib/2/orbitalMap";

export type { OrbitalNodeData };

type Props = {
  node: OrbitalNodeData;
  x: number;
  y: number;
  radius: number;
  onClick: () => void;
  isCenter?: boolean;
};

function wrapLabel(label: string, maxChars: number): string[] {
  const words = label.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function OrbitalNode({
  node,
  x,
  y,
  radius,
  onClick,
  isCenter = false,
}: Props) {
  const subGoalCount = node.subGoals.length;
  const maxChars = isCenter ? 13 : 10;
  const fontSize = isCenter ? 13 : 11;
  const lineHeight = isCenter ? 15 : 13;
  const lines = wrapLabel(node.label, maxChars);
  const blockHeight = lines.length * lineHeight;
  const textStartY = y - blockHeight / 2 + lineHeight / 2;

  return (
    <g onClick={onClick} className="cursor-pointer">
      <defs>
        <filter
          id={`shadow-${node.id}`}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.2" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <motion.circle
        cx={x}
        cy={y}
        r={radius + 12}
        fill={node.color}
        opacity="0.08"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.08 }}
        transition={{ duration: 0.4 }}
      />

      <motion.circle
        cx={x}
        cy={y}
        r={radius}
        fill={node.color}
        stroke={node.strokeColor}
        strokeWidth={node.strokeColor ? 2.5 : 0}
        filter={`url(#shadow-${node.id})`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      />

      <rect
        x={x - radius * 0.45}
        y={y + radius * 0.32}
        width={radius * 0.9}
        height={radius * 0.12}
        fill="white"
        opacity="0.25"
        rx="2"
      />

      <text
        textAnchor="middle"
        fill="white"
        className="pointer-events-none select-none"
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: 600,
          letterSpacing: "0.01em",
          fontFamily: "var(--font-nunito), Nunito, sans-serif",
        }}
      >
        {lines.map((line, i) => (
          <tspan key={i} x={x} y={textStartY + i * lineHeight}>
            {line}
          </tspan>
        ))}
      </text>

      {subGoalCount > 0 && !isCenter ? (
        <g>
          <circle
            cx={x + radius * 0.65}
            cy={y - radius * 0.65}
            r={9}
            fill="white"
          />
          <text
            x={x + radius * 0.65}
            y={y - radius * 0.65}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={node.strokeColor ?? node.color}
            className="pointer-events-none select-none"
            style={{
              fontSize: "10px",
              fontWeight: 700,
              fontFamily: "var(--font-nunito), Nunito, sans-serif",
            }}
          >
            {subGoalCount}
          </text>
        </g>
      ) : null}
    </g>
  );
}
