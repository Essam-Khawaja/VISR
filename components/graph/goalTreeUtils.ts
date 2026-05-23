import * as THREE from "three";

export function parseHex(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

/**
 * Soft cylinder disc plus thin stat rings (horizontal XZ footprint, Y up).
 * Score text is intentionally rendered outside Three (HTML overlays) per PRD.
 */
export function createGlassNode(ringFrac: number, ringHex: string, scale = 1): THREE.Group {
  const g = new THREE.Group();

  const discR = 6.4 * scale;
  const discGeom = new THREE.CylinderGeometry(discR, discR * 1.06, 1.65 * scale, 64, 1, false);

  const discMat = new THREE.MeshPhysicalMaterial({
    color: "#1b2540",
    metalness: 0.08,
    roughness: 0.32,
    emissive: new THREE.Color("#01060f"),
    emissiveIntensity: 0.18,
    clearcoat: 0.82,
    clearcoatRoughness: 0.24,
    transparent: true,
    opacity: 0.96,
  });

  const disc = new THREE.Mesh(discGeom, discMat);
  disc.castShadow = true;
  disc.receiveShadow = true;
  g.add(disc);

  const inner = discR + 0.95 * scale;
  const outer = discR + 2.85 * scale;
  const ringBg = new THREE.Mesh(
    new THREE.RingGeometry(inner, outer, 96, 1, -Math.PI / 2, Math.PI * 2),
    new THREE.MeshBasicMaterial({
      color: "#22304f",
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  ringBg.rotation.x = -Math.PI / 2;
  ringBg.position.y = 1.06 * scale;
  g.add(ringBg);

  const ringFg = new THREE.Mesh(
    new THREE.RingGeometry(inner, outer, 96, 1, -Math.PI / 2, Math.PI * 2 * ringFrac),
    new THREE.MeshBasicMaterial({
      color: parseHex(ringHex),
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  ringFg.rotation.x = -Math.PI / 2;
  ringFg.position.y = 1.08 * scale;
  ringFg.userData.ringForeground = true;
  g.add(ringFg);

  g.userData.disc = disc;
  g.userData.ringFg = ringFg;

  return g;
}

export function quadraticTube(
  start: THREE.Vector3,
  end: THREE.Vector3,
  bendY: number,
  radius: number,
  options?: { hue?: THREE.Color },
): THREE.Mesh {
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  mid.y += bendY;

  const curve = new THREE.QuadraticBezierCurve3(start.clone(), mid, end.clone());
  const tubular = new THREE.TubeGeometry(curve, 48, radius, 8, false);
  const hue = options?.hue ?? new THREE.Color("#4FACFE");
  const mesh = new THREE.Mesh(
    tubular,
    new THREE.MeshStandardMaterial({
      color: "#27365c",
      emissive: hue,
      emissiveIntensity: 0.36,
      metalness: 0.06,
      roughness: 0.35,
      transparent: true,
      opacity: 0.92,
    }),
  );

  mesh.castShadow = true;
  return mesh;
}
