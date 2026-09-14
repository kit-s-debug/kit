'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Beat } from '@/types';
import { BeatEngine, isAudioSupported } from '@/services/audio/beat-engine';

/**
 * A single shared transport for beat previews.
 *
 * Created on first play so that no AudioContext exists until the user asks for
 * sound, which is both the browser's autoplay rule and the polite thing to do.
 */
export function usePreviewBeat() {
  const engineRef = useRef<BeatEngine | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  const supported = typeof window === 'undefined' ? true : isAudioSupported();

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    setPlayingId(null);
  }, []);

  const toggle = useCallback(
    async (beat: Beat) => {
      setError(null);
      if (!supported) {
        setError('This browser cannot play audio.');
        return;
      }
      if (playingId === beat.id) {
        stop();
        return;
      }
      if (!engineRef.current) {
        engineRef.current = new BeatEngine({
          onError: (message) => {
            setError(message);
            setPlayingId(null);
          },
        });
      }
      const engine = engineRef.current;
      try {
        await engine.load(beat);
        engine.setVolume(volume);
        await engine.play(0);
        setPlayingId(beat.id);
      } catch {
        setError('That beat could not be played. Try another one.');
        setPlayingId(null);
      }
    },
    [playingId, stop, supported, volume],
  );

  const setVolume = useCallback((value: number) => {
    setVolumeState(value);
    engineRef.current?.setVolume(value);
  }, []);

  return { playingId, toggle, stop, volume, setVolume, error, supported, engineRef };
}
