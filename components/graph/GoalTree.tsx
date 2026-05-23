"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type { StrategyPlan } from "@/lib/types";
import {
  actionAlignmentScore,
  nodeStatusColor,
  pillarAlignmentScore,
  pillarToGraphStatusColors,
} from "@/lib/statusColors";
import { createGlassNode, parseHex, quadraticTube } from "@/components/graph/goalTreeUtils";

export type GoalTreeProps = { plan: StrategyPlan; className?: string };

type LabelBindRef = MutableRefObject<{ el: HTMLDivElement; object: THREE.Object3D }[]>;

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function disposeSubtree(root: THREE.Object3D): void {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach((m) => m.dispose());
  });
}

function mountHtmlLabel(
  container: HTMLElement,
  bindsRef: LabelBindRef,
  obj: THREE.Object3D,
  title: string,
  scorePct: number,
): void {
  const el = document.createElement("div");
  el.className =
    "pointer-events-none max-w-[208px] rounded-xl border border-[color:var(--border)] bg-black/72 px-3 py-2 text-left shadow-2xl backdrop-blur";

  el.innerHTML = `<div class="text-[10px] font-semibold uppercase tracking-[0.24em]" style="color:var(--text-secondary);">Radar stat</div>
<div class="mt-1 font-display text-[15px] leading-snug" style="color:var(--text-primary);">${escapeHtml(title)}</div>
<div class="mt-1 font-semibold tabular-nums text-sm" style="color:var(--accent);">${scorePct}% alignment</div>`;

  container.appendChild(el);
  bindsRef.current.push({ el, object: obj });
}

