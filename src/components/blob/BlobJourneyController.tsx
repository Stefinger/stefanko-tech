'use client';
import { useEffect, useCallback, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from '@/lib/gsap';
import { useBlobJourneyStore } from './BlobJourneyContext';
import {
  SCENE_CONFIGS,
  SCENE_ORDER,
  MOBILE_MAX_W,
  PX_PER_WU,
  BLOB_NATURAL_W,
  BLOB_NATURAL_H,
  getSlotKeyForScene,
} from './blobJourneyConfig';
import type { SceneName, SlotKey } from './blobJourneyConfig';
import type { CachedSlot } from './BlobJourneyContext';

// ── Slot caching helpers ──────────────────────────────────────────────────────

function measureSlotAbsolute(el: HTMLElement): CachedSlot | null {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;
  return {
    absTop: rect.top + window.scrollY,
    absLeft: rect.left, // this site never scrolls horizontally
    width: rect.width,
    height: rect.height,
  };
}

function computeWorldPos(
  slot: CachedSlot,
  scrollY: number,
  vpW: number,
  vpH: number,
) {
  const vCenterX = slot.absLeft + slot.width / 2;
  const vCenterY = slot.absTop + slot.height / 2 - scrollY;
  return {
    worldX: (vCenterX - vpW / 2) / PX_PER_WU,
    worldY: -(vCenterY - vpH / 2) / PX_PER_WU,
    scale: Math.min(slot.width / BLOB_NATURAL_W, slot.height / BLOB_NATURAL_H),
  };
}

// ── Section band cache — used to resolve the active scene from scrollY ────────
// One band per scene section, in document order. Bands are contiguous because
// the sections themselves are contiguous, so exactly one scene is active at any
// scroll position — the Blob S is never orphaned between sections.
interface SceneBand {
  scene: Exclude<SceneName, 'hidden'>;
  top: number;    // absolute document Y of the section top
  bottom: number; // absolute document Y of the section bottom
}

// ── Controller component ──────────────────────────────────────────────────────
interface BlobJourneyControllerProps {
  reducedMotion: boolean;
}

export function BlobJourneyController({ reducedMotion }: BlobJourneyControllerProps) {
  const storeRef = useBlobJourneyStore();
  const bandsRef = useRef<SceneBand[]>([]);

  // Re-cache all currently registered slot positions
  const cacheAllSlots = useCallback(() => {
    const store = storeRef.current;
    (Object.keys(store.slots) as SlotKey[]).forEach(key => {
      const el = store.slots[key];
      if (!el) return;
      const cached = measureSlotAbsolute(el);
      if (cached) store.cachedSlots[key] = cached;
    });
  }, [storeRef]);

  // Re-cache the scroll bands of every scene section
  const cacheAllBands = useCallback(() => {
    const bands: SceneBand[] = [];
    SCENE_ORDER.forEach(scene => {
      const el = document.querySelector<HTMLElement>(`[data-scene-section="${scene}"]`);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      bands.push({ scene, top, bottom: top + rect.height });
    });
    bandsRef.current = bands;
  }, []);

  // Which scene owns the given scroll position?
  // The probe point is the vertical centre of the viewport, so the handover
  // between two sections happens exactly when their shared edge crosses it.
  const resolveScene = useCallback((scrollY: number, vpH: number): SceneName => {
    const bands = bandsRef.current;
    if (bands.length === 0) return 'hidden';
    const probe = scrollY + vpH * 0.5;
    if (probe < bands[0].top) return bands[0].scene;
    for (const band of bands) {
      if (probe < band.bottom) return band.scene;
    }
    // Past the last section (footer) — stay with the closing scene
    return bands[bands.length - 1].scene;
  }, []);

  // Update target world position from cached slot + current scrollY
  const syncTargetPosition = useCallback((scene: SceneName) => {
    const store = storeRef.current;
    const slotKey = getSlotKeyForScene(scene, store.vpW);
    if (!slotKey) return;

    let cached = store.cachedSlots[slotKey];
    if (!cached) {
      // Slot not cached yet — try a live measure
      const el = store.slots[slotKey];
      if (!el) return;
      const fresh = measureSlotAbsolute(el);
      if (!fresh) return;
      store.cachedSlots[slotKey] = fresh;
      cached = fresh;
    }

    const pos = computeWorldPos(cached, store.scrollY, store.vpW, store.vpH);
    store.targetWorldX = pos.worldX;
    store.targetWorldY = pos.worldY;
    store.targetScale  = pos.scale;
  }, [storeRef]);

  // Activate a scene: update opacity and rotation targets, sync position
  const setScene = useCallback((scene: SceneName) => {
    const store = storeRef.current;
    const cfg = SCENE_CONFIGS[scene];

    // Sections the travelling blob sits out on phones. Position still tracks
    // the slot, so when it fades back in for the next scene it is already in
    // the right place — nothing flies across the page.
    const skipped = Boolean(cfg.skipOnMobile) && store.vpW <= MOBILE_MAX_W;

    store.targetScene         = scene;
    store.targetOpacity       = skipped ? 0 : cfg.opacity;
    store.targetDepthScale    = cfg.depthScale;
    store.targetIdleAmount    = cfg.idleAmount;
    store.targetPointerAmount = cfg.pointerAmount;

    syncTargetPosition(scene);
  }, [storeRef, syncTargetPosition]);

  // Resolve + apply the scene for the current scroll position.
  //
  // `force` re-applies the full scene config even when the scene has not
  // changed. Needed after a resize: crossing the mobile breakpoint flips
  // `skipOnMobile` for the CURRENT scene, and a scroll-only sync would keep
  // the stale opacity.
  const syncScene = useCallback((force = false) => {
    const store = storeRef.current;
    const next = resolveScene(store.scrollY, store.vpH);
    if (force || next !== store.targetScene) {
      setScene(next);
    } else {
      syncTargetPosition(next);
    }
  }, [storeRef, resolveScene, setScene, syncTargetPosition]);

  // ── Pointer listener ──────────────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion) return;
    const store = storeRef.current;
    const hasPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!hasPointer) return;

    const onMove = (e: PointerEvent) => {
      const vw = store.vpW || window.innerWidth;
      const vh = store.vpH || window.innerHeight;
      store.pointer.x =  (e.clientX / vw) * 2 - 1;
      store.pointer.y = -((e.clientY / vh) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reducedMotion, storeRef]);

  // ── Scroll listener — updates scrollY, resolves scene, resyncs position ───
  useEffect(() => {
    if (reducedMotion) return;
    const store = storeRef.current;

    const onScroll = () => {
      store.scrollY = window.scrollY;
      syncScene(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reducedMotion, storeRef, syncScene]);

  // ── ResizeObserver — re-caches slots and bands, updates viewport, resyncs ──
  useEffect(() => {
    if (reducedMotion) return;
    const store = storeRef.current;

    const update = () => {
      store.vpW     = window.innerWidth;
      store.vpH     = window.innerHeight;
      store.scrollY = window.scrollY;
      cacheAllSlots();
      cacheAllBands();
      syncScene(true);
      ScrollTrigger.refresh();
    };

    // Observe all registered slot elements
    const ro = new ResizeObserver(update);
    const observeRegistered = () => {
      (Object.values(store.slots) as (HTMLElement | null)[]).forEach(el => {
        if (el) ro.observe(el);
      });
    };

    window.addEventListener('resize', update, { passive: true });

    // Delay one tick so useEffect in BlobSceneSlot components can register slots
    const tid = setTimeout(() => {
      observeRegistered();
      update();
    }, 0);

    return () => {
      clearTimeout(tid);
      window.removeEventListener('resize', update);
      ro.disconnect();
    };
  }, [reducedMotion, storeRef, cacheAllSlots, cacheAllBands, syncScene]);

  // ── Initial setup — runs after layout has settled ─────────────────────────
  useGSAP(() => {
    if (reducedMotion) return;

    const store = storeRef.current;

    store.vpW     = window.innerWidth;
    store.vpH     = window.innerHeight;
    store.scrollY = window.scrollY;

    // A single RAF ensures layout is complete and all child useEffects have run
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        cacheAllSlots();
        cacheAllBands();
        syncScene();
        ScrollTrigger.refresh();
      });
    });

    return () => cancelAnimationFrame(raf);
  }, { dependencies: [reducedMotion], revertOnUpdate: true });

  // ── Font-load, ScrollTrigger-refresh and hash-navigation resync ───────────
  useEffect(() => {
    if (reducedMotion) return;
    const store = storeRef.current;

    const resync = () => {
      store.scrollY = window.scrollY;
      cacheAllSlots();
      cacheAllBands();
      syncScene();
    };

    const onHashChange = () => {
      // After a hash jump, let the browser scroll settle then refresh
      requestAnimationFrame(() => {
        resync();
        ScrollTrigger.refresh();
      });
    };

    // Section heights change as GSAP entrance timelines register — every
    // ScrollTrigger.refresh() (from any section) re-measures the bands too.
    ScrollTrigger.addEventListener('refresh', resync);
    window.addEventListener('hashchange', onHashChange);
    document.fonts.ready.then(() => {
      resync();
      ScrollTrigger.refresh();
    });

    return () => {
      ScrollTrigger.removeEventListener('refresh', resync);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [reducedMotion, storeRef, cacheAllSlots, cacheAllBands, syncScene]);

  // Renders nothing — pure controller logic
  return null;
}
