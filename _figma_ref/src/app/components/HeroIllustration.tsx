import { motion } from "motion/react";

export function HeroIllustration() {
  const nodes = [
    { x: 400, y: 200, r: 28, color: "#933B5B", glow: "rgba(147, 59, 91, 0.4)" },
    { x: 600, y: 180, r: 24, color: "#B5728A", glow: "rgba(181, 114, 138, 0.4)" },
    { x: 350, y: 350, r: 20, color: "#AABAAE", glow: "rgba(170, 186, 174, 0.4)" },
    { x: 550, y: 320, r: 26, color: "#E3D6BF", glow: "rgba(227, 214, 191, 0.4)" },
    { x: 700, y: 280, r: 22, color: "#9F9679", glow: "rgba(159, 150, 121, 0.4)" },
    { x: 250, y: 250, r: 18, color: "#B5728A", glow: "rgba(181, 114, 138, 0.4)" },
    { x: 500, y: 240, r: 32, color: "#2C4F52", glow: "rgba(44, 79, 82, 0.5)" },
    { x: 450, y: 380, r: 16, color: "#933B5B", glow: "rgba(147, 59, 91, 0.4)" },
    { x: 650, y: 360, r: 20, color: "#AABAAE", glow: "rgba(170, 186, 174, 0.4)" },
    { x: 320, y: 300, r: 15, color: "#9F9679", glow: "rgba(159, 150, 121, 0.4)" },
  ];

  const connections = [
    { from: 6, to: 0 },
    { from: 6, to: 1 },
    { from: 6, to: 3 },
    { from: 0, to: 5 },
    { from: 0, to: 2 },
    { from: 1, to: 4 },
    { from: 3, to: 7 },
    { from: 3, to: 8 },
    { from: 2, to: 9 },
  ];

  return (
    <svg
      width="900"
      height="500"
      viewBox="0 0 900 500"
      className="w-full h-auto"
      style={{ filter: 'drop-shadow(0 20px 60px rgba(0, 0, 0, 0.3))' }}
    >
      <defs>
        {nodes.map((node, i) => (
          <filter key={`glow-${i}`} id={`node-glow-${i}`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        ))}
      </defs>

      {connections.map((conn, i) => {
        const from = nodes[conn.from];
        const to = nodes[conn.to];
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2 - 30;

        return (
          <motion.path
            key={`conn-${i}`}
            d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
            fill="none"
            stroke="rgba(200, 200, 220, 0.15)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { duration: 1.2, delay: i * 0.1, ease: "easeOut" },
              opacity: { duration: 0.5, delay: i * 0.1 }
            }}
          />
        );
      })}

      {nodes.map((node, i) => (
        <g key={`node-${i}`}>
          <motion.circle
            cx={node.x}
            cy={node.y}
            r={node.r + 15}
            fill={node.glow}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{
              duration: 0.6,
              delay: 0.3 + i * 0.08,
              type: "spring",
              stiffness: 200
            }}
          />
          <motion.circle
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill={node.color}
            filter={`url(#node-glow-${i})`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.3 + i * 0.08,
              type: "spring",
              stiffness: 200
            }}
          />
        </g>
      ))}
    </svg>
  );
}
