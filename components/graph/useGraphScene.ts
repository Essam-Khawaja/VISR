"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { cssVar, hexToThreeColor } from "@/lib/cssColor";
import {
  bottleneckPulse,
  CAMERA_END_Z,
  CAMERA_MAX_Z,
  CAMERA_MIN_Z,
  CAMERA_START_Z,
  HOVER_SCALE,
} from "./graphAnimations";
import { createEdgeRender, type EdgeRender } from "./graphEdges";
import { buildGraphLayout } from "./graphLayout";
import { createNodeMesh, haloStrength, type NodeMesh } from "./graphNodes";
import type { GraphNodeData, GraphSelection } from "./graphTypes";
import type { StrategicPillar } from "@/lib/types";

export type ActionState = "open" | "done" | "skipped";

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
  isReadOnly?: boolean;
  layoutOverride?: {
    nodes: import("./graphTypes").LayoutNode[];
    edges: import("./graphTypes").LayoutEdge[];
  };
};

const FOCUS_CAMERA_Z = 6.2;
const FOCUS_CAMERA_LEAN = 0.55;
const LERP_FACTOR = 0.14;
const CAM_LERP_FACTOR = 0.085;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function useGraphScene({
  containerRef,
  labelsRef,
  pillars,
  destination,
  mainBottleneck,
  actionStates,
  isReadOnly = false,
  layoutOverride,
}: Props) {
  const [hover, setHoverState] = useState<HoverState>(null);
  const [selection, setSelectionState] = useState<GraphSelection>(null);

  const selectionRef = useRef<GraphSelection>(null);
  const hoveredIdRef = useRef<string | null>(null);
  const bottleneckIdRef = useRef<string | null>(null);
  const actionStatesRef = useRef<Record<string, ActionState>>({});
  const nodeMeshesRef = useRef<NodeMesh[]>([]);

  actionStatesRef.current = actionStates ?? {};

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

  // Update action node colors when actionStates change (debounced into rAF via effect)
  useEffect(() => {
    const mutedHex = hexToThreeColor(cssVar("--muted", "#cbd5e1"));
    const successHex = hexToThreeColor(cssVar("--success", "#059669"));
    nodeMeshesRef.current.forEach((nm) => {
      if (nm.data.kind !== "action") return;
      const state = actionStatesRef.current[nm.data.id];
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
  }, [actionStates]);

  useEffect(() => {
    const container = containerRef.current;
    const labelsContainer = labelsRef.current;
    if (!container) return;

    const layout = layoutOverride
      ? { ...layoutOverride, destination, bottleneckPillarId: null }
      : buildGraphLayout(pillars, destination, mainBottleneck);
    bottleneckIdRef.current = layout.bottleneckPillarId;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const root = new THREE.Group();
    scene.add(root);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, CAMERA_START_Z);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    const canvas = renderer.domElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.touchAction = "none";

    const edges: EdgeRender[] = layout.edges.map((e) => createEdgeRender(e));
    edges.forEach((er) => root.add(er.mesh));

    const nodeMeshes: NodeMesh[] = layout.nodes.map((n) => createNodeMesh(n));
    nodeMeshes.forEach((nm) => root.add(nm.group));
    nodeMeshesRef.current = nodeMeshes;

    // Apply initial action state coloring
    const mutedHex = hexToThreeColor(cssVar("--muted", "#cbd5e1"));
    const successHex = hexToThreeColor(cssVar("--success", "#059669"));
    nodeMeshes.forEach((nm) => {
      if (nm.data.kind !== "action") return;
      const state = actionStatesRef.current[nm.data.id];
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

    type Label = { el: HTMLDivElement; node: NodeMesh };
    const labels: Label[] = [];
    if (labelsContainer) {
      labelsContainer.innerHTML = "";
      nodeMeshes.forEach((nm) => {
        if (nm.data.kind !== "goal" && nm.data.kind !== "pillar") return;
        const el = document.createElement("div");
        el.className =
          "absolute font-medium text-[11px] text-secondary whitespace-nowrap select-none transition-colors";
        el.style.willChange = "transform, opacity";
        el.style.transform = "translate(-9999px,-9999px)";
        el.style.padding = "2px 8px";
        el.style.borderRadius = "8px";
        el.style.background = "rgba(255,255,255,0.9)";
        el.style.border = "1px solid rgba(37,99,235,0.16)";
        el.style.backdropFilter = "blur(4px)";
        el.textContent = nm.data.name;
        if (nm.data.kind === "goal") {
          el.classList.remove("text-secondary");
          el.classList.add("text-primary");
          el.style.fontSize = "13px";
          el.style.fontWeight = "600";
          el.style.padding = "4px 12px";
        }
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
    let cameraTargetZ = CAMERA_END_Z;
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
      lookAtTargetX = px * FOCUS_CAMERA_LEAN;
      lookAtTargetY = py * FOCUS_CAMERA_LEAN;
      rootTargetX = 0;
      rootTargetY = 0;
    };

    const getPickables = () =>
      nodeMeshes
        .filter((n) => n.currentOpacity > 0.2 || n.data.kind === "goal")
        .map((n) => n.core);

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
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
          if (!nm || nm.data.kind === "goal") {
            selectionRef.current = null;
            setSelectionState(null);
          } else if (nm.data.kind === "pillar") {
            const next: GraphSelection = { kind: "pillar", nodeId: nm.data.id };
            selectionRef.current = next;
            setSelectionState(next);
          } else {
            const next: GraphSelection = { kind: "action", nodeId: nm.data.id };
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
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.08 : 0.93;
      cameraTargetZ = THREE.MathUtils.clamp(
        cameraTargetZ * factor,
        CAMERA_MIN_Z,
        CAMERA_MAX_Z,
      );
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerenter", onPointerEnter);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    const computeTargets = (elapsed: number) => {
      const sel = selectionRef.current;
      const isOverview = !sel;
      const selectedPillarId =
        sel?.kind === "pillar"
          ? sel.nodeId
          : sel?.kind === "action"
            ? nodeMeshes.find((n) => n.data.id === sel.nodeId)?.parentId ?? null
            : null;
      const selectedActionId = sel?.kind === "action" ? sel.nodeId : null;
      const introT = Math.min(1, elapsed / 800);

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
        coreMat.opacity = Math.min(1, nm.currentOpacity);
        const haloMat = nm.halo.material as THREE.SpriteMaterial;
        const isSelected =
          selectionRef.current?.nodeId === nm.data.id &&
          (selectionRef.current?.kind === "pillar" ||
            selectionRef.current?.kind === "action");
        haloMat.opacity = nm.currentOpacity * haloStrength(nm, isSelected);

        const ringMat = nm.ring.material as THREE.MeshBasicMaterial;
        ringMat.opacity = isSelected ? Math.min(1, nm.currentOpacity) * 0.5 : 0;

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
      });

      edges.forEach((er) => {
        er.currentOpacity = lerp(er.currentOpacity, er.targetOpacity, lerpT);
        (er.mesh.material as THREE.MeshBasicMaterial).opacity =
          er.currentOpacity;
      });

      const pulseT = seconds;
      bottleneckMeshes.forEach((nm) => {
        if (nm.currentOpacity < 0.1) return;
        const mat = nm.halo.material as THREE.SpriteMaterial;
        const base = haloStrength(
          nm,
          selectionRef.current?.nodeId === nm.data.id,
        );
        mat.opacity =
          nm.currentOpacity * (base * 0.7 + bottleneckPulse(pulseT) * 0.35);
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
            const offset =
              node.data.kind === "goal"
                ? -42
                : (node.data.radius + 0.6) * 30;
            el.style.transform = `translate(${x}px, ${y + offset}px) translate(-50%, -50%)`;
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
      nodeMeshes.forEach((nm) => {
        nm.core.geometry.dispose();
        (nm.core.material as THREE.Material).dispose();
        nm.ring.geometry.dispose();
        (nm.ring.material as THREE.Material).dispose();
        (nm.halo.material as THREE.Material).dispose();
      });
      edges.forEach((er) => {
        er.mesh.geometry.dispose();
        (er.mesh.material as THREE.Material).dispose();
      });
      selectionRef.current = null;
      nodeMeshesRef.current = [];
    };
  }, [containerRef, labelsRef, pillars, destination, mainBottleneck, isReadOnly, layoutOverride]);

  return {
    hover,
    selection,
    select,
    clearSelection,
    selectBottleneck,
  };
}
