'use client';
import { useEffect, useState } from 'react';
import { MOBILE_MAX_W } from '@/components/blob/blobJourneyConfig';

/**
 * True below the mobile breakpoint, false above, `null` until measured.
 *
 * The null phase matters: server render and first client render must agree, so
 * callers render nothing for the Blob S until the viewport is known. The blob is
 * decorative, and the WebGL canvas was already client-only, so there is no
 * visible cost to deciding one frame late.
 */
export function useIsMobileViewport(): boolean | null {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_W}px)`);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return isMobile;
}
