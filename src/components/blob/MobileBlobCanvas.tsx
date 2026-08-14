'use client';
import { useRef, useMemo, useEffect, useState, useCallback, Component } from 'react';
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
 * The travel is back — the blob releases from its slot, drifts downward and
 * fades as the section leaves — but it is a LOCAL travel, expressed inside one
 * section's own canvas. Nothing is handed between sections and no mesh crosses
 * the document, so the three approved sections stay independent and the four
 * forbidden ones mount nothing at all.
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

/*
 * The canvas is larger than the slot; the blob is not.
 *
 * Horizontally this is just headroom for the bevel overhang and the Z tilt.
 * Vertically it is what makes the travel possible at all: the blob has to be
 * able to leave its slot and drift a long way down while it fades, and a canvas
 * cropped to the slot would cut it against a dead straight edge the moment it
 * detached. The mesh is fitted to the SLOT either way, so the blob renders at
 * exactly its approved size and the extra area is pure travel room.
 */
const BLEED_X = 0.24;
const BLEED_Y = 0.55;
const CANVAS_SCALE_X = 1 + BLEED_X * 2;
const CANVAS_SCALE_Y = 1 + BLEED_Y * 2;

const CanvasLayer = styled.div`
  position: absolute;
  inset: -${BLEED_Y * 100}% -${BLEED_X * 100}%;
  z-index: 1;
`;

/* Sits under the canvas. Visible until WebGL has actually painted, and again if
   the context is ever lost — so the slot is never empty on any device. */
