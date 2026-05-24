import { motion } from "motion/react";
import { OrbitalNode, NodeData } from "./OrbitalNode";

interface OrbitalMapProps {
  centerNode: NodeData;
  onNodeClick: (node: NodeData, angle: number) => void;
  currentPath: Array<{ node: NodeData; angle?: number }>;
  parentAngle?: number;
}

export function OrbitalMap({ centerNode, onNodeClick, currentPath, parentAngle }: OrbitalMapProps) {
  const width = 1100;
  const height = 850;
  const centerX = width / 2;
  const centerY = height / 2;

  const depth = currentPath.length - 1;
  const centerRadius = depth === 0 ? 70 : 55;
  const orbitRadius = depth === 0 ? 280 : 240;
  const branchRadius = depth === 0 ? 50 : 42;

  const branches = centerNode.subGoals;
  const angleStep = (2 * Math.PI) / branches.length;

  const baseAngle = parentAngle !== undefined ? parentAngle : -Math.PI / 2;
  const angleSpread = depth > 0 ? Math.PI * 1.2 : 2 * Math.PI;
  const startAngle = baseAngle - angleSpread / 2;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs>
        <filter id="connector-blur">
          <feGaussianBlur stdDeviation="1.5"/>
        </filter>
      </defs>

      <motion.circle
        cx={centerX}
        cy={centerY}
        r={orbitRadius}
        fill="none"
        stroke="#C5BFAF"
        strokeWidth="1.5"
        strokeDasharray="6 6"
        opacity="0.35"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.35, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {branches.map((branch, index) => {
        const localAngleStep = branches.length > 1 ? angleSpread / (branches.length - 1) : 0;
        const angle = depth === 0
          ? index * angleStep - Math.PI / 2
          : startAngle + index * localAngleStep;

        const x = centerX + orbitRadius * Math.cos(angle);
        const y = centerY + orbitRadius * Math.sin(angle);

        const midDistance = orbitRadius * 0.6;
        const perpAngle = angle + Math.PI / 2;
        const curveOffset = 60 * (index % 2 === 0 ? 1 : -1);
        const cx1 = centerX + (midDistance * 0.4) * Math.cos(angle) + curveOffset * Math.cos(perpAngle);
        const cy1 = centerY + (midDistance * 0.4) * Math.sin(angle) + curveOffset * Math.sin(perpAngle);
        const cx2 = centerX + (midDistance * 0.8) * Math.cos(angle) + curveOffset * 0.5 * Math.cos(perpAngle);
        const cy2 = centerY + (midDistance * 0.8) * Math.sin(angle) + curveOffset * 0.5 * Math.sin(perpAngle);

        return (
          <g key={branch.id}>
            <motion.path
              d={`M ${centerX} ${centerY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x} ${y}`}
              fill="none"
              stroke="#B0A89D"
              strokeWidth="2.5"
              opacity="0.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{
                pathLength: {
                  duration: 1.2,
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1]
                },
                opacity: {
                  duration: 0.6,
                  delay: index * 0.15
                }
              }}
            />
            <motion.circle
              cx={x}
              cy={y}
              r={branchRadius + 8}
              fill="none"
              stroke={branch.color}
              strokeWidth="2"
              opacity="0"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 0.3, 0] }}
              transition={{
                duration: 1,
                delay: 0.8 + index * 0.15,
                ease: "easeOut"
              }}
            />
            <OrbitalNode
              node={branch}
              x={x}
              y={y}
              radius={branchRadius}
              onClick={() => onNodeClick(branch, angle)}
            />
          </g>
        );
      })}

      <OrbitalNode
        node={centerNode}
        x={centerX}
        y={centerY}
        radius={centerRadius}
        onClick={() => {}}
        isCenter
      />
    </svg>
  );
}
