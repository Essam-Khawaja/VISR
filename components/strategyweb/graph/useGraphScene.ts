"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { cssVar, hexToThreeColor } from "@/lib/shared/cssColor";
import {
  CAMERA_END_Z,
  CAMERA_MAX_Z,
  CAMERA_MIN_Z,
  CAMERA_START_Z,
  HOVER_SCALE,
} from "./graphAnimations";
import { createEdgeRender, type EdgeRender } from "./graphEdges";
import { buildGraphLayout, graphRadii } from "./graphLayout";
import { createNodeMesh, type NodeMesh } from "./graphNodes";
import type {
  GraphLayoutResult,
  GraphNodeData,
  GraphSelection,
  LayoutNode,
} from "./graphTypes";
import type { StrategicPillar } from "@/lib/strategyweb/types";
import type { ActionState } from "@/lib/strategyweb/planStore";
import type { NodeRollup } from "@/lib/strategyweb/taskStore";

export type { ActionState };

export type HoverState = {
  node: GraphNodeData;
  x: number;
  y: number;
} | null;

type Props = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  labelsRef: React.RefObject<HTMLDivElement | null>;
  pillars: StrategicPillar[];
  destination: string;
  mainBottleneck: string;
  actionStates?: Record<string, ActionState>;
  rollups?: Record<string, NodeRollup>;
  isReadOnly?: boolean;
  /**
   * When true (default = isReadOnly), the camera is centered and orbit/zoom
   * are disabled. Set to false to keep clicks read-only but still allow the
   * user to pan/zoom the canvas (used during onboarding).
   */
  lockCamera?: boolean;
  showAllNodes?: boolean;
  layoutOverride?: {
    nodes: import("./graphTypes").LayoutNode[];
    edges: import("./graphTypes").LayoutEdge[];
  };
};

const FOCUS_CAMERA_Z = 6.2;
const FOCUS_CAMERA_LEAN = 0.35;
const LERP_FACTOR = 0.14;
const CAM_LERP_FACTOR = 0.085;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function darkenHex(hex: string, amount = 0.24): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return "rgba(0,0,0,0.35)";
  const r = Math.max(0, Math.round(((n >> 16) & 255) * (1 - amount)));
  const g = Math.max(0, Math.round(((n >> 8) & 255) * (1 - amount)));
  const b = Math.max(0, Math.round((n & 255) * (1 - amount)));
  return `rgb(${r}, ${g}, ${b})`;
}

function labelSize(name: string, kind: GraphNodeData["kind"]) {
  const length = name.length;
  if (kind === "goal") {
    const diameter = Math.min(220, Math.max(132, length * 7));
    return { width: diameter, height: diameter };
  }
  if (kind === "pillar") {
    const diameter = Math.min(190, Math.max(114, length * 6));
    return { width: diameter, height: diameter };
  }
  const diameter = Math.min(172, Math.max(94, length * 5.5));
  return { width: diameter, height: diameter };
}

function nodeLabelHtml(node: LayoutNode): string {
  const progress = Math.max(0, Math.min(1, node.progressPercent ?? 0));
  const count = node.actionCount ?? 0;
  const fill = node.pastelColor ?? node.color;
  const ring = darkenHex(fill);
  const { width, height } = labelSize(node.name, node.kind);
  const fontSize = node.kind === "goal" ? 13 : node.kind === "pillar" ? 11 : 9;
  const circumference = 2 * Math.PI * 46;
  const countBadge =
    count > 0
      ? `<span style="position:absolute;top:-6px;right:-6px;background:#ffffff;color:#182235;font-size:9px;font-weight:800;min-width:17px;height:17px;padding:0 4px;border-radius:999px;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 14px rgba(24,34,53,0.15)">${count}</span>`
      : "";
  return `
    <span style="position:relative;width:${width}px;height:${height}px;border-radius:999px;background:${fill};box-shadow:0 18px 36px rgba(24,34,53,0.16);display:flex;align-items:center;justify-content:center;padding:14px;color:#fff;text-align:center;font-size:${fontSize}px;font-weight:800;line-height:1.15;white-space:normal;overflow-wrap:anywhere;text-shadow:0 1px 2px rgba(0,0,0,0.25)">
      ${countBadge}
      <svg aria-hidden="true" viewBox="0 0 100 100" style="position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)">
        <circle cx="50" cy="50" r="46" fill="none" stroke="${ring}" stroke-opacity="0.18" stroke-width="7" />
        <circle cx="50" cy="50" r="46" fill="none" stroke="${ring}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${progress * circumference} ${circumference}" />
      </svg>
      <span style="position:relative;z-index:1;max-width:${Math.max(48, width - 36)}px">${escapeHtml(node.name)}</span>
    </span>`;
}

