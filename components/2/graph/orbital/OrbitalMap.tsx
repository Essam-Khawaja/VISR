"use client";

import { motion } from "framer-motion";
import {
  branchConstellationPath,
  constellationPath,
  layoutGhostStars,
  rootGoalAnchor,
  starsAlongBranchPath,
  starsAlongQuadraticPath,
} from "./constellationLayout";
import { OrbitalNode, type OrbitalNodeData } from "./OrbitalNode";

type PathEntry = { node: OrbitalNodeData; angle?: number };

type Props = {
  centerNode: OrbitalNodeData;
  rootGoal: OrbitalNodeData;
  onNodeClick: (node: OrbitalNodeData, angle: number) => void;
  onCenterClick?: () => void;
  currentPath: PathEntry[];
  parentAngle?: number;
};

function ConstellationStar({
  x,
  y,
  color,
  r = 2.5,
  opacity = 0.55,
  delay = 0,
  hollow = false,
}: {
  x: number;
  y: number;
  color: string;
  r?: number;
  opacity?: number;
  delay?: number;
  hollow?: boolean;
}) {
  return (
    <g>
      {hollow ? (
        <motion.circle
          cx={x}
          cy={y}
          r={r + 1.5}
          fill="none"
          stroke={color}
          strokeWidth="1"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: opacity * 0.35, scale: 1 }}
          transition={{ duration: 0.5, delay }}
        />
      ) : null}
      <motion.circle
        cx={x}
        cy={y}
        r={r}
        fill={color}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity, scale: 1 }}
        transition={{ duration: 0.45, delay }}
      />
    </g>
  );
}

