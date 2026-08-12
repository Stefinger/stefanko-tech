'use client';
import { useRef, useMemo, useEffect, useState, Component } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { RootState } from '@react-three/fiber';
import * as THREE from 'three';
import styled from 'styled-components';
import { buildBlobGeometry } from './blobGeometry';
import { BLOB_NATURAL_W, BLOB_NATURAL_H, PX_PER_WU } from './blobJourneyConfig';

/**
 * Section-local Blob S for mobile.
 *
 * The desktop journey is one fixed, full-viewport canvas whose mesh is driven
 * by scroll position across every section. On iPhone that architecture was the
 * source of every reported bug: the mesh re-derived its scene and slot position
 * from cached rects on each scroll event, so a body scroll-lock (opening the
 * menu), a visualViewport change (Safari's collapsing address bar) or a
 * scroll-restoration jump could all leave it resolving against stale geometry —
 * hence the S landing mid-paragraph or in the wrong section.
 *
 * This component removes the class of bug rather than patching it. Each
 * instance:
 *   • lives INSIDE its own section, so its position is plain layout — there is
 *     no scroll maths, no cached rects and nothing to re-sync,
 *   • renders only while on screen (IntersectionObserver toggles `frameloop`),
 *     so at most one Blob S is doing GPU work at a time and none of them run
 *     while scrolling past other sections,
 *   • has no shared state, so the menu, scroll position and viewport height
 *     cannot move it.
 */

const Wrap = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

/* Sizes the mesh to the canvas exactly as the journey does: camera zoom is
   PX_PER_WU, so one world unit is 100 px, and the natural 590 × 780 face is
   fitted to the slot with the same min() rule. Identical framing, no scroll. */
function FittedBlob({ animate }: { animate: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const size = useThree(s => s.size);
  const geometry = useMemo(
    () => buildBlobGeometry({ bevelSegments: 5, curveSegments: 20 }),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  const scale = Math.min(size.width / BLOB_NATURAL_W, size.height / BLOB_NATURAL_H);

  useFrame(state => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.scale.set(scale, scale, scale);
    if (!animate) {
      mesh.rotation.set(-0.05, 0.08, 0.02);
      return;
    }
    // Local idle breathing only — no scroll input, no pointer input.
    const t = state.clock.elapsedTime;
    mesh.rotation.x = -0.05 + Math.sin(t * 0.28) * 0.015;
    mesh.rotation.y = 0.08 + Math.sin(t * 0.35) * 0.05;
    mesh.rotation.z = 0.02 + Math.sin(t * 0.22 + 1.2) * 0.02;
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color="#FF6FAE"
        roughness={0.66}
        metalness={0}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

interface EBProps { children: React.ReactNode; onError: () => void }
class CanvasErrorBoundary extends Component<EBProps, { caught: boolean }> {
  state = { caught: false };
  static getDerivedStateFromError() { return { caught: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.caught ? null : this.props.children; }
}

interface MobileBlobCanvasProps {
  /** Static pose instead of idle breathing (prefers-reduced-motion). */
  animate?: boolean;
  /** Rendered if WebGL is unavailable or the context is lost. */
  fallback: React.ReactNode;
}

export function MobileBlobCanvas({ animate = true, fallback }: MobileBlobCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  // Only the on-screen instance renders frames. rootMargin starts it slightly
  // early so it is never caught mid-fade at the edge of the viewport.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '15% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleCreated = (state: RootState) => {
    state.gl.domElement.addEventListener(
      'webglcontextlost',
      (e: Event) => { e.preventDefault(); setFailed(true); },
      { once: true },
    );
  };

  if (failed) return <>{fallback}</>;

  return (
    <Wrap ref={wrapRef} aria-hidden="true">
      <CanvasErrorBoundary onError={() => setFailed(true)}>
        <Canvas
          flat
          orthographic
          camera={{ zoom: PX_PER_WU, near: 0.1, far: 200, position: [0, 0, 10] }}
          dpr={[1, 1.5]}
          frameloop={visible ? 'always' : 'never'}
          gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
          onCreated={handleCreated}
          style={{ background: 'transparent' }}
        >
          {/* Same three-light rig as the desktop journey. */}
          <ambientLight intensity={1.55} />
          <directionalLight position={[3, 5, 4]} intensity={1.25} color="#ffffff" />
          <directionalLight position={[-2, -1, 2]} intensity={0.55} color="#ffc8dc" />
          <FittedBlob animate={animate} />
        </Canvas>
      </CanvasErrorBoundary>
    </Wrap>
  );
}