function applyLabelSpacing(layout: Pick<GraphLayoutResult, "nodes" | "edges">) {
  const byId = new Map(layout.nodes.map((node) => [node.id, node]));
  layout.nodes.forEach((node) => {
    if (node.kind === "goal") return;
    const { width } = labelSize(node.name, node.kind);
    const pressure = Math.max(0, width - (node.kind === "pillar" ? 122 : 96));
    const scale = 1 + Math.min(0.28, pressure / 360);
    node.position = [
      node.position[0] * scale,
      node.position[1] * scale,
      node.position[2],
    ];
  });
  layout.edges.forEach((edge) => {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (from && to) edge.points = [from.position, to.position];
  });
}

export function useGraphScene({
  containerRef,
  labelsRef,
  pillars,
  destination,
  mainBottleneck,
  actionStates,
  rollups,
  isReadOnly = false,
  lockCamera,
  showAllNodes = false,
  layoutOverride,
}: Props) {
  const [hover, setHoverState] = useState<HoverState>(null);
  const [selection, setSelectionState] = useState<GraphSelection>(null);

  const selectionRef = useRef<GraphSelection>(null);
  const hoveredIdRef = useRef<string | null>(null);
  const bottleneckIdRef = useRef<string | null>(null);
  const actionStatesRef = useRef<Record<string, ActionState>>({});
  const rollupsRef = useRef<Record<string, NodeRollup>>({});
  const nodeMeshesRef = useRef<NodeMesh[]>([]);

  actionStatesRef.current = actionStates ?? {};
  rollupsRef.current = rollups ?? {};

  const select = useCallback((sel: GraphSelection) => {
    selectionRef.current = sel;
    setSelectionState(sel);
  }, []);

  const clearSelection = useCallback(() => {
    selectionRef.current = null;
    setSelectionState(null);
  }, []);

  const selectBottleneck = useCallback(() => {
    const id = bottleneckIdRef.current;
    if (!id) return;
    selectionRef.current = { kind: "pillar", nodeId: id };
    setSelectionState({ kind: "pillar", nodeId: id });
  }, []);

  useEffect(() => {
    const mutedHex = hexToThreeColor(cssVar("--muted", "#A8A095"));
    const successHex = hexToThreeColor(cssVar("--success", "#7D9B7A"));
    nodeMeshesRef.current.forEach((nm) => {
      if (nm.data.kind !== "action") return;
      const state =
        rollupsRef.current[nm.data.id]?.derivedStatus ??
        actionStatesRef.current[nm.data.id];
      const coreMat = nm.core.material as THREE.MeshBasicMaterial;
      const haloMat = nm.halo.material as THREE.SpriteMaterial;
      if (state === "done") {
        coreMat.color.setHex(successHex);
        haloMat.color.setHex(successHex);
      } else if (state === "skipped") {
        coreMat.color.setHex(mutedHex);
        haloMat.color.setHex(mutedHex);
      }
    });
  }, [actionStates, rollups]);

  useEffect(() => {
    const container = containerRef.current;
    const labelsContainer = labelsRef.current;
    if (!container) return;

    const isNucleusLayout = !!layoutOverride;
    if (isNucleusLayout || isReadOnly) {
      selectionRef.current = null;
      setSelectionState(null);
    }
    const layout = layoutOverride
      ? { ...layoutOverride, destination, bottleneckPillarId: null }
      : buildGraphLayout(pillars, destination, mainBottleneck);
    bottleneckIdRef.current = layout.bottleneckPillarId;

    // Compute progress from canonical strategy tasks first, then legacy action states.
    layout.nodes.forEach((n) => {
      const rollup = rollupsRef.current[n.id];
      if (rollup && rollup.childCount > 0) {
        n.progressPercent = rollup.completionRatio;
        n.actionCount = rollup.childCount;
        return;
      }
      if (n.kind === "pillar") {
        const pillar = pillars.find((p) => p.id === n.id);
        if (pillar) {
          const done = pillar.actions.filter(
            (a) => actionStatesRef.current[a.id] === "done",
          ).length;
          n.progressPercent =
            pillar.actions.length > 0 ? done / pillar.actions.length : 0;
          n.actionCount = pillar.actions.length;
        }
      }
    });

    // Set edge progress from parent pillar
    layout.edges.forEach((e) => {
      if (e.kind === "goal-pillar") {
        const pillarNode = layout.nodes.find((n) => n.id === e.parentPillarId);
        e.progressPercent = pillarNode?.progressPercent ?? 0;
      }
    });
    if (!isNucleusLayout) {
      applyLabelSpacing(layout);
    }

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const root = new THREE.Group();
    root.position.set(0, 0, 0);
    scene.add(root);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const onboardingPan = isReadOnly && lockCamera === false;
    const startZ =
      showAllNodes || onboardingPan ? CAMERA_END_Z : CAMERA_START_Z;
    camera.position.set(0, 0, startZ);
    camera.lookAt(0, 0, 0);

    // lockCamera defaults to isReadOnly so existing call sites still freeze
    // preview cards. When a caller explicitly passes lockCamera={false} (e.g.
    // onboarding), allow pan/zoom even when clicks are read-only.
    const lockCameraCenter = lockCamera ?? isReadOnly;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    const canvas = renderer.domElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.touchAction = "none";
    // When the camera is unlocked we need pointer events on the canvas so the
    // user can still drag to pan even if click handlers are read-only.
    const canvasReceivesPointer = !(lockCamera ?? isReadOnly);
    canvas.style.pointerEvents = canvasReceivesPointer ? "auto" : "none";

    // Orbit ring
    const orbitSegments = 128;
    const orbitPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= orbitSegments; i++) {
      const theta = (i / orbitSegments) * Math.PI * 2;
      orbitPoints.push(
        new THREE.Vector3(
          Math.cos(theta) * graphRadii.PILLAR_RADIUS,
          Math.sin(theta) * graphRadii.PILLAR_RADIUS,
          0,
        ),
      );
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMat = new THREE.LineDashedMaterial({
      color: hexToThreeColor(cssVar("--border", "#D4CCC0")),
      dashSize: 0.2,
      gapSize: 0.15,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    orbitLine.computeLineDistances();
    root.add(orbitLine);

    const edges: EdgeRender[] = layout.edges.map((e) => createEdgeRender(e));
    edges.forEach((er) => {
      root.add(er.dashLine);
      root.add(er.fillLine);
    });

    const nodeMeshes: NodeMesh[] = layout.nodes.map((n) => createNodeMesh(n));
    nodeMeshes.forEach((nm) => root.add(nm.group));
    nodeMeshesRef.current = nodeMeshes;

    const mutedHex = hexToThreeColor(cssVar("--muted", "#A8A095"));
    const successHex = hexToThreeColor(cssVar("--success", "#7D9B7A"));
    nodeMeshes.forEach((nm) => {
      if (nm.data.kind !== "action") return;
      const state =
        rollupsRef.current[nm.data.id]?.derivedStatus ??
        actionStatesRef.current[nm.data.id];
      const coreMat = nm.core.material as THREE.MeshBasicMaterial;
      const haloMat = nm.halo.material as THREE.SpriteMaterial;
      if (state === "done") {
        coreMat.color.setHex(successHex);
        haloMat.color.setHex(successHex);
      } else if (state === "skipped") {
        coreMat.color.setHex(mutedHex);
        haloMat.color.setHex(mutedHex);
      }
    });

    const bottleneckMeshes = nodeMeshes.filter((n) => n.data.isBottleneck);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    type Label = { el: HTMLButtonElement; node: NodeMesh };
    const labels: Label[] = [];
    if (labelsContainer) {
      labelsContainer.innerHTML = "";
      nodeMeshes.forEach((nm) => {
        const el = document.createElement("button");
        el.type = "button";
        el.style.willChange = "transform, opacity";
        el.style.transform = "translate(-9999px,-9999px)";
        el.style.position = "absolute";
        el.style.textAlign = "center";
        el.style.pointerEvents = isReadOnly ? "none" : "auto";
        el.style.userSelect = "none";
        el.style.border = "0";
        el.style.padding = "0";
        el.style.background = "transparent";
        el.style.cursor = isReadOnly ? "default" : "pointer";
        el.setAttribute("aria-label", nm.data.name);

        el.innerHTML = nodeLabelHtml(nm.data);
        el.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (isReadOnly) return;
          if (nm.data.kind === "goal" && !layoutOverride) {
            selectionRef.current = null;
            setSelectionState(null);
          } else if (nm.data.kind === "goal" || nm.data.kind === "pillar") {
            const next: GraphSelection = {
              kind: "pillar",
              nodeId: nm.data.id,
            };
            selectionRef.current = next;
            setSelectionState(next);
          } else {
            const next: GraphSelection = {
              kind: "action",
              nodeId: nm.data.id,
            };
            selectionRef.current = next;
            setSelectionState(next);
          }
          updateCameraTargetFromSelection();
        });
        el.addEventListener("pointerenter", () => {
          if (isReadOnly) return;
          hoveredIdRef.current = nm.data.id;
          const rect = el.getBoundingClientRect();
          setHoverState({
            node: nm.data,
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          });
        });
        el.addEventListener("pointerleave", () => {
          if (hoveredIdRef.current === nm.data.id) {
            hoveredIdRef.current = null;
            setHoverState(null);
          }
        });

        labelsContainer.appendChild(el);
        labels.push({ el, node: nm });
      });
    }

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Camera/pan/zoom gating. When lockCamera is explicitly false (onboarding)
    // we keep clicks read-only but still allow the user to drag/zoom the map.
    const cameraLocked = lockCameraCenter;
    const allowCameraInteraction = !cameraLocked;

    let isDragging = false;
    let dragMoved = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let rootStartX = 0;
    let rootStartY = 0;
    let rootTargetX = 0;
    let rootTargetY = 0;

    let cameraTargetX = 0;
    let cameraTargetY = 0;
    let cameraTargetZ = showAllNodes ? CAMERA_END_Z : CAMERA_END_Z;
    let lookAtTargetX = 0;
    let lookAtTargetY = 0;
    let currentLookX = 0;
    let currentLookY = 0;

    const worldPerPixel = () =>
      (2 *
        camera.position.z *
        Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) /
      Math.max(container.clientHeight, 1);

    const updateCameraTargetFromSelection = () => {
      if (layoutOverride) {
        cameraTargetX = 0;
        cameraTargetY = 0;
        cameraTargetZ = CAMERA_END_Z;
        lookAtTargetX = 0;
        lookAtTargetY = 0;
        rootTargetX = 0;
        rootTargetY = 0;
        return;
      }
      const sel = selectionRef.current;
      if (!sel) {
        cameraTargetX = 0;
        cameraTargetY = 0;
        cameraTargetZ = CAMERA_END_Z;
        lookAtTargetX = 0;
        lookAtTargetY = 0;
        rootTargetX = 0;
        rootTargetY = 0;
        return;
      }
      const pillarId =
        sel.kind === "pillar"
          ? sel.nodeId
          : nodeMeshes.find((n) => n.data.id === sel.nodeId)?.parentId ?? null;
      if (!pillarId) return;
      const pillar = nodeMeshes.find((n) => n.data.id === pillarId);
      if (!pillar) return;
      const px = pillar.basePosition.x;
      const py = pillar.basePosition.y;
      cameraTargetX = px * FOCUS_CAMERA_LEAN;
      cameraTargetY = py * FOCUS_CAMERA_LEAN;
      cameraTargetZ = FOCUS_CAMERA_Z;
      lookAtTargetX = px * 0.5;
      lookAtTargetY = py * 0.5;
      rootTargetX = 0;
      rootTargetY = 0;
    };

    const getPickables = () =>
      nodeMeshes
        .filter((n) => n.currentOpacity > 0.2 || n.data.kind === "goal")
        .map((n) => n.core);

    const onPointerDown = (e: PointerEvent) => {
      if (!allowCameraInteraction || e.button !== 0) return;
      isDragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      rootStartX = root.position.x;
      rootStartY = root.position.y;
      canvas.setPointerCapture(e.pointerId);
    };

    const raycastNodeAt = (e: PointerEvent): NodeMesh | null => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(getPickables(), false);
      const hit = hits[0]?.object as THREE.Mesh | undefined;
      const nodeId = hit?.userData?.nodeId as string | undefined;
      if (!nodeId) return null;
      return nodeMeshes.find((n) => n.data.id === nodeId) ?? null;
    };

    const updateHoverFromEvent = (e: PointerEvent) => {
      const nm = raycastNodeAt(e);
      const nodeId = nm?.data.id ?? null;

      if (nodeId === hoveredIdRef.current) {
        if (nodeId) {
          setHoverState((prev) =>
            prev ? { ...prev, x: e.clientX, y: e.clientY } : prev,
          );
        }
        return;
      }

      if (hoveredIdRef.current) {
        hoveredIdRef.current = null;
        document.body.style.cursor = "grab";
        setHoverState(null);
      }

      if (nm) {
        hoveredIdRef.current = nm.data.id;
        document.body.style.cursor = "pointer";
        setHoverState({ node: nm.data, x: e.clientX, y: e.clientY });
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!allowCameraInteraction) return;
      if (isDragging) {
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
        const wpp = worldPerPixel();
        root.position.x = rootStartX + dx * wpp;
        root.position.y = rootStartY - dy * wpp;
        rootTargetX = root.position.x;
        rootTargetY = root.position.y;
        if (hoveredIdRef.current) {
          hoveredIdRef.current = null;
          setHoverState(null);
        }
        document.body.style.cursor = "grabbing";
        return;
      }
      if (!isReadOnly) updateHoverFromEvent(e);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false;
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch {}
        document.body.style.cursor = "grab";
        if (!dragMoved && !isReadOnly) {
          const nm = raycastNodeAt(e);
          if (!nm) {
            selectionRef.current = null;
            setSelectionState(null);
          } else if (nm.data.kind === "goal" && !layoutOverride) {
            selectionRef.current = null;
            setSelectionState(null);
          } else if (nm.data.kind === "goal" || nm.data.kind === "pillar") {
            const next: GraphSelection = {
              kind: "pillar",
              nodeId: nm.data.id,
            };
            selectionRef.current = next;
            setSelectionState(next);
          } else {
            const next: GraphSelection = {
              kind: "action",
              nodeId: nm.data.id,
            };
            selectionRef.current = next;
            setSelectionState(next);
          }
          updateCameraTargetFromSelection();
          updateHoverFromEvent(e);
        }
      }
    };

    const onPointerEnter = () => {
      document.body.style.cursor = "grab";
    };

    const onPointerLeave = () => {
      if (hoveredIdRef.current) {
        hoveredIdRef.current = null;
        setHoverState(null);
      }
      isDragging = false;
      document.body.style.cursor = "";
    };

    const onWheel = (e: WheelEvent) => {
      if (!allowCameraInteraction) return;
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.08 : 0.93;
      cameraTargetZ = THREE.MathUtils.clamp(
        cameraTargetZ * factor,
        CAMERA_MIN_Z,
        CAMERA_MAX_Z,
      );
    };

    if (lockCameraCenter) {
      cameraTargetX = 0;
      cameraTargetY = 0;
      lookAtTargetX = 0;
      lookAtTargetY = 0;
      rootTargetX = 0;
      rootTargetY = 0;
      currentLookX = 0;
      currentLookY = 0;
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerenter", onPointerEnter);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    const computeTargets = (elapsed: number) => {
      const introT = Math.min(1, elapsed / 800);

      if (showAllNodes || isNucleusLayout) {
        nodeMeshes.forEach((nm) => {
          const isHovered = nm.data.id === hoveredIdRef.current;
          nm.targetOpacity = 1 * introT;
          nm.targetScale = isHovered ? HOVER_SCALE : 1;
        });
        edges.forEach((er) => {
          er.targetOpacity = er.baseOpacity * introT;
        });
        return;
      }

      const sel = selectionRef.current;
      const isOverview = !sel;
      const selectedPillarId =
        sel?.kind === "pillar"
          ? sel.nodeId
          : sel?.kind === "action"
            ? nodeMeshes.find((n) => n.data.id === sel.nodeId)?.parentId ?? null
            : null;
      const selectedActionId = sel?.kind === "action" ? sel.nodeId : null;

      nodeMeshes.forEach((nm) => {
        const isHovered = nm.data.id === hoveredIdRef.current;
        if (nm.data.kind === "goal") {
          nm.targetOpacity = 1 * introT;
          nm.targetScale = isHovered ? HOVER_SCALE : 1;
        } else if (nm.data.kind === "pillar") {
          const isSelected = selectedPillarId === nm.data.id;
          if (isOverview) {
            nm.targetOpacity = 1 * introT;
            nm.targetScale = isHovered ? HOVER_SCALE : 1;
          } else if (isSelected) {
            nm.targetOpacity = 1;
            nm.targetScale = isHovered ? HOVER_SCALE : 1.15;
          } else {
            nm.targetOpacity = 0.32;
            nm.targetScale = isHovered ? 0.95 : 0.85;
          }
        } else {
          const inSelected = nm.parentId === selectedPillarId;
          if (!inSelected) {
            nm.targetOpacity = 0;
            nm.targetScale = 0.001;
          } else {
            const isSelectedAction = nm.data.id === selectedActionId;
            if (selectedActionId) {
              nm.targetOpacity = isSelectedAction ? 1 : 0.55;
              nm.targetScale = isHovered
                ? HOVER_SCALE
                : isSelectedAction
                  ? 1.2
                  : 1;
            } else {
              nm.targetOpacity = 1;
              nm.targetScale = isHovered ? HOVER_SCALE : 1;
            }
          }
        }
      });

      edges.forEach((er) => {
        if (er.kind === "goal-pillar") {
          const isSelected =
            !isOverview && selectedPillarId === er.parentPillarId;
          if (isOverview) {
            er.targetOpacity = er.baseOpacity * introT;
          } else if (isSelected) {
            er.targetOpacity = er.baseOpacity;
          } else {
            er.targetOpacity = 0.15;
          }
        } else {
          const isInSelected = selectedPillarId === er.parentPillarId;
          er.targetOpacity = isInSelected ? er.baseOpacity : 0;
        }
      });
    };

    const startTime = performance.now();
    let raf = 0;
    const tmpVec = new THREE.Vector3();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const seconds = elapsed / 1000;
      const lerpT = reduceMotion ? 1 : LERP_FACTOR;
      const camLerpT = reduceMotion ? 1 : CAM_LERP_FACTOR;

      computeTargets(elapsed);

      camera.position.x = lerp(camera.position.x, cameraTargetX, camLerpT);
      camera.position.y = lerp(camera.position.y, cameraTargetY, camLerpT);
      camera.position.z = lerp(camera.position.z, cameraTargetZ, camLerpT);
      currentLookX = lerp(currentLookX, lookAtTargetX, camLerpT);
      currentLookY = lerp(currentLookY, lookAtTargetY, camLerpT);
      camera.lookAt(currentLookX, currentLookY, 0);

      if (!isDragging) {
        root.position.x = lerp(root.position.x, rootTargetX, camLerpT);
        root.position.y = lerp(root.position.y, rootTargetY, camLerpT);
      }

      nodeMeshes.forEach((nm) => {
        nm.currentOpacity = lerp(nm.currentOpacity, nm.targetOpacity, lerpT);
        nm.currentScale = lerp(nm.currentScale, nm.targetScale, lerpT);

        const coreMat = nm.core.material as THREE.MeshBasicMaterial;
        coreMat.opacity = 0;
        const haloMat = nm.halo.material as THREE.SpriteMaterial;
        haloMat.opacity = 0;

        const ringMat = nm.ring.material as THREE.MeshBasicMaterial;
        ringMat.opacity = 0;

        nm.group.scale.setScalar(Math.max(0.001, nm.currentScale));

        if (!reduceMotion && nm.currentOpacity > 0.1) {
          const bobX =
            Math.sin(seconds * nm.bobSpeed + nm.bobPhase) * nm.bobAmp;
          const bobY =
            Math.cos(seconds * nm.bobSpeed * 0.85 + nm.bobPhase * 1.3) *
            nm.bobAmp;
          nm.group.position.set(
            nm.basePosition.x + bobX,
            nm.basePosition.y + bobY,
            nm.basePosition.z,
          );
        } else {
          nm.group.position.copy(nm.basePosition);
        }

        (nm.pulseHalo.material as THREE.SpriteMaterial).opacity = 0;
      });

      edges.forEach((er) => {
        er.currentOpacity = lerp(er.currentOpacity, er.targetOpacity, lerpT);
        (er.dashLine.material as THREE.LineDashedMaterial).opacity =
          er.currentOpacity;
        (er.fillLine.material as THREE.LineBasicMaterial).opacity =
          er.currentOpacity;
      });

      bottleneckMeshes.forEach((nm) => {
        (nm.halo.material as THREE.SpriteMaterial).opacity = 0;
        (nm.pulseHalo.material as THREE.SpriteMaterial).opacity = 0;
      });

      if (labelsContainer) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w > 0 && h > 0) {
          labels.forEach(({ el, node }) => {
            node.group.getWorldPosition(tmpVec);
            tmpVec.project(camera);
            const x = (tmpVec.x * 0.5 + 0.5) * w;
            const y = (1 - (tmpVec.y * 0.5 + 0.5)) * h;
            el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
            const op = Math.min(1, node.currentOpacity);
            el.style.opacity = String(op);
          });
        }
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerenter", onPointerEnter);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("wheel", onWheel);
      document.body.style.cursor = "";
      if (labelsContainer) labelsContainer.innerHTML = "";
      container.removeChild(canvas);
      renderer.dispose();
      orbitGeo.dispose();
      orbitMat.dispose();
      nodeMeshes.forEach((nm) => {
        nm.core.geometry.dispose();
        (nm.core.material as THREE.Material).dispose();
        nm.ring.geometry.dispose();
        (nm.ring.material as THREE.Material).dispose();
        (nm.halo.material as THREE.Material).dispose();
        (nm.pulseHalo.material as THREE.Material).dispose();
      });
      edges.forEach((er) => {
        er.dashLine.geometry.dispose();
        (er.dashLine.material as THREE.Material).dispose();
        er.fillLine.geometry.dispose();
        (er.fillLine.material as THREE.Material).dispose();
      });
      nodeMeshesRef.current = [];
    };
  }, [
    containerRef,
    labelsRef,
    pillars,
    destination,
    mainBottleneck,
    rollups,
    isReadOnly,
    lockCamera,
    showAllNodes,
    layoutOverride,
  ]);

  return {
    hover,
    selection,
    select,
    clearSelection,
    selectBottleneck,
  };
}
