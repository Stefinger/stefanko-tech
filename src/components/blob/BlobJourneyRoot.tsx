'use client';
import dynamic from 'next/dynamic';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useIsMobileViewport } from '@/lib/useIsMobileViewport';
import { BlobJourneyProvider } from './BlobJourneyContext';
import { BlobJourneyController } from './BlobJourneyController';

// Canvas is dynamically imported so it never runs on the server.
const BlobJourneyCanvas = dynamic(
  () => import('./BlobJourneyCanvas').then(m => m.BlobJourneyCanvas),
  { ssr: false },
);

interface BlobJourneyRootProps {
  children: React.ReactNode;
}

/**
 * Hosts the DESKTOP travelling Blob S journey.
 *
 * On mobile neither the controller nor the global canvas is mounted at all:
 * no scroll listener, no ResizeObserver, no cached slot geometry, no
 * always-on WebGL context. Mobile sections render their own local Blob S via
 * BlobSlot instead. That is what makes the menu, the collapsing Safari address
 * bar and scroll restoration structurally unable to move the mobile Blob S.
 *
 * The provider still wraps the tree so BlobSceneSlot can register on desktop
 * and so a resize across the breakpoint mounts the journey cleanly.
 */
export function BlobJourneyRoot({ children }: BlobJourneyRootProps) {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const desktopJourney = isMobile === false;

  return (
    <BlobJourneyProvider>
      {desktopJourney && (
        <>
          <BlobJourneyController reducedMotion={reducedMotion} />
          {/* Canvas is null when reducedMotion is true or WebGL fails */}
          <BlobJourneyCanvas reducedMotion={reducedMotion} />
        </>
      )}
      {children}
    </BlobJourneyProvider>
  );
}
