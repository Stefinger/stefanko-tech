'use client';
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { BLOB_S_D } from '@/components/canvas/BlobSMesh';
import type { BlobJourneyStore } from './BlobJourneyContext';
import { hideFallbacks } from './BlobJourneyContext';
import {
  SCENE_CONFIGS,
  IDLE_Y_AMP,
  IDLE_Z_AMP,
  POINTER_X_MAX,
  POINTER_Y_MAX,
  POINTER_PARALLAX_MAX,
} from './blobJourneyConfig';

// ── Geometry builder ──────────────────────────────────────────────────────────
const BLOB_SVG = `<svg viewBox="0 0 590 780" xmlns="http://www.w3.org/2000/svg"><path d="${BLOB_S_D}"/></svg>`;

function buildGeometry(): THREE.BufferGeometry {
  try {
    const loader = new SVGLoader();
    const parsed = loader.parse(BLOB_SVG);
    const shapes = parsed.paths.flatMap(p => p.toShapes());
    if (shapes.length === 0) return new THREE.BufferGeometry();

    /*
     * Extrusion depth, pulled back from the deep-3D experiment.
     *
     * depth 150 / bevelThickness 72 made the object read as over-modelled —
     * more like a rendered 3D exercise than the approved Blob S. These values
     * sit between that and the original 50/30: still clearly a solid with a
     * soft rounded edge, without the heavy sculpted look.
     *
     * `bevelSize` is back to 20 — it is the only value that widens the XY face,
     * so keeping it at the original figure holds the silhouette to the approved
     * outline and to the static SVG fallback.
     */
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: 80,
      bevelEnabled: true,
      bevelThickness: 42,
      bevelSize: 20,
      bevelSegments: 7,
      curveSegments: 26,
    });

    geo.scale(1, -1, 1);
    geo.computeBoundingBox();
    if (geo.boundingBox) {
      const c = new THREE.Vector3();
      geo.boundingBox.getCenter(c);
      geo.translate(-c.x, -c.y, -c.z);
    }
    geo.scale(0.01, 0.01, 0.01);
    return geo;
  } catch {
    return new THREE.BufferGeometry();
  }
}

// ── Module-level interpolated values ─────────────────────────────────────────
const cur = {
  x: 0, y: 0,
  xyScale: 1, depthScale: 1,
  rotX: 0, rotY: 0, rotZ: 0,
  opacity: 0,
  idleAmount: 0, pointerAmount: 0, pointerParallax: 0,
};

function resetCur() {
  cur.x = 0; cur.y = 0;
  cur.xyScale = 1; cur.depthScale = 1;
  cur.rotX = 0; cur.rotY = 0; cur.rotZ = 0;
  cur.opacity = 0;
  cur.idleAmount = 0; cur.pointerAmount = 0; cur.pointerParallax = 0;
}

// ── Component ─────────────────────────────────────────────────────────────────
interface BlobJourneyMeshProps {
  storeRef: React.MutableRefObject<BlobJourneyStore>;
  enablePointer: boolean;
}

