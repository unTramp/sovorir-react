import { useCallback, useRef, useEffect } from 'react';
import { Howl } from 'howler';
import { useAudioStore } from '../stores/useAudioStore';

// Module-level Howl cache — shared across all component instances
const howlCache = new Map<string, Howl>();

function getOrCreateHowl(id: string, src: string, rate: number, onEnd: () => void): Howl {
  let howl = howlCache.get(id);
  if (!howl) {
    howl = new Howl({
      src: [src],
      html5: true,
      rate,
      onend: onEnd,
      onloaderror: () => {
        console.warn('Audio load error for', id);
      },
    });
    howlCache.set(id, howl);
  }
  return howl;
}

export function useAudioPlayer() {
  const { playingId, playbackRate, setPlayingId, setProgress, resetProgress } =
    useAudioStore();
  const rafRef = useRef<number>(0);

  const startProgressLoop = useCallback(
    (id: string) => {
      const howl = howlCache.get(id);
      if (!howl) return;

      function update() {
        if (!howl!.playing()) return;
        const seek = (howl!.seek() as number) || 0;
        const duration = howl!.duration() || 1;
        setProgress(id, duration > 0 ? seek / duration : 0);
        rafRef.current = requestAnimationFrame(update);
      }
      rafRef.current = requestAnimationFrame(update);
    },
    [setProgress],
  );

  const togglePlay = useCallback(
    (id: string, src: string) => {
      // If same sound is playing, toggle pause/resume
      if (playingId === id) {
        const howl = howlCache.get(id);
        if (howl) {
          if (howl.playing()) {
            howl.pause();
            cancelAnimationFrame(rafRef.current);
            setPlayingId(null);
          } else {
            howl.rate(playbackRate);
            howl.play();
            setPlayingId(id);
            startProgressLoop(id);
          }
        }
        return;
      }

      // Stop current
      if (playingId) {
        const current = howlCache.get(playingId);
        if (current) {
          current.stop();
        }
        cancelAnimationFrame(rafRef.current);
        resetProgress(playingId);
      }

      // Play new
      const onEnd = () => {
        setPlayingId(null);
        resetProgress(id);
        cancelAnimationFrame(rafRef.current);
      };

      const howl = getOrCreateHowl(id, src, playbackRate, onEnd);
      howl.rate(playbackRate);
      howl.play();
      setPlayingId(id);
      startProgressLoop(id);
    },
    [playingId, playbackRate, setPlayingId, resetProgress, startProgressLoop],
  );

  // Update rate on currently playing
  useEffect(() => {
    if (playingId) {
      const howl = howlCache.get(playingId);
      if (howl) howl.rate(playbackRate);
    }
  }, [playbackRate, playingId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { togglePlay, playingId };
}
