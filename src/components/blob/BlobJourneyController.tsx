'use client';
import { useEffect, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from '@/lib/gsap';
import { useBlobJourneyStore } from './BlobJourneyContext';
import {
  SCENE_CONFIGS,
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

// ── Controller component ──────────────────────────────────────────────────────
interface BlobJourneyControllerProps {
  reducedMotion: boolean;
}

export function BlobJourneyController({ reducedMotion }: BlobJourneyControllerProps) {
  const storeRef = useBlobJourneyStore();

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

  // Update target world position from cached slot + current scrollY
  const syncTargetPosition = useCallback((scene: SceneName) => {
    const store = storeRef.current;
    if (scene === 'hidden') return;
    const slotKey = getSlotKeyForScene(scene, store.vpW);
    const cached = store.cachedSlots[slotKey];
    if (!cached) {
      // Slot not cached yet — try live measure
      const el = store.slots[slotKey];
      if (el) {
        const fresh = measureSlotAbsolute(el);
        if (fresh) {
          store.cachedSlots[slotKey] = fresh;
          const pos = computeWorldPos(fresh, store.scrollY, store.vpW, store.vpH);
          store.targetWorldX = pos.worldX;
          store.targetWorldY = pos.worldY;
          store.targetScale  = pos.scale;
        }
      }
      return;
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

    store.targetScene       = scene;
    store.targetOpacity     = cfg.opacity;
    store.targetDepthScale  = cfg.depthScale;
    store.targetIdleAmount  = cfg.idleAmount;
    store.targetPointerAmount = cfg.pointerAmount;

    syncTargetPosition(scene);
  }, [storeRef, syncTargetPosition]);

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

  // ── Scroll listener — updates scrollY + resyncs active scene position ─────
  useEffect(() => {
    if (reducedMotion) return;
    const store = storeRef.current;

    const onScroll = () => {
      store.scrollY = window.scrollY;
      if (store.targetScene !== 'hidden') {
        syncTargetPosition(store.targetScene);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reducedMotion, storeRef, syncTargetPosition]);

  // ── ResizeObserver — re-caches slots, updates viewport, resyncs ──────────
  useEffect(() => {
    if (reducedMotion) return;
    const store = storeRef.current;

    const update = () => {
      store.vpW   = window.innerWidth;
      store.vpH   = window.innerHeight;
      store.scrollY = window.scrollY;
      cacheAllSlots();
      if (store.targetScene !== 'hidden') {
        syncTargetPosition(store.targetScene);
      }
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
  }, [reducedMotion, storeRef, cacheAllSlots, syncTargetPosition]);

  // ── ScrollTrigger setup ───────────────────────────────────────────────────
  useGSAP(() => {
    if (reducedMotion) return;

    const store = storeRef.current;

    // Init viewport
    store.vpW    = window.innerWidth;
    store.vpH    = window.innerHeight;
    store.scrollY = window.scrollY;

    // Wait one frame for slots to register and positions to settle
    const setup = () => {
      cacheAllSlots();

      const heroEl    = document.querySelector('[data-scene-section="hero"]')    as HTMLElement | null;
      const clarityEl = document.querySelector('[data-scene-section="clarity"]') as HTMLElement | null;
      const finalEl   = document.querySelector('[data-scene-section="final"]')   as HTMLElement | null;

      if (!heroEl || !clarityEl || !finalEl) return;

      // ── Hero: visible at page top, hide as Hero exits viewport ────────────
      ScrollTrigger.create({
        trigger: heroEl,
        start: 'top top',
        end: 'bottom top',
        onEnter:     () => setScene('hero'),
        onLeave:     () => setScene('hidden'),
        onEnterBack: () => setScene('hero'),
        // onLeaveBack fires when scrolled above Hero — shouldn't happen
      });

      // ── Clarity: fade in as section approaches, fade out on exit ─────────
      ScrollTrigger.create({
        trigger: clarityEl,
        start: 'top 85%',
        end: 'bottom top',
        onEnter:     () => setScene('clarity'),
        onLeave:     () => setScene('hidden'),
        onEnterBack: () => setScene('clarity'),
        onLeaveBack: () => setScene('hidden'),
      });

      // ── Final CTA: fade in on approach, hide after section exits ─────────
      ScrollTrigger.create({
        trigger: finalEl,
        start: 'top 80%',
        end: 'bottom top',
        onEnter:     () => setScene('final'),
        onLeave:     () => setScene('hidden'),
        onEnterBack: () => setScene('final'),
        onLeaveBack: () => setScene('hidden'),
      });

      // Determine initial scene based on current scroll position
      const scrollY = window.scrollY;
      if (clarityEl && scrollY >= clarityEl.offsetTop - window.innerHeight * 0.85 &&
          scrollY < clarityEl.offsetTop + clarityEl.offsetHeight) {
        setScene('clarity');
      } else if (finalEl && scrollY >= finalEl.offsetTop - window.innerHeight * 0.8 &&
          scrollY < finalEl.offsetTop + finalEl.offsetHeight) {
        setScene('final');
      } else if (heroEl && scrollY < heroEl.offsetTop + heroEl.offsetHeight) {
        setScene('hero');
      } else {
        setScene('hidden');
      }

      ScrollTrigger.refresh();
    };

    // A single RAF ensures layout is complete and all child useEffects have run
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(setup);
    });

    return () => cancelAnimationFrame(raf);
  }, { dependencies: [reducedMotion], revertOnUpdate: true });

  // ── Font-load and hash-navigation resync ─────────────────────────────────
  useEffect(() => {
    if (reducedMotion) return;
    const store = storeRef.current;

    const onHashChange = () => {
      // After hash-jump, let browser scroll settle then refresh
      requestAnimationFrame(() => {
        store.scrollY = window.scrollY;
        cacheAllSlots();
        ScrollTrigger.refresh();
        if (store.targetScene !== 'hidden') {
          syncTargetPosition(store.targetScene);
        }
      });
    };

    window.addEventListener('hashchange', onHashChange);
    document.fonts.ready.then(() => {
      store.scrollY = window.scrollY;
      cacheAllSlots();
      ScrollTrigger.refresh();
      if (store.targetScene !== 'hidden') {
        syncTargetPosition(store.targetScene);
      }
    });

    return () => window.removeEventListener('hashchange', onHashChange);
  }, [reducedMotion, storeRef, cacheAllSlots, syncTargetPosition]);

  // Renders nothing — pure controller logic
  return null;
}
