'use client';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { BLOB_S_D } from '@/components/canvas/BlobSMesh';
import { useBlobJourneyStore } from './BlobJourneyContext';
import type { SlotKey } from './blobJourneyConfig';

// ── Slot container — fills its parent, provides a measurement anchor ─────────
// The static SVG fallback is the source of truth during loading.
// BlobJourneyMesh hides it imperatively (via store.fallbackRefs) once WebGL
// is ready and the 3D blob is sufficiently opaque. Only one S silhouette
// is ever visible at a time.
const SlotRoot = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

/* $opacity mirrors the scene's WebGL opacity so the static fallback reads with
   the same presence as the 3D blob (reduced motion, pre-first-frame, WebGL error). */
const FallbackSVG = styled.svg<{ $opacity: number; $hideOnMobile: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  opacity: ${({ $opacity }) => $opacity};

  /*
   * Mirrors SCENE_CONFIGS[...].skipOnMobile for the static path — reduced
   * motion, pre-first-frame and WebGL-failure all render this SVG instead of
   * the mesh, and it must sit those sections out too.
   *
   * Only the artwork is hidden, never the slot root: the root is the
   * measurement anchor the controller reads, and collapsing it would strand
   * the blob's target position.
   */
  ${({ $hideOnMobile }) =>
    $hideOnMobile
      ? `@media (max-width: 768px) { display: none; }`
      : ''}
`;

interface BlobSceneSlotProps {
  slotKey: SlotKey;
  /** Static-fallback opacity — keep in sync with the scene config opacity. */
  fallbackOpacity?: number;
  /** Keep in sync with SCENE_CONFIGS[...].skipOnMobile for this slot's scene. */
  hideFallbackOnMobile?: boolean;
  className?: string;
}

export function BlobSceneSlot({
  slotKey,
  fallbackOpacity = 1,
  hideFallbackOnMobile = false,
  className,
}: BlobSceneSlotProps) {
  const storeRef = useBlobJourneyStore();
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const store = storeRef.current;
    // Register the slot root for position measurement
    store.slots[slotKey] = rootRef.current;
    // Register the static SVG fallback so Mesh can hide/show it imperatively
    store.fallbackRefs[slotKey] = svgRef.current as unknown as HTMLElement;

    return () => {
      store.slots[slotKey] = null;
      store.fallbackRefs[slotKey] = null;
    };
  }, [slotKey, storeRef]);

  return (
    <SlotRoot ref={rootRef} className={className} aria-hidden="true">
      {/*
       * Static SVG fallback — visible during:
       *   • initial page load (before first WebGL frame)
       *   • prefers-reduced-motion (canvas not mounted)
       *   • WebGL initialisation failure or context loss
       *
       * Hidden imperatively by BlobJourneyMesh via store.fallbackRefs
       * once the 3D blob has faded in. Never crossfades against the 3D
       * blob — the hide happens at the threshold where they look identical.
       */}
      <FallbackSVG
        ref={svgRef}
        $opacity={fallbackOpacity}
        $hideOnMobile={hideFallbackOnMobile}
        viewBox="0 0 590 780"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <path d={BLOB_S_D} fill="#FF6FAE" />
      </FallbackSVG>
    </SlotRoot>
  );
}