export function GoalTree({ plan, className }: GoalTreeProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const bindsRef = useRef<{ el: HTMLDivElement; object: THREE.Object3D }[]>([]);

  const [drilledPillarId, setDrilledPillarId] = useState<string | null>(null);
  const drilledRef = useRef<string | null>(null);

  const [popover, setPopover] = useState<{ x: number; y: number; html: string } | null>(null);

  const compositePct = useMemo(() => {
    const ps = plan.strategicPillars;
    if (!ps.length) return 0;
    const sum = ps.reduce((acc, p) => acc + pillarAlignmentScore(p.status), 0);
    return Math.round(sum / ps.length);
  }, [plan]);

  const drilledTitle = useMemo(() => {
    return plan.strategicPillars.find((p) => p.id === drilledPillarId)?.name ?? null;
  }, [drilledPillarId, plan.strategicPillars]);

  useEffect(() => {
    drilledRef.current = drilledPillarId;
  }, [drilledPillarId]);

  useEffect(() => {
    const host = hostRef.current;
    const overlayHost = overlayRef.current;
    if (!host || !overlayHost) return;

    bindsRef.current = [];
    overlayHost.replaceChildren();

    const scene = new THREE.Scene();
    scene.background = parseHex("#080C14");
    scene.fog = new THREE.Fog(parseHex("#080C14"), 130, 420);

    const camera = new THREE.PerspectiveCamera(
      41,
      host.clientWidth / Math.max(host.clientHeight, 1),
      0.1,
      1200,
    );

    const camStart = new THREE.Vector3(0, 128, 230);
    const camEnd = new THREE.Vector3(0, 94, 168);
    let camT = 0;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    host.appendChild(renderer.domElement);

    const world = new THREE.Group();
    scene.add(world);

    scene.add(new THREE.HemisphereLight("#1f2e56", "#02040f", 0.62));

    const key = new THREE.DirectionalLight("#d7ecff", 1.08);
    key.position.set(40, 98, 70);
    key.castShadow = true;
    key.shadow.bias = -0.00021;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);

    scene.add(new THREE.PointLight("#4FACFE", 1.05, 420));

    const bottleneckLight = new THREE.PointLight("#FF4D6D", 4.85, 200, 1.94);
    bottleneckLight.visible = false;
    scene.add(bottleneckLight);

    const picks: THREE.Mesh[] = [];

    let bottleneckDiscMat: THREE.MeshPhysicalMaterial | null = null;

    function registerPickMeshes(node: THREE.Object3D): void {
      node.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        picks.push(child);
      });
    }

    let rails: THREE.Group | null = null;

    function build(drilledId: string | null, labelMount: HTMLElement) {
      disposeSubtree(world);
      bindsRef.current = [];
      labelMount.replaceChildren();
      rails = null;

      picks.splice(0, picks.length);

      const drilled =
        drilledId == null ? null : plan.strategicPillars.find((p) => p.id === drilledId) ?? null;

      bottleneckLight.visible = false;
      bottleneckDiscMat = null;

      if (!drilled) {
        const gg = new THREE.Group();
        world.add(gg);

        const edgeBucket = new THREE.Group();
        gg.add(edgeBucket);
        rails = edgeBucket;

        const goalNode = createGlassNode(compositePct / 100, "#4FACFE", 1.18);
        goalNode.position.set(0, 0, 0);
        goalNode.userData.kind = "goal";
        goalNode.userData.pickKey = "__goal";

        gg.add(goalNode);

        mountHtmlLabel(labelMount, bindsRef, goalNode, plan.destination, compositePct);
        registerPickMeshes(goalNode);

        plan.strategicPillars.forEach((pillar, idx) => {
          const colors = pillarToGraphStatusColors(pillar);
          const frac = pillarAlignmentScore(pillar.status) / 100;

          const n = createGlassNode(frac, colors.ring);
          const a = (idx / plan.strategicPillars.length) * Math.PI * 2 + 0.18;
          const rr = 50;
          n.position.set(Math.cos(a) * rr, 26, Math.sin(a) * rr);

          n.userData.kind = "pillar";
          n.userData.pillarId = pillar.id;

          gg.add(n);

          if (pillar.isPrimaryBottleneck) {
            bottleneckLight.position.copy(n.position.clone().setY(n.position.y + 12));
            bottleneckLight.visible = true;
            bottleneckLight.color = parseHex("#FF4D6D");

            const disc = n.userData.disc as THREE.Mesh | undefined;
            if (disc) {
              bottleneckDiscMat = disc.material as THREE.MeshPhysicalMaterial;
              bottleneckDiscMat.emissive = parseHex("#FF4D6D");
            }
          }

          mountHtmlLabel(labelMount, bindsRef, n, pillar.name, Math.round(frac * 100));
          registerPickMeshes(n);

          const gw = new THREE.Vector3(0, 18, 0);
          const pw = n.position.clone();
          pw.y += 20;

          const edge = quadraticTube(gw, pw, 22 + idx * 0.55, 0.32, { hue: parseHex(colors.ring) });
          edge.userData.phase = idx * 0.75 + pillar.id.length * 0.01;
          edgeBucket.add(edge);

        });
      } else {
        const gg = new THREE.Group();
        world.add(gg);

        const edgeBucket = new THREE.Group();
        gg.add(edgeBucket);
        rails = edgeBucket;

        const anchor = createGlassNode(Math.min(compositePct, 94) / 100, "#4FACFE", 0.62);
        anchor.position.set(-84, 20, -64);
        anchor.userData.kind = "goal";
        anchor.userData.pickKey = "__goalBack";
        gg.add(anchor);

        mountHtmlLabel(labelMount, bindsRef, anchor, plan.destination, compositePct);
        registerPickMeshes(anchor);

        const centerFrac = pillarAlignmentScore(drilled.status) / 100;
        const centerCols = pillarToGraphStatusColors(drilled);

        const center = createGlassNode(centerFrac, centerCols.ring, 1.22);
        center.position.set(0, 38, 0);
        center.userData.kind = "pillar";
        center.userData.pillarId = drilled.id;

        gg.add(center);

        mountHtmlLabel(labelMount, bindsRef, center, drilled.name, Math.round(centerFrac * 100));
        registerPickMeshes(center);

        if (drilled.isPrimaryBottleneck) {
          bottleneckLight.position.copy(center.position.clone().setY(center.position.y + 16));
          bottleneckLight.visible = true;

          const disc = center.userData.disc as THREE.Mesh | undefined;
          if (disc) {
            bottleneckDiscMat = disc.material as THREE.MeshPhysicalMaterial;
            bottleneckDiscMat.emissive = parseHex("#FF4D6D");
          }
        }

        drilled.actions.forEach((action, ai) => {
          const fracA = actionAlignmentScore(action.status) / 100;

          const mesh = createGlassNode(fracA, nodeStatusColor[action.status], 0.94);

          const ang = (ai / Math.max(1, drilled.actions.length)) * Math.PI * 2 + 0.42;
          const r = 32;
          mesh.position.set(Math.cos(ang) * r, 58, Math.sin(ang) * r);
          mesh.userData.kind = "action";
          mesh.userData.pickKey = action.id;
          mesh.userData.hoverDetail = `<p class="font-semibold">${escapeHtml(plan.destination)}</p><p class="mt-1 text-[color:var(--text-secondary)]">${escapeHtml(drilled.name)}: ${escapeHtml(action.recommendation)}</p>`;

          gg.add(mesh);

          mountHtmlLabel(labelMount, bindsRef, mesh, action.name, Math.round(fracA * 100));
          registerPickMeshes(mesh);

          const hue = parseHex(nodeStatusColor[action.status]);
          const from = center.position.clone().add(new THREE.Vector3(0, 11, 0));
          const to = mesh.position.clone();

          const edge = quadraticTube(from, to, 12.5 + ai * 0.65, 0.26, { hue });
          edge.userData.phase = ai * 1.06 + drilled.id.length * 0.01;
          edgeBucket.add(edge);
        });
      }
    }

    build(drilledPillarId, overlayHost);

    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    const onMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      ray.setFromCamera(ndc, camera);

      const hits = ray.intersectObjects(picks, false);
      if (!hits.length) {
        renderer.domElement.style.cursor = "";
        setPopover(null);
        return;
      }

      renderer.domElement.style.cursor = "pointer";

      const root = (hits[0].object.parent ?? hits[0].object) as THREE.Object3D;

      const pk = root.userData.pickKey as string | undefined;
      const kind = root.userData.kind as string | undefined;
      const pillarId = root.userData.pillarId as string | undefined;

      let html = "";

      if (pk === "__goal") {
        html = `<div class="text-[10px] font-semibold uppercase tracking-[0.24em]" style="color:var(--text-secondary);">Recommendation</div>
<div class="mt-1 text-[15px] font-semibold leading-snug">${escapeHtml(plan.mainBottleneck)}</div>`;
      } else if (pk === "__goalBack") {
        html = `<div class="text-[13px]" style="color:var(--text-primary);">Back to full route</div><div class="mt-2 text-[12px]" style="color:var(--text-secondary);">Click to zoom out.</div>`;
      } else if (kind === "pillar" && pillarId) {
        const p = plan.strategicPillars.find((x) => x.id === pillarId);
        if (!p) {
          setPopover(null);
          return;
        }
        html = `<div class="text-[15px] font-semibold">${escapeHtml(p.name)}</div>
<div class="mt-1 text-[13px] leading-snug" style="color:var(--text-secondary);">${escapeHtml(p.reason)}</div>`;
      } else if (typeof root.userData.hoverDetail === "string") {
        html = root.userData.hoverDetail;
      }

      setPopover(html ? { x: e.clientX + 14, y: e.clientY + 14, html } : null);
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      ray.setFromCamera(ndc, camera);

      const hits = ray.intersectObjects(picks, false);
      if (!hits.length) return;

      const root = hits[0].object.parent ?? hits[0].object;

      const kind = root.userData.kind as string | undefined;
      const pillarId = root.userData.pillarId as string | undefined;
      const pk = root.userData.pickKey as string | undefined;

      const isZoomedOut = drilledRef.current == null;

      if ((pk === "__goalBack" || pk === "__goal") && !isZoomedOut) {
        setDrilledPillarId(null);
        return;
      }

      if (kind === "pillar" && pillarId && isZoomedOut) {
        setDrilledPillarId(pillarId);
      }
    };

    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("click", onClick);

    const resize = () => {
      const w = host.clientWidth;
      const h = Math.max(host.clientHeight, 1);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro?.observe(host);
    resize();

    let rid = 0;
    let tPrev = performance.now();

    const tick = () => {
      rid = requestAnimationFrame(tick);

      const now = performance.now();
      const dt = Math.min(0.05, (now - tPrev) / 1000);
      tPrev = now;

      camT += dt;
      const intro = THREE.MathUtils.clamp(camT / 3.0, 0, 1);

      camera.position.lerpVectors(camStart, camEnd, easeOutCubic(intro));
      camera.lookAt(0, 28, 0);

      world.rotation.y += THREE.MathUtils.degToRad(0.3 * dt);

      rails?.children.forEach((mesh) => {
        if (!(mesh instanceof THREE.Mesh)) return;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const phase = mesh.userData.phase as number | undefined;
        if (typeof phase !== "number") return;
        const base = 0.29 + Math.sin(phase) * 0.05;
        mat.emissiveIntensity = base + Math.sin(now * 0.002 + phase * 2.35) * 0.065;
      });

      bindsRef.current.forEach(({ el, object }) => {
        const wp = object.getWorldPosition(new THREE.Vector3());
        wp.y += 26;
        const projected = wp.clone().project(camera);

        const sx = ((projected.x * 0.5 + 0.5) * host.clientWidth) | 0;
        const sy = ((-projected.y * 0.5 + 0.5) * host.clientHeight) | 0;

        el.style.position = "absolute";
        el.style.left = `${sx}px`;
        el.style.top = `${sy}px`;
        el.style.transform = "translate(-50%, -115%)";
        el.style.opacity = projected.z <= 1 ? "1" : "0.12";
      });

      const pulse =
        bottleneckLight.visible || bottleneckDiscMat
          ? 0.5 + 0.5 * Math.sin((now / 1000) * Math.PI)
          : 0;

      if (bottleneckLight.visible) {
        bottleneckLight.intensity = 3.6 + pulse * 4.2;
      }

      if (bottleneckDiscMat) {
        bottleneckDiscMat.emissiveIntensity = 0.08 + pulse * 0.6;
      }

      renderer.render(scene, camera);
    };

    rid = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rid);
      ro?.disconnect();
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("click", onClick);

      bindsRef.current = [];
      overlayHost.replaceChildren();

      disposeSubtree(world);

      renderer.dispose();

      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [
    compositePct,
    drilledPillarId,
    plan,
    plan.destination,
    plan.mainBottleneck,
    plan.strategicPillars,
  ]);

  return (
    <section
      className={[
        "relative overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[linear-gradient(180deg,var(--bg-surface)_0%,rgba(13,20,36,0.55)_52%,transparent_115%)]",
        className ?? "",
      ].join(" ")}
    >
      <div className="absolute left-6 top-4 z-[2] rounded-full border border-[color:var(--border)] bg-black/45 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-secondary)] backdrop-blur">
        <span style={{ color: "var(--text-primary)" }}>Goal tree</span>
        {" · "}
        <span>
          Goal
          {drilledTitle ? ` → ${drilledTitle}` : ""}
        </span>
      </div>

      <div className="relative isolate h-[clamp(560px,_58vh,_740px)] w-full overflow-hidden rounded-3xl">
        <div ref={hostRef} className="absolute inset-0" />
        <div ref={overlayRef} className="pointer-events-none absolute inset-0 z-[3]" />

        {popover ? (
          <div
            className="pointer-events-none absolute z-[4] max-w-[320px] rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)]/95 px-4 py-3 text-sm shadow-xl backdrop-blur"
            style={{ left: popover.x, top: popover.y }}
            dangerouslySetInnerHTML={{ __html: popover.html }}
          />
        ) : null}
      </div>
    </section>
  );
}