export function OrbitalMap({
  centerNode,
  rootGoal,
  onNodeClick,
  onCenterClick,
  currentPath,
  parentAngle,
}: Props) {
  const width = 1100;
  const height = 850;
  const centerX = width / 2;
  const centerY = height / 2;

  const depth = currentPath.length - 1;
  const isRoot = depth === 0;
  const isZoomed = depth > 0;
  const centerRadius = isRoot ? 70 : 55;
  const orbitRadius = isRoot ? 280 : 240;
  const branchRadius = isRoot ? 50 : 42;

  const drillInAngle =
    currentPath.length >= 2
      ? currentPath[1].angle
      : parentAngle;

  const rootAnchor = isZoomed
    ? rootGoalAnchor(centerX, centerY, drillInAngle, orbitRadius * 1.05)
    : null;

  const rootColor = rootGoal.color;
  const parentLinkOpacity = isZoomed ? 0.62 : 0.5;
  const parentLinkWidth = isZoomed ? 2.75 : 2.5;
  const childToRootOpacity = isZoomed ? 0.4 : 0.14;
  const childToRootWidth = isZoomed ? 2 : 1;

  const branches = centerNode.subGoals;
  const angleStep = branches.length > 0 ? (2 * Math.PI) / branches.length : 0;

  const baseAngle = parentAngle !== undefined ? parentAngle : -Math.PI / 2;
  const angleSpread = isZoomed ? Math.PI * 1.2 : 2 * Math.PI;
  const startAngle = baseAngle - angleSpread / 2;

  type BranchLayout = {
    branch: OrbitalNodeData;
    x: number;
    y: number;
    angle: number;
    index: number;
    ghostStars: ReturnType<typeof layoutGhostStars>;
    pathStars: ReturnType<typeof starsAlongBranchPath>;
    toRootStars: ReturnType<typeof starsAlongQuadraticPath>;
  };

  const branchLayouts: BranchLayout[] = branches.map((branch, index) => {
    const localAngleStep =
      branches.length > 1 ? angleSpread / (branches.length - 1) : 0;
    const angle = isRoot
      ? index * angleStep - Math.PI / 2
      : startAngle + index * localAngleStep;

    const x = centerX + orbitRadius * Math.cos(angle);
    const y = centerY + orbitRadius * Math.sin(angle);
    const curveOffset = 60 * (index % 2 === 0 ? 1 : -1);
    const childCount = branch.subGoals.length;

    const ghostStars =
      childCount > 0
        ? layoutGhostStars(x, y, centerX, centerY, childCount)
        : [];

    const pathStars = starsAlongBranchPath(
      centerX,
      centerY,
      x,
      y,
      angle,
      curveOffset,
      isZoomed ? 3 : childCount > 0 ? 2 : 1,
    );

    const toRootStars =
      isZoomed && rootAnchor
        ? starsAlongQuadraticPath(
            x,
            y,
            rootAnchor.x,
            rootAnchor.y,
            index % 2 === 0 ? 1 : -1,
            4,
          )
        : [];

    return {
      branch,
      x,
      y,
      angle,
      index,
      ghostStars,
      pathStars,
      toRootStars,
    };
  });

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      role="img"
      aria-label="Strategy orbital map"
    >
      <defs>
        <filter id="constellation-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
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

      {/* Zoomed: child → root goal (Software Engineering Internship) */}
      {isZoomed &&
        rootAnchor &&
        branchLayouts.map(({ branch, x, y, index }) => (
          <motion.path
            key={`to-root-${branch.id}`}
            d={constellationPath(
              x,
              y,
              rootAnchor.x,
              rootAnchor.y,
              index % 2 === 0 ? 1 : -1,
            )}
            fill="none"
            stroke={branch.strokeColor ?? branch.color}
            strokeWidth={childToRootWidth}
            opacity={childToRootOpacity}
            strokeLinecap="round"
            strokeDasharray={isZoomed ? "4 6" : "2 7"}
            filter="url(#constellation-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: childToRootOpacity }}
            transition={{
              pathLength: {
                duration: 1.1,
                delay: 0.2 + index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              },
              opacity: { duration: 0.5, delay: 0.2 + index * 0.08 },
            }}
          />
        ))}

      {/* Zoomed: star dots along child → root */}
      {isZoomed &&
        branchLayouts.map(({ branch, toRootStars, index }) =>
          toRootStars.map((star, starIndex) => (
            <ConstellationStar
              key={`to-root-star-${branch.id}-${starIndex}`}
              x={star.x}
              y={star.y}
              color={branch.strokeColor ?? branch.color}
              r={2.8}
              opacity={0.72}
              hollow={starIndex === 1}
              delay={0.35 + index * 0.07 + starIndex * 0.05}
            />
          )),
        )}

      {/* Zoomed: faint root goal anchor (main internship) */}
      {isZoomed && rootAnchor ? (
        <g>
          <motion.circle
            cx={rootAnchor.x}
            cy={rootAnchor.y}
            r={14}
            fill={rootColor}
            opacity="0.06"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
          />
          <ConstellationStar
            x={rootAnchor.x}
            y={rootAnchor.y}
            color={rootColor}
            r={4}
            opacity={0.5}
            hollow
            delay={0.15}
          />
        </g>
      ) : null}

      {/* Parent center → visible children */}
      {branchLayouts.map(({ branch, x, y, angle, index }) => {
        const curveOffset = 60 * (index % 2 === 0 ? 1 : -1);
        return (
          <motion.path
            key={`branch-link-${branch.id}`}
            d={branchConstellationPath(centerX, centerY, x, y, angle, curveOffset)}
            fill="none"
            stroke="#B0A89D"
            strokeWidth={parentLinkWidth}
            opacity={parentLinkOpacity}
            strokeLinecap="round"
            filter="url(#constellation-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: parentLinkOpacity }}
            transition={{
              pathLength: {
                duration: 1.2,
                delay: index * 0.12,
                ease: [0.22, 1, 0.36, 1],
              },
              opacity: { duration: 0.5, delay: index * 0.12 },
            }}
          />
        );
      })}

      {/* Stars along parent → child tether */}
      {branchLayouts.map(({ branch, pathStars, index }) =>
        pathStars.map((star, starIndex) => (
          <ConstellationStar
            key={`path-star-${branch.id}-${starIndex}`}
            x={star.x}
            y={star.y}
            color={isZoomed ? branch.strokeColor ?? branch.color : "#C5BFAF"}
            r={isZoomed ? 2.6 : 1.8}
            opacity={isZoomed ? 0.65 : 0.5}
            hollow={starIndex % 2 === 1}
            delay={0.2 + index * 0.1 + starIndex * 0.04}
          />
        )),
      )}

      {/* Root overview: faint goal → ghost hints */}
      {isRoot &&
        branchLayouts.map(({ branch, index, ghostStars }) =>
          ghostStars.map((star, starIndex) => (
            <motion.path
              key={`center-hint-${branch.id}-${starIndex}`}
              d={constellationPath(
                centerX,
                centerY,
                star.x,
                star.y,
                index % 2 === 0 ? 1 : -1,
              )}
              fill="none"
              stroke={branch.strokeColor ?? branch.color}
              strokeWidth="1"
              opacity="0.14"
              strokeLinecap="round"
              strokeDasharray="2 7"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.14 }}
              transition={{
                pathLength: {
                  duration: 1,
                  delay: 0.5 + index * 0.08 + starIndex * 0.05,
                },
                opacity: { duration: 0.4, delay: 0.5 + index * 0.08 },
              }}
            />
          )),
        )}

      {/* Ghost sprigs for hidden deeper children */}
      {branchLayouts.map(({ branch, x, y, index, ghostStars }) =>
        ghostStars.map((star, starIndex) => (
          <g key={`ghost-sprig-${branch.id}-${starIndex}`}>
            <motion.path
              d={constellationPath(
                x,
                y,
                star.x,
                star.y,
                starIndex % 2 === 0 ? 1 : -1,
              )}
              fill="none"
              stroke={branch.strokeColor ?? branch.color}
              strokeWidth={isZoomed ? 1.4 : 1.25}
              opacity={isZoomed ? 0.38 : 0.3}
              strokeLinecap="round"
              strokeDasharray="2 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: isZoomed ? 0.38 : 0.3 }}
              transition={{
                pathLength: {
                  duration: 0.7,
                  delay: 0.4 + index * 0.1 + starIndex * 0.06,
                },
                opacity: { duration: 0.35, delay: 0.4 + index * 0.1 },
              }}
            />
            <ConstellationStar
              x={star.x}
              y={star.y}
              color={branch.strokeColor ?? branch.color}
              r={2.2}
              opacity={isZoomed ? 0.5 : 0.45}
              delay={0.55 + index * 0.1 + starIndex * 0.06}
            />
          </g>
        )),
      )}

      {branchLayouts.map(({ branch, x, y, index }) => (
        <motion.circle
          key={`pulse-${branch.id}`}
          cx={x}
          cy={y}
          r={branchRadius + 8}
          fill="none"
          stroke={branch.strokeColor ?? branch.color}
          strokeWidth="2"
          opacity="0"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 0.3, 0] }}
          transition={{
            duration: 1,
            delay: 0.8 + index * 0.12,
            ease: "easeOut",
          }}
        />
      ))}

      {branchLayouts.map(({ branch, x, y, angle, index }) => (
        <OrbitalNode
          key={branch.id}
          node={branch}
          x={x}
          y={y}
          radius={branchRadius}
          onClick={() => onNodeClick(branch, angle)}
          animationDelay={index * 0.12}
        />
      ))}

      <OrbitalNode
        node={centerNode}
        x={centerX}
        y={centerY}
        radius={centerRadius}
        onClick={() => onCenterClick?.()}
        isCenter
      />
    </svg>
  );
}
