'use client';
import React, { useRef, useState, useCallback, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { RootState } from '@react-three/fiber';
import { BlobSMesh, BLOB_S_D } from './BlobSMesh';

// ── Inline SVG fallback ───────────────────────────────────────────────────────
// Uses the same approved Blob S path as the 3D geometry so the silhouette is
// pixel-identical. Fill is the brand token #FF6FAE (not #FD618E from the Figma
// SVG export) so all states — loading, reduced-motion, error — match the 3D colour.
// Path geometry is not altered.
function StaticFallback({ hidden = false }: { hidden?: boolean }) {
  return (
    <svg
      viewBox="0 0 590 780"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: hidden ? 'none' : 'block',
      }}
      preserveAspectRatio="xMidYMid meet"
    >
      <path d={BLOB_S_D} fill="#FF6FAE" />
    </svg>
  );
}

// ── First-frame signal ────────────────────────────────────────────────────────
// A zero-output R3F component that fires onReady the first time useFrame runs.
// This guarantees WebGL has successfully rendered at least one valid frame before
// the static fallback is hidden.
function FirstFrameSignal({ onReady }: { onReady: () => void }) {
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    onReady();
  });
  return null;
}

// ── Canvas error boundary ─────────────────────────────────────────────────────
// Catches React render errors thrown by R3F (e.g. WebGL context creation failure).
// Returns null on error so the Canvas is cleanly unmounted.
// Calls onError so the parent can restore the static fallback.
interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError: () => void;
}

interface ErrorBoundaryState {
  caught: boolean;
}

class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { caught: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { caught: true };
  }

  componentDidCatch(): void {
    // Notify parent so it can switch to the static fallback
    this.props.onError();
  }

  render() {
    if (this.state.caught) return null;
    return this.props.children;
  }
}

// ── BlobSCanvas ───────────────────────────────────────────────────────────────
interface BlobSCanvasProps {
  reducedMotion: boolean;
}

export function BlobSCanvas({ reducedMotion }: BlobSCanvasProps) {
  // webglError: true when the canvas throws or a context-loss event fires.
  // Triggers a re-render to unmount the Canvas and restore the static fallback.
  const [webglError, setWebglError] = useState(false);

  // Ref to the fallback wrapper element — hidden imperatively on first WebGL
  // frame to avoid a React re-render that could introduce a blank frame.
  const fallbackWrapRef = useRef<HTMLDivElement>(null);

  // Detect client capabilities once at render time.
  // Safe: BlobSCanvas is loaded via next/dynamic (ssr:false), so window exists.
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const enablePointer = window.matchMedia(
    '(hover: hover) and (pointer: fine) and (min-width: 1101px)',
  ).matches;

  // Called by FirstFrameSignal on the very first rendered WebGL frame.
  // Direct DOM mutation (no state update) so no React re-render is scheduled,
  // which means there is zero risk of a blank frame between fallback-hide and
  // canvas-show — both happen in the same browser composite.
  const handleReady = useCallback(() => {
    if (fallbackWrapRef.current) {
      fallbackWrapRef.current.style.display = 'none';
    }
  }, []);

  const handleError = useCallback(() => setWebglError(true), []);

  // Attach the webglcontextlost listener once the Canvas gl object is available.
  const handleCreated = useCallback(
    (state: RootState) => {
      state.gl.domElement.addEventListener(
        'webglcontextlost',
        (e: Event) => {
          e.preventDefault(); // prevents browser from destroying the context
          handleError();
        },
        { once: true },
      );
    },
    [handleError],
  );

  // ── Reduced-motion path ───────────────────────────────────────────────────
  // Never mount WebGL. Show only the static approved SVG — no animation at all.
  if (reducedMotion) {
    return <StaticFallback />;
  }

  // ── WebGL error / context-loss path ──────────────────────────────────────
  // Canvas has been unmounted by the error boundary. Show static fallback only.
  if (webglError) {
    return <StaticFallback />;
  }

  // ── Normal path ──────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/*
       * Fallback wrapper — visible during loading and Canvas initialisation.
       * Hidden imperatively by handleReady on the first successful WebGL frame.
       * Uses a div wrapper so the ref targets a single node; the SVG inside
       * inherits position:absolute from StaticFallback.
       */}
      <div ref={fallbackWrapRef} style={{ position: 'absolute', inset: 0 }}>
        <StaticFallback />
      </div>

      <CanvasErrorBoundary onError={handleError}>
        <Canvas
          onCreated={handleCreated}
          camera={{ fov: 40, position: [0, 0, 12], near: 0.1, far: 100 }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            // alpha:true keeps the canvas background transparent.
            // Combined with the static SVG underneath, this means:
            //   • before ready: SVG shows through canvas (loading state)
            //   • after ready:  handleReady hides the SVG wrapper; only 3D renders
            //   • on error:     webglError state restores the standalone SVG
            alpha: true,
            powerPreference: 'default',
          }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          {/* ambient=1.0 ensures no face is ever darker than the material colour
              (#FF6FAE). Directional lights add form highlights only. No emissive. */}
          <ambientLight intensity={1.0} />
          <directionalLight position={[3, 5, 4]}  intensity={0.85} color="#ffffff" />
          <directionalLight position={[-2, -1, 2]} intensity={0.40} color="#ffc8dc" />

          <BlobSMesh enablePointer={enablePointer} isMobile={isMobile} />

          {/* Fires handleReady on the first rendered frame — hides the SVG fallback */}
          <FirstFrameSignal onReady={handleReady} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
