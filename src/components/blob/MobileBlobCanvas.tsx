'use client';
import { useRef, useMemo, useEffect, useState, Component } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { RootState } from '@react-three/fiber';
import * as THREE from 'three';
import styled from 'styled-components';
import { buildBlobGeometry } from './blobGeometry';
import { useMenuOpen } from '@/lib/menuOpenState';
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
 *   • lives INSIDE its own section, so where it sits on the page is plain
 *     layout — the mesh is centred in its own slot and never travels,
 *   • still reacts to scroll, but only through its OWN live rect, sampled
 *     fresh each rendered frame and never stored between them, so there is no
 *     cached geometry that a scroll-lock or viewport resize could invalidate,
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
   fitted to the slot with the same min() rule. Identical framing. */
function FittedBlob({
  animate,
  hostRef,
}: {
  animate: boolean;
  hostRef: React.RefObject<HTMLDivElement | null>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const size = useThree(s => s.size);
  const geometry = useMemo(
    () => buildBlobGeometry({ bevelSegments: 5, curveSegments: 20 }),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  const scale = Math.min(size.width / BLOB_NATURAL_W, size.height / BLOB_NATURAL_H);

  // Smoothed section-local scroll progress. `null` means "not yet sampled", so
  // the first rendered frame adopts the true value instead of easing into it
  // from a guess — that is what stops a visible settle on mount and on resume.
  const progressRef = useRef<number | null>(null);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.scale.set(scale, scale, scale);
    if (!animate) {
      mesh.rotation.set(-0.05, 0.08, 0.02);
      mesh.position.set(0, 0, 0);
      return;
    }

    /*
     * Scroll progress is measured fresh from this slot's own live rect every
     * rendered frame. Nothing is cached and nothing is shared, which is the
     * whole reason the blob cannot be corrupted any more: a body scroll-lock,
     * an address-bar resize or a scroll restoration cannot leave a stale value
     * behind, because there is no stored value to go stale. The next frame
     * after any of those simply reads the truth again.
     *
     * One getBoundingClientRect per frame, on one element, and only while this
     * section is on screen and the menu is closed. Transform writes elsewhere
     * on the page are composited and do not dirty layout, so this read almost
     * never forces a reflow.
     */
    const host = hostRef.current;
    let target = 0.5;
    if (host) {
      const rect = host.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 as the slot centre enters from the bottom, 1 as it leaves the top.
      const raw = 1 - (rect.top + rect.height / 2) / vh;
      target = raw < 0 ? 0 : raw > 1 ? 1 : raw;
    }

    if (progressRef.current === null) {
      progressRef.current = target;
    } else {
      // Frame-rate independent damping — coarse iOS scroll events would
      // otherwise read as steps. Delta is clamped so a long pause (menu open,
      // tab backgrounded) resolves in one snap rather than a slow slide.
      const dt = Math.min(delta, 0.1);
      progressRef.current += (target - progressRef.current) * (1 - Math.pow(0.0015, dt));
    }

    const p = progressRef.current;
    const swing = p - 0.5; // -0.5 … 0.5 across the section's travel
    const t = state.clock.elapsedTime;

    // Scroll turns the blob; idle breathing keeps it alive when scroll is still.
    mesh.rotation.x = -0.05 + swing * 0.16 + Math.sin(t * 0.28) * 0.012;
    mesh.rotation.y = 0.08 + swing * 0.62 + Math.sin(t * 0.35) * 0.04;
    mesh.rotation.z = 0.02 - swing * 0.1 + Math.sin(t * 0.22 + 1.2) * 0.016;
    // Slight counter-drift within the slot — 12 px of parallax at most, well
    // inside the slot bounds so it can never reach the copy beside it.
    mesh.position.y = swing * 0.24;
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
  const menuOpen = useMenuOpen();

  /*
   * Rendering stops while the menu is open, and resumes on close.
   *
   * Pausing is safe precisely because position is never stored: the mesh holds
   * its last transform while frozen, and the first frame after close re-derives
   * that same transform from live layout. If the page has not moved the result
   * is identical, so there is nothing to jump. If a menu link scrolled the page,
   * the blob is already correct for wherever it now sits.
   */
  const active = visible && !menuOpen;

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
          frameloop={active ? 'always' : 'never'}
          gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
          onCreated={handleCreated}
          style={{ background: 'transparent' }}
        >
          {/* Same three-light rig as the desktop journey. */}
          <ambientLight intensity={1.55} />
          <directionalLight position={[3, 5, 4]} intensity={1.25} color="#ffffff" />
          <directionalLight position={[-2, -1, 2]} intensity={0.55} color="#ffc8dc" />
          <FittedBlob animate={animate} hostRef={wrapRef} />
        </Canvas>
      </CanvasErrorBoundary>
    </Wrap>
  );
}
