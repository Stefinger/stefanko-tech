'use client';
import { useSyncExternalStore } from 'react';

/**
 * Whether the mobile menu is open.
 *
 * Deliberately a tiny standalone store rather than context or a prop chain, so
 * that the only thing the menu can ever do to the Blob S is PAUSE it. The blob
 * subscribes to this to stop rendering while the overlay covers the page; it
 * never reads it when deriving position. That separation is the point — the
 * previous real-device bug was the menu indirectly feeding geometry (body
 * scroll-lock, visualViewport resize) into a blob that cached its position.
 */
let open = false;
const listeners = new Set<() => void>();

export function setMenuOpen(next: boolean) {
  if (next === open) return;
  open = next;
  listeners.forEach(l => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

const getSnapshot = () => open;
/* The menu cannot be open during SSR. */
const getServerSnapshot = () => false;

export function useMenuOpen(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
