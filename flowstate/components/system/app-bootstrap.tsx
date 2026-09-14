'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store/app-store';

/**
 * Hydrates persisted state once on the client and mirrors the motion
 * preference onto <html> so CSS can act on it without a re-render.
 */
export function AppBootstrap() {
  const hydrate = useAppStore((state) => state.hydrate);
  const reducedMotion = useAppStore((state) => state.preferences.reducedMotion);
  const hydrated = useAppStore((state) => state.hydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    if (reducedMotion === null) root.removeAttribute('data-reduced-motion');
    else root.setAttribute('data-reduced-motion', String(reducedMotion));
  }, [reducedMotion, hydrated]);

  return null;
}
