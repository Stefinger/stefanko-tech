'use client';
import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

// ── Approved Blob S path ─────────────────────────────────────────────────────
// Source: Figma file uzpgsTDcrVr6HdblOxIE5d, node 19:139 "Organic Blob S — Hero"
// Matches local public/assets/blob-s-hero.svg exactly.
// Exported so BlobSCanvas can reuse it for the inline SVG fallback.
// ViewBox: 0 0 590 780
export const BLOB_S_D =
  'M315.412 78.5937C334.848 75.8513 365.564 83.0514 383.507 91.1268C414.372 104.648 438.492 130.02 450.442 161.523C480.818 242.047 418.868 327.782 332.955 278.807C314.71 268.407 290.921 245.369 267.791 254.235C259.958 257.305 253.666 263.361 250.3 271.071C246.526 279.443 246.309 288.987 249.701 297.52C266.129 338.327 325.88 354.995 365.445 357.488C393.352 359.246 414.765 359.31 441.17 370.419C507.862 398.475 547.343 480.605 518.287 548.759C510.873 566.19 499.442 581.617 484.914 593.775C435.375 635.869 382.824 625.449 325.948 648.23C312.914 653.566 300.391 660.074 288.533 667.668C271.641 678.405 258.935 688.431 240.072 695.971C191.506 712.724 143.7 692.58 106.634 659.967C81.1074 637.23 63.8229 605.058 62.1562 570.598C59.549 516.686 100.093 445.916 159.227 443.582C192.374 442.275 220.576 462.413 238.137 489.091C241.944 494.874 247.375 500.999 252.343 505.869C283.989 536.135 315.703 504.642 311.273 468.026C308.359 443.935 293.433 427.363 272.775 415.935C248.809 402.676 221.892 401.657 196.498 392.7C180.694 387.152 166.068 378.693 153.378 367.762C125.531 343.266 108.549 308.717 106.164 271.706C103.727 235.814 116.55 197.437 140.23 170.327C147.767 161.74 156.31 154.092 165.675 147.547C180.987 136.746 197.395 130.09 212.954 120.611C248.396 99.017 272.489 81.5413 315.412 78.5937Z';

// Minimal SVG wrapper used by SVGLoader to parse the path
const BLOB_SVG = `<svg viewBox="0 0 590 780" xmlns="http://www.w3.org/2000/svg"><path d="${BLOB_S_D}"/></svg>`;

// ── Geometry factory ─────────────────────────────────────────────────────────
// Builds once per (isMobile) combination via useMemo.
// All transforms happen in-place to avoid extra allocations.
function buildBlobGeometry(isMobile: boolean): THREE.BufferGeometry {
  try {
    const loader = new SVGLoader();
    const parsed = loader.parse(BLOB_SVG);

    const shapes = parsed.paths.flatMap(p => SVGLoader.createShapes(p));
    if (shapes.length === 0) return new THREE.BufferGeometry();

    // Fewer segments on mobile for better performance
    const bevelSegs  = isMobile ? 3 : 6;
    const curveSegs  = isMobile ? 12 : 24;

    // Extrusion values are in SVG pixel space (viewBox 0 0 590 780).
    // After the 0.01 normalisation below they become world units:
    //   depth 50  → 0.50 wu   (shallow 3D suggestion)
    //   bevelThickness 30 → 0.30 wu
    //   bevelSize 20 → 0.20 wu
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth:          50,
      bevelEnabled:   true,
      bevelThickness: 30,
      bevelSize:      20,
      bevelSegments:  bevelSegs,
      curveSegments:  curveSegs,
    });

    // SVG Y-axis is inverted relative to Three.js — flip before centering
    geo.scale(1, -1, 1);

    // Center at origin so the pivot is the visual centre of the shape
    geo.computeBoundingBox();
    if (geo.boundingBox) {
      const c = new THREE.Vector3();
      geo.boundingBox.getCenter(c);
      geo.translate(-c.x, -c.y, -c.z);
    }

    // Normalise SVG pixel units → world units (÷100)
    // Result: ~5.9 wu wide × ~7.8 wu tall × ~0.5 wu deep
    geo.scale(0.01, 0.01, 0.01);

    return geo;
  } catch {
    return new THREE.BufferGeometry();
  }
}

// ── Component ────────────────────────────────────────────────────────────────
interface BlobSMeshProps {
  enablePointer: boolean;
  isMobile: boolean;
}

export function BlobSMesh({ enablePointer, isMobile }: BlobSMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Normalised global pointer in [-1, 1]; updated outside useFrame to avoid
  // allocations inside the render loop.
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enablePointer) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [enablePointer]);

  // Build geometry once per mobile/desktop configuration
  const geometry = useMemo(() => buildBlobGeometry(isMobile), [isMobile]);

  // Dispose geometry and material on unmount
  useEffect(() => () => { geometry.dispose(); }, [geometry]);

  // ── Animation loop — zero allocations ────────────────────────────────────
  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const t = state.clock.elapsedTime;

    // Gentle idle: sinusoidal breathing on Y and Z
    const idleY = Math.sin(t * 0.35) * 0.04;
    const idleZ = Math.sin(t * 0.22 + 1.2) * 0.02;

    // Pointer targets — max ±0.22 rad Y (≈12.6°), ±0.18 rad X (≈10.3°)
    const targetX = enablePointer ? -pointer.current.y * 0.18 : 0;
    const targetY = enablePointer ? pointer.current.x * 0.22 + idleY : idleY;
    const targetZ = idleZ;

    // Smooth lerp — delta*4 ≈ 4% per frame at 60fps (~0.33 s to 96% target)
    const spd = Math.min(delta * 4, 0.15); // clamp so very slow frames don't over-shoot
    mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, targetX, spd);
    mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetY, spd);
    mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, targetZ, spd * 0.75);
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      {/* Matte pink material — colour from design tokens (#FF6FAE) */}
      <meshStandardMaterial
        color="#FF6FAE"
        roughness={0.75}
        metalness={0}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}
