'use client';
import dynamic from 'next/dynamic';
import { BlobSceneSlot } from './BlobSceneSlot';
import { BlobStaticSvg } from './BlobStaticSvg';
import { useIsMobileViewport } from '@/lib/useIsMobileViewport';
import { useReducedMotion } from '@/lib/useReducedMotion';
import type { SlotKey } from './blobJourneyConfig';

const MobileBlobCanvas = dynamic(
  () => import('./MobileBlobCanvas').then(m => m.MobileBlobCanvas),
  { ssr: false },
);

/**
 * Decides which Blob S a section gets, per viewport.
 *
 * Desktop (> mobile breakpoint) is untouched: the section registers a slot with
 * the global travelling journey exactly as before.
 *
 * Mobile gets no travelling mesh at all. Only three sections show a Blob S —
 * Hero, Clarity and Final CTA — and each owns a self-contained, section-local
 * canvas. Everywhere else renders nothing, so there is no hidden mesh left
 * updating in the background.
 */
interface BlobSlotProps {
  /** Slot registered with the desktop journey. */
  slotKey: SlotKey;
  /** Whether this section shows a Blob S on mobile at all. */
  mobile: 'local' | 'none';
}

export function BlobSlot({ slotKey, mobile }: BlobSlotProps) {
  const isMobile = useIsMobileViewport();
  const reducedMotion = useReducedMotion();

  // Viewport not measured yet — render nothing so SSR and first client render
  // agree. One decorative frame late, no hydration mismatch.
  if (isMobile === null) return null;

  if (isMobile) {
    if (mobile === 'none') return null;
    // Reduced motion keeps the flat silhouette and mounts no WebGL context.
    if (reducedMotion) return <BlobStaticSvg />;
    return <MobileBlobCanvas fallback={<BlobStaticSvg />} />;
  }

  return <BlobSceneSlot slotKey={slotKey} />;
}