export function BlobJourneyMesh({ storeRef, enablePointer }: BlobJourneyMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  // handoffComplete: true after the one-time atomic switch from static SVG to
  // WebGL mesh. Reset on unmount so canvas remounts (context restore) repeat
  // the same handoff correctly.
  const handoffComplete = useRef(false);

  // prevTargetOpacity: detects invisible → visible transitions for scene-entry
  // position snaps in post-handoff normal animation.
  const prevTargetOpacity = useRef(0);

  const geometry = useMemo(() => buildGeometry(), []);
  useEffect(() => {
    return () => {
      geometry.dispose();
      resetCur();
      handoffComplete.current = false;
      prevTargetOpacity.current = 0;
    };
  }, [geometry]);

  // ── Animation loop ────────────────────────────────────────────────────────
  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const mat  = matRef.current;
    const store = storeRef.current;
    if (!mesh || !mat) return;

    const t   = state.clock.elapsedTime;
    const cfg = SCENE_CONFIGS[store.targetScene];

    // ── Atomic handoff ────────────────────────────────────────────────────────
    //
    // Fires exactly once, as soon as both conditions are met:
    //   A. store.canvasReady = true   → set by FirstFrameSignal (Frame 1)
    //   B. store.targetScene ≠ 'hidden' → set by controller (also Frame 1 or 2)
    //
    // RAF-ordering guarantee (verified in controller implementation):
    //   The controller's setup RAF fires BEFORE R3F's Frame-2 useFrame loop.
    //   Therefore, when this block runs on Frame 2, the controller has ALREADY
    //   written targetScene, targetWorldX/Y, and targetScale to the store.
    //
    // This frame:
    //   1. Snap cur to the active slot (position + scale).
    //   2. Set neutral handoff rotation (0, 0, 0) — matches static SVG silhouette.
    //   3. Set mesh opacity to 1.
    //   4. Apply all values to Three.js mesh objects.
    //   5. Hide the active static SVG fallback atomically (display:none).
    //
    // Guarantee: mesh opacity = 1 BEFORE the SVG is hidden.
    //            No blank frame. No crossfade of different silhouettes.
    //
    // Following frames: animate gently from neutral pose to scene's target
    //                   rotation, depth scale, and idle state.
    if (!handoffComplete.current && store.canvasReady && store.targetScene !== 'hidden') {
      // 1–2. Snap position and neutral rotation into cur
      cur.x          = store.targetWorldX;
      cur.y          = store.targetWorldY;
      cur.xyScale    = store.targetScale;
      cur.depthScale = 1;   // face-on (no z extrusion emphasis)
      cur.rotX       = 0;
      cur.rotY       = 0;
      cur.rotZ       = 0;
      cur.idleAmount    = 0;
      cur.pointerAmount = 0;
      cur.pointerParallax = 0;

      // 3. Match the scene's own opacity — the static SVG fallback in each slot
      //    renders at the same value, so the swap is invisible in every scene,
      //    including the subtle background ones (Uncertainty, Decisions, …).
      cur.opacity = cfg.opacity;

      // 4. Apply directly to Three.js — no lerp
      mesh.position.set(cur.x, cur.y, 0);
      mesh.scale.set(cur.xyScale, cur.xyScale, cur.xyScale); // depthScale = 1
      mesh.rotation.set(0, 0, 0);
      mat.opacity = cur.opacity;

      // 5. Atomically hide the static SVG fallbacks
      hideFallbacks(store);

      handoffComplete.current = true;
      prevTargetOpacity.current = store.targetOpacity;
      return; // Next frames begin normal lerp animation from this neutral pose
    }

    // ── Normal animation (post-handoff) ───────────────────────────────────────
    //
    // All static SVGs are permanently hidden. The mesh follows the store's
    // target state via lerp. Scene-entry snap prevents visible cross-page travel
    // when the mesh transitions from invisible → visible.

    const wasInvisible = prevTargetOpacity.current < 0.01;
    const nowVisible   = store.targetOpacity > 0.01;
    if (wasInvisible && nowVisible && cur.opacity < 0.05) {
      cur.x       = store.targetWorldX;
      cur.y       = store.targetWorldY;
      cur.xyScale = store.targetScale;
    }
    prevTargetOpacity.current = store.targetOpacity;

    // Lerp speed: fast while fully hidden (invisible repositioning), normal otherwise
    const isHidden = cur.opacity < 0.005 && store.targetOpacity < 0.005;
    const spd = Math.min(delta * (isHidden ? 10 : 4), 0.3);

    // Position
    cur.x = THREE.MathUtils.lerp(cur.x, store.targetWorldX, spd);
    cur.y = THREE.MathUtils.lerp(cur.y, store.targetWorldY, spd);

    // Scale
    cur.xyScale    = THREE.MathUtils.lerp(cur.xyScale,    store.targetScale * cfg.visualScale, spd);
    cur.depthScale = THREE.MathUtils.lerp(cur.depthScale, cfg.depthScale, spd);

    // Rotation — lerps gently from neutral (0,0,0 set during handoff) toward
    // the scene's target rotation, giving a smooth settling-in animation
    cur.rotX = THREE.MathUtils.lerp(cur.rotX, cfg.rotationX, spd);
    cur.rotY = THREE.MathUtils.lerp(cur.rotY, cfg.rotationY, spd);
    cur.rotZ = THREE.MathUtils.lerp(cur.rotZ, cfg.rotationZ, spd);

    // Motion amounts
    cur.idleAmount    = THREE.MathUtils.lerp(cur.idleAmount,    cfg.idleAmount, spd);
    cur.pointerAmount = THREE.MathUtils.lerp(
      cur.pointerAmount,
      enablePointer ? cfg.pointerAmount : 0,
      spd,
    );
    cur.pointerParallax = THREE.MathUtils.lerp(
      cur.pointerParallax,
      enablePointer ? (cfg.pointerParallax ?? 0) : 0,
      spd,
    );

    // Opacity
    cur.opacity = THREE.MathUtils.lerp(cur.opacity, store.targetOpacity, spd);

    // Idle breathing
    const idleY = Math.sin(t * 0.35) * IDLE_Y_AMP * cur.idleAmount;
    const idleZ = Math.sin(t * 0.22 + 1.2) * IDLE_Z_AMP * cur.idleAmount;

    // Pointer tilt
    const pTiltX = enablePointer ? -store.pointer.y * POINTER_X_MAX * cur.pointerAmount : 0;
    const pTiltY = enablePointer ?  store.pointer.x * POINTER_Y_MAX * cur.pointerAmount : 0;

    /*
     * Parallax nudge — a few pixels, only for scenes that opt in.
     *
     * It earns its place because it does not shrink with the object: shifting
     * the blob moves its ENTIRE silhouette edge against the background, which
     * is a high-contrast change the eye catches even on the small Clarity blob,
     * where a rotation of the same magnitude barely registers. It lerps like
     * everything else, so releasing the cursor settles it back rather than
     * snapping.
     */
    const pPar = enablePointer ? POINTER_PARALLAX_MAX * cur.pointerParallax : 0;

    // Apply
    mesh.position.x = cur.x + store.pointer.x * pPar;
    mesh.position.y = cur.y + store.pointer.y * pPar;
    mesh.position.z = 0;

    mesh.scale.x = cur.xyScale;
    mesh.scale.y = cur.xyScale;
    mesh.scale.z = cur.xyScale * cur.depthScale;

    mesh.rotation.x = cur.rotX + pTiltX;
    mesh.rotation.y = cur.rotY + idleY + pTiltY;
    mesh.rotation.z = cur.rotZ + idleZ;

    mat.opacity = cur.opacity;
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      {/*
       * Soft-matte pink — meshStandardMaterial with a NoToneMapping renderer
       * (Canvas `flat`). color="#FF6FAE" is treated as sRGB by Three.js r152+
       * and output correctly.
       *
       * roughness 0.66 — softer than the 0.52 used during the deep-3D pass,
       * which produced a tight, almost lacquered highlight. This keeps a gentle
       * sheen across the bevel without the object looking polished.
       * No emissive, no bloom, no environment map.
       */}
      <meshStandardMaterial
        ref={matRef}
        color="#FF6FAE"
        roughness={0.66}
        metalness={0}
        side={THREE.FrontSide}
        transparent
        opacity={0}
      />
    </mesh>
  );
}
