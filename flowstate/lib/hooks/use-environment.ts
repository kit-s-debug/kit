'use client';

import { useSyncExternalStore } from 'react';
import type { SpeechCapability } from '@/types';
import { detectSpeechCapability } from '@/services/speech';

/**
 * Browser facts the UI needs during render.
 *
 * These come through `useSyncExternalStore` rather than an effect: the values
 * exist before the first paint on the client, have a well-defined server
 * snapshot, and — in the case of reduced motion — can change while the page is
 * open. Reading them in an effect would mean a second render every time.
 */

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeMotion(onChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => undefined;
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function motionSnapshot(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** Honours the OS setting. The in-app override is applied in CSS on <html>. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeMotion, motionSnapshot, () => false);
}

const SERVER_CAPABILITY: SpeechCapability = {
  supported: false,
  engine: 'demo',
  reason: 'Checking this browser…',
};

let cachedCapability: SpeechCapability | null = null;

function capabilitySnapshot(): SpeechCapability {
  // Cached so the snapshot is referentially stable between renders.
  cachedCapability ??= detectSpeechCapability();
  return cachedCapability;
}

function subscribeNever(): () => void {
  return () => undefined;
}

/**
 * Whether this browser can transcribe speech. Fixed for the life of the page,
 * so there is nothing to subscribe to — but it still must not be read during
 * the server render, hence the separate server snapshot.
 */
export function useSpeechCapability(): SpeechCapability {
  return useSyncExternalStore(subscribeNever, capabilitySnapshot, () => SERVER_CAPABILITY);
}