const FallbackLayer = styled.div<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
`;

/*
 * How far the blob drifts once it releases, in world units (1 wu = 100 px), and
 * how much of the section's crossing it stays anchored for.
 *
 * SETTLE is expressed in `swing`, which runs -0.5 … 0.5 as the slot centre
 * crosses the viewport. Inside ±SETTLE the blob is anchored in its slot at full
 * opacity — that is the "arrived and settled" state. Outside it, the blob
 * releases downward and fades, reaching zero exactly as the slot reaches the
 * edge of the viewport, so it is always gone before the section is.
 */
const TRAVEL = 1.2;
const SETTLE = 0.24;

/*
 * The fade runs ahead of the travel.
 *
 * Tying opacity directly to distance put the blob at half strength exactly
 * where it had drifted onto the body copy below its slot, dragging a very
 * visible ghost across the text — the overlap the mobile motion rules exist to
 * prevent. Fading at 1.6× the travel rate means the blob is down to roughly a
 * tenth by the time it reaches the copy, while the first ~50 px of drift still
 * happen in plain sight, which is the part that reads as the release.
 */
const FADE_LEAD = 1.6;

function FittedBlob({
  animate,
  active,
  hostRef,
  layerRef,
  onPainted,
}: {
  animate: boolean;
  /** False while paused — off screen, or the menu is open. */
  active: boolean;
  hostRef: React.RefObject<HTMLDivElement | null>;
  layerRef: React.RefObject<HTMLDivElement | null>;
  onPainted: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const size = useThree(s => s.size);
  const geometry = useMemo(
    () => buildBlobGeometry({ bevelSegments: 5, curveSegments: 20 }),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  /* Camera zoom is PX_PER_WU, so one world unit is 100 px. The natural
     590 × 780 face is fitted to the SLOT — the bleed is divided back out — so
     the blob is framed exactly as the desktop journey frames it. */
  const scale = Math.min(
    size.width / CANVAS_SCALE_X / BLOB_NATURAL_W,
    size.height / CANVAS_SCALE_Y / BLOB_NATURAL_H,
  );

  // Smoothed section-local scroll progress. `null` means "not yet sampled", so
  // the first rendered frame adopts the true value instead of easing into it
  // from a guess — that is what stops a visible settle on mount and on resume.
  const progressRef = useRef<number | null>(null);

  /*
   * Every resume snaps to the truth instead of easing into it.
   *
   * While paused the mesh holds its last transform, and the damping would
   * otherwise spend ~150 ms sliding from that stale pose to the correct one —
   * visible as a flash of a nearly-opaque blob in the wrong place when you
   * scroll back into a section you left mid-fade, or when the menu closes after
   * the page moved. Discarding the smoothed value forces the next frame to
   * adopt the live measurement outright.
   */
  useEffect(() => {
    if (active) progressRef.current = null;
  }, [active]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    // Reported after the first real frame so the flat fallback underneath can
    // step aside only once WebGL is genuinely drawing.
    onPainted();
    mesh.scale.set(scale, scale, scale);
    if (!animate) {
      mesh.rotation.set(-0.05, 0.08, 0.02);
      mesh.position.set(0, 0, 0);
      if (layerRef.current) layerRef.current.style.opacity = '1';
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

    /*
     * Scroll turns the blob; idle breathing keeps it alive when scroll is still.
     *
     * These coefficients are the approved set from d5d296e, restored verbatim.
     * A later pass pushed them to ±27° / ±23 px and that read as a mechanically
     * rotating object rather than a shape moving through the composition — it
     * was rejected. Do not raise them again without asking: the balance here,
     * not the magnitude, is what was signed off.
     */
    mesh.rotation.x = -0.05 + swing * 0.16 + Math.sin(t * 0.28) * 0.012;
    mesh.rotation.y = 0.08 + swing * 0.62 + Math.sin(t * 0.35) * 0.04;
    mesh.rotation.z = 0.02 - swing * 0.1 + Math.sin(t * 0.22 + 1.2) * 0.016;

    /*
     * Release, travel, fade.
     *
     * `away` is 0 while the slot sits in the settle band and ramps to 1 as it
     * reaches the edge of the viewport. Smoothstepped so the blob holds its
     * anchored position, then eases into the drift rather than starting to
     * slide the instant it leaves centre — that easing is what separates a
     * release from a hard cut.
     *
     * The drift is always downward, on both sides of the band. Approaching, the
     * blob rises out of the drift into its slot and settles; leaving, it falls
     * back out of it. Same gesture in both directions, so a section reads the
     * same whether it is scrolled into or out of.
     */
    const away = Math.min(1, Math.max(0, (Math.abs(swing) - SETTLE) / (0.5 - SETTLE)));
    const eased = away * away * (3 - 2 * away);

    // Approved 12 px micro-parallax while settled, plus the travel once released.
    mesh.position.y = swing * 0.24 - eased * TRAVEL;

    /*
     * Faded on the canvas element, not the material. The extruded S overlaps
     * itself in projection once rotated, so a transparent material would show
     * its own back faces through the front ones. Fading the whole layer treats
     * the rendered blob as the single flat image it visually is, and is a
     * compositor-only change — no layout is invalidated, so the per-frame rect
     * read at the top of this function stays cheap.
     */
    if (layerRef.current) {
      layerRef.current.style.opacity = String(1 - Math.min(1, eased * FADE_LEAD));
    }
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
  /** Shown until WebGL paints, and again if the context is lost. */
  fallback: React.ReactNode;
}

export function MobileBlobCanvas({ animate = true, fallback }: MobileBlobCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [painted, setPainted] = useState(false);
  const menuOpen = useMenuOpen();

  // Ref-guarded so the per-frame call costs nothing after the first frame.
  const paintedRef = useRef(false);
  const markPainted = useCallback(() => {
    if (paintedRef.current) return;
    paintedRef.current = true;
    setPainted(true);
  }, []);
  const clearPainted = useCallback(() => {
    paintedRef.current = false;
    setPainted(false);
  }, []);

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

  /*
   * Context loss is recoverable, not terminal.
   *
   * iOS Safari drops WebGL contexts on memory pressure and after backgrounding,
   * and a page with three of them is a realistic candidate. Preventing the
   * default keeps the context restorable, and both edges are handled: the flat
   * silhouette comes back the moment drawing stops, and steps aside again once
   * a real frame has been painted. Listeners are not `once` — a device can lose
   * a context more than one time in a session.
   */
  const handleCreated = (state: RootState) => {
    const el = state.gl.domElement;
    el.addEventListener('webglcontextlost', (e: Event) => {
      e.preventDefault();
      clearPainted();
    });
    el.addEventListener('webglcontextrestored', clearPainted);
  };

  return (
    <Wrap ref={wrapRef} aria-hidden="true">
      {/* Under the canvas. The slot is never empty: if WebGL never paints — no
          context, a lost context, a zero-sized drawing buffer — the approved
          flat Blob S stays in the composition instead of nothing at all. */}
      <FallbackLayer $visible={!painted}>{fallback}</FallbackLayer>

      <CanvasErrorBoundary onError={clearPainted}>
        <CanvasLayer ref={layerRef} data-blob-layer="">
        <Canvas
          flat
          orthographic
          camera={{ zoom: PX_PER_WU, near: 0.1, far: 200, position: [0, 0, 10] }}
          dpr={[1, 1.5]}
          /* Runs until the first frame lands so the handover happens off-screen,
             then falls back to rendering only while on screen and menu-free. */
          frameloop={active || !painted ? 'always' : 'never'}
          gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
          onCreated={handleCreated}
          style={{ background: 'transparent' }}
        >
          {/* Same three-light rig as the desktop journey. */}
          <ambientLight intensity={1.55} />
          <directionalLight position={[3, 5, 4]} intensity={1.25} color="#ffffff" />
          <directionalLight position={[-2, -1, 2]} intensity={0.55} color="#ffc8dc" />
          <FittedBlob
            animate={animate}
            active={active}
            hostRef={wrapRef}
            layerRef={layerRef}
            onPainted={markPainted}
          />
        </Canvas>
        </CanvasLayer>
      </CanvasErrorBoundary>
    </Wrap>
  );
}
