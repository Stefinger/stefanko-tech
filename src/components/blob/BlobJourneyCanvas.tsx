'use client';
import React, { useRef, useState, useCallback, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { RootState } from '@react-three/fiber';
import styled from 'styled-components';
import { setConsoleFunction as setThreeConsole } from 'three';
import { useBlobJourneyStore, restoreFallbacks } from './BlobJourneyContext';

// THREE.Clock was deprecated in Three.js r183. R3F v9 creates new THREE.Clock()
// internally during root initialisation, triggering this warning on every Canvas
// mount. Suppress it specifically without broadly silencing Three.js output.
// Remove this once R3F ships a release that uses THREE.Timer instead.
setThreeConsole((type, message, ...params) => {
  if (
    type === 'warn' &&
    typeof message === 'string' &&
    message === 'THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.'
  ) return;
  (console[type as 'warn' | 'log' | 'error'] as (...a: unknown[]) => void)(message, ...params);
});
import { BlobJourneyMesh } from './BlobJourneyMesh';
import { PX_PER_WU } from './blobJourneyConfig';

// ── Fixed viewport canvas — sits above section backgrounds, below text ────────
// z-index: 20 — above filter stacking contexts (blob slots at z-index: auto)
//             — below text/CTAs/labels (z-index: 30) and navbar (z-index: 100)
const CanvasWrap = styled.div`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 20;
`;

// ── First-frame signal — fires handleReady once WebGL renders a valid frame ──
function FirstFrameSignal({ onReady }: { onReady: () => void }) {
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    onReady();
  });
  return null;
}

// ── Canvas error boundary — catches WebGL initialisation failures ─────────────
interface EBProps {
  children: React.ReactNode;
  onError: () => void;
}
interface EBState { caught: boolean }

class CanvasErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { caught: false };
  static getDerivedStateFromError(): EBState { return { caught: true }; }
  componentDidCatch() { this.props.onError(); }
  render() {
    if (this.state.caught) return null;
    return this.props.children;
  }
}

// ── BlobJourneyCanvas ─────────────────────────────────────────────────────────
interface BlobJourneyCanvasProps {
  reducedMotion: boolean;
}

export function BlobJourneyCanvas({ reducedMotion }: BlobJourneyCanvasProps) {
  const storeRef = useBlobJourneyStore();
  const [webglError, setWebglError] = useState(false);

  // Detect client capabilities once (component is dynamic, ssr:false — window exists)
  const isMobile = window.matchMedia('(max-width: 991px)').matches;
  const enablePointer = window.matchMedia(
    '(hover: hover) and (pointer: fine) and (min-width: 992px)',
  ).matches;

  // handleReady: called by FirstFrameSignal on the first valid WebGL frame.
  // Marks the canvas as ready. BlobJourneyMesh performs the actual atomic
  // handoff (set opacity 1, then hide SVG) on the following frame, once the
  // controller has also set the active scene. This prevents any blank frame
  // where the SVG is hidden but the mesh is still at opacity 0.
  const handleReady = useCallback(() => {
    storeRef.current.canvasReady = true;
  }, [storeRef]);

  // handleError: restore static fallbacks before unmounting the canvas.
  // Called by the error boundary (React render error) or by context loss.
  const handleError = useCallback(() => {
    restoreFallbacks(storeRef.current);
    setWebglError(true);
  }, [storeRef]);

  // handleCreated: fires when the R3F renderer is set up.
  // Tone mapping is already disabled via the Canvas `flat` prop (NoToneMapping).
  // outputColorSpace is already 'srgb' by default in Three.js r152+.
  // We only need to register the context-loss listener here.
  const handleCreated = useCallback(
    (state: RootState) => {
      state.gl.domElement.addEventListener(
        'webglcontextlost',
        (e: Event) => {
          e.preventDefault();
          handleError();
        },
        { once: true },
      );
    },
    [handleError],
  );

  // ── Reduced motion: no canvas — static SVGs in slots handle it ───────────
  if (reducedMotion) return null;

  // ── WebGL error / context loss: canvas removed — static SVGs restored ────
  if (webglError) return null;

  return (
    <CanvasWrap>
      <CanvasErrorBoundary onError={handleError}>
        <Canvas
          flat          // THREE.NoToneMapping — prevents ACES from shifting #FF6FAE pink to burgundy
          orthographic
          // zoom: PX_PER_WU maps 1 world unit = 100 viewport pixels.
          // R3F auto-updates the OrthographicCamera frustum on canvas resize.
          camera={{ zoom: PX_PER_WU, near: 0.1, far: 200, position: [0, 0, 10] }}
          dpr={[1, isMobile ? 1.5 : 2]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'default',
          }}
          onCreated={handleCreated}
          style={{ background: 'transparent' }}
        >
          {/*
           * Studio lighting — balanced for NoToneMapping + SRGBColorSpace.
           *
           * Three.js applies physically-correct light units (r155+), so a
           * Lambertian surface reflects irradiance/π. Ambient therefore has to
           * be π-scaled to reach the true albedo at all.
           *
           * Back to a three-light setup. The fourth, rim light added during the
           * deep-3D pass drew a bright outline along the far edge, and that
           * highlight was the single biggest contributor to the object looking
           * over-worked. Ambient carries more of the surface again, so the blob
           * reads as brand pink first and as a solid second.
           *
           * ambientLight 1.55: surface colour, unmistakably brand pink
           * directional  1.25: principal form key, upper front-right
           * directional  0.55: warm bounce from below-left (pink-tinted)
           *
           * No emissive. No bloom.
           */}
          <ambientLight intensity={1.55} />
          <directionalLight position={[3, 5, 4]}   intensity={1.25} color="#ffffff" />
          <directionalLight position={[-2, -1, 2]} intensity={0.55} color="#ffc8dc" />

          <BlobJourneyMesh storeRef={storeRef} enablePointer={enablePointer} />

          <FirstFrameSignal onReady={handleReady} />
        </Canvas>
      </CanvasErrorBoundary>
    </CanvasWrap>
  );
}
