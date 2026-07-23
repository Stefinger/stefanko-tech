import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  // Initialise synchronously on the client so GSAP never starts animations
  // that should be skipped (avoids a one-frame flash on first render).
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    // The initializer already read the current value; only subscribe for changes.
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
