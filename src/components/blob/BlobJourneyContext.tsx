'use client';
import React, { createContext, useContext, useRef } from 'react';
import type { SceneName, SlotKey } from './blobJourneyConfig';

// ── Cached slot position (absolute document coords, not scroll-dependent) ────
export interface CachedSlot {
  absTop: number;
  absLeft: number;
  width: number;
  height: number;
}

// ── Fallback mode — single authority for static SVG visibility ───────────────
// 'initial-loading' : page just loaded, static SVG visible in active slot
// 'webgl-active'    : first valid frame rendered; all static SVGs hidden
// 'reduced-motion'  : canvas not mounted, static SVGs always visible
// 'webgl-error'     : canvas unmounted, static SVGs restored
export type FallbackMode =
  | 'initial-loading'
  | 'webgl-active'
  | 'reduced-motion'
  | 'webgl-error';

// ── Mutable store — written by Controller, read by Mesh in useFrame ──────────
export interface BlobJourneyStore {
  // Target scene state (updated by Controller via ScrollTrigger)
  targetScene: SceneName;
  targetOpacity: number;
  targetDepthScale: number;
  targetIdleAmount: number;
  targetPointerAmount: number;

  // Target world-space position and scale (recomputed on scene change + scroll)
  targetWorldX: number;
  targetWorldY: number;
  targetScale: number;

  // Live scroll position (updated by scroll listener — no reflow)
  scrollY: number;

  // Viewport dimensions (updated by resize handler)
  vpW: number;
  vpH: number;

  // Cached absolute positions per slot key (updated on mount + resize)
  cachedSlots: Partial<Record<SlotKey, CachedSlot>>;

  // Slot root DOM elements (registered by BlobSceneSlot for measurement)
  slots: Partial<Record<SlotKey, HTMLElement | null>>;

  // Static SVG fallback elements — hidden by Mesh once WebGL is ready
  // Restored on WebGL error or context loss
  fallbackRefs: Partial<Record<SlotKey, HTMLElement | null>>;

  // Pointer position normalised -1..1 (updated by pointermove)
  pointer: { x: number; y: number };

  // True once WebGL has rendered at least one valid frame
  canvasReady: boolean;

  // Current fallback visibility mode
  fallbackMode: FallbackMode;
}

function createStore(): BlobJourneyStore {
  return {
    targetScene: 'hidden',
    targetOpacity: 0,
    targetDepthScale: 1,
    targetIdleAmount: 0,
    targetPointerAmount: 0,
    targetWorldX: 0,
    targetWorldY: 0,
    targetScale: 1,
    scrollY: 0,
    vpW: typeof window !== 'undefined' ? window.innerWidth : 0,
    vpH: typeof window !== 'undefined' ? window.innerHeight : 0,
    cachedSlots: {},
    slots: {},
    fallbackRefs: {},
    pointer: { x: 0, y: 0 },
    canvasReady: false,
    fallbackMode: 'initial-loading',
  };
}

// ── Helpers — called by Mesh and Canvas to manage fallback visibility ─────────
export function hideFallbacks(store: BlobJourneyStore): void {
  store.fallbackMode = 'webgl-active';
  (Object.values(store.fallbackRefs) as (HTMLElement | null)[]).forEach(el => {
    if (el) el.style.display = 'none';
  });
}

export function restoreFallbacks(store: BlobJourneyStore): void {
  store.fallbackMode = 'webgl-error';
  (Object.values(store.fallbackRefs) as (HTMLElement | null)[]).forEach(el => {
    if (el) el.style.display = '';
  });
}

// ── Context ───────────────────────────────────────────────────────────────────
const BlobJourneyContext = createContext<React.MutableRefObject<BlobJourneyStore> | null>(null);

export function BlobJourneyProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<BlobJourneyStore>(createStore());
  return (
    <BlobJourneyContext.Provider value={storeRef}>
      {children}
    </BlobJourneyContext.Provider>
  );
}

export function useBlobJourneyStore(): React.MutableRefObject<BlobJourneyStore> {
  const ref = useContext(BlobJourneyContext);
  if (!ref) throw new Error('useBlobJourneyStore must be used inside BlobJourneyProvider');
  return ref;
}
