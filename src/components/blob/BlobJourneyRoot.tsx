'use client';
import dynamic from 'next/dynamic';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { BlobJourneyProvider } from './BlobJourneyContext';
import { BlobJourneyController } from './BlobJourneyController';

// Canvas is dynamically imported so it never runs on the server.
// It receives reducedMotion from BlobJourneyRoot so no separate hook is needed.
const BlobJourneyCanvas = dynamic(
  () => import('./BlobJourneyCanvas').then(m => m.BlobJourneyCanvas),
  { ssr: false },
);

interface BlobJourneyRootProps {
  children: React.ReactNode;
}

// Wrap the entire page so sections (Hero, Clarity, Final CTA) can access
// the store via useBlobJourneyStore(), and the canvas floats above them.
export function BlobJourneyRoot({ children }: BlobJourneyRootProps) {
  const reducedMotion = useReducedMotion();

  return (
    <BlobJourneyProvider>
      <BlobJourneyController reducedMotion={reducedMotion} />
      {/* Canvas is null when reducedMotion is true or WebGL fails */}
      <BlobJourneyCanvas reducedMotion={reducedMotion} />
      {children}
    </BlobJourneyProvider>
  );
}
