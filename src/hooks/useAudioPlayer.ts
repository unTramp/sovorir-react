import { useEffect } from 'react';
import { Howl } from 'howler';
import { useAudioStore } from '../stores/useAudioStore';

const howlCache = new Map<string, Howl>();
let activeRaf = 0;
let isActive = false;

let playStartedAt = 0;
let playStartOffset = 0;
let knownDuration = 0;

function startProgressLoop(id: string) {
  cancelAnimationFrame(activeRaf);
  playStartedAt = performance.now();

  function update() {
    if (!isActive || useAudioStore.getState().playingId !== id) return;

    const howl = howlCache.get(id);
    const howlDuration = howl ? howl.duration() || 0 : 0;
    const duration = howlDuration > 0 ? howlDuration : knownDuration;

    if (duration <= 0) {
      activeRaf = requestAnimationFrame(update);
      return;
    }

    let seek = howl ? (howl.seek() as number) || 0 : 0;
    if (seek <= 0) {
      const rate = useAudioStore.getState().playbackRate;
      const elapsed = (performance.now() - playStartedAt) / 1000 * rate;
      seek = playStartOffset + elapsed;
    }

    const progress = Math.min(1, seek / duration);
    useAudioStore.getState().setProgress(id, progress);
    activeRaf = requestAnimationFrame(update);
  }
  activeRaf = requestAnimationFrame(update);
}

function stop(id: string) {
  const howl = howlCache.get(id);
  if (howl) howl.stop();
  isActive = false;
  playStartOffset = 0;
  cancelAnimationFrame(activeRaf);
  useAudioStore.getState().resetProgress(id);
}

function togglePlay(id: string, src: string, duration?: number) {
  const { playingId, playbackRate, isLooping, setPlayingId } = useAudioStore.getState();

  // Same sound — toggle pause/resume
  if (playingId === id) {
    const howl = howlCache.get(id);
    if (howl) {
      if (isActive) {
        // Save accumulated time on pause
        const rate = playbackRate;
        const elapsed = (performance.now() - playStartedAt) / 1000 * rate;
        playStartOffset += elapsed;
        howl.pause();
        isActive = false;
        cancelAnimationFrame(activeRaf);
        setPlayingId(null);
      } else {
        howl.rate(playbackRate);
        howl.play();
        isActive = true;
        setPlayingId(id);
        startProgressLoop(id);
      }
    }
    return;
  }

  // Stop previous
  if (playingId) {
    stop(playingId);
  }

  // Play new
  playStartOffset = 0;
  knownDuration = duration || 0;

  const onEnd = () => {
    if (useAudioStore.getState().isLooping) {
      playStartOffset = 0;
      playStartedAt = performance.now();
      return;
    }
    isActive = false;
    playStartOffset = 0;
    cancelAnimationFrame(activeRaf);
    useAudioStore.getState().setPlayingId(null);
    useAudioStore.getState().resetProgress(id);
  };

  let howl = howlCache.get(id);
  if (!howl) {
    howl = new Howl({
      src: [src],
      format: ['opus'],
      rate: playbackRate,
      loop: isLooping,
      onend: onEnd,
      onloaderror: () => console.warn('Audio load error for', id),
    });
    howlCache.set(id, howl);
  }

  howl.rate(playbackRate);
  howl.play();
  isActive = true;
  setPlayingId(id);
  startProgressLoop(id);
}

export function useAudioPlayer() {
  const playingId = useAudioStore((s) => s.playingId);
  const playbackRate = useAudioStore((s) => s.playbackRate);
  const isLooping = useAudioStore((s) => s.isLooping);

  useEffect(() => {
    if (playingId) {
      const howl = howlCache.get(playingId);
      if (howl) howl.rate(playbackRate);
    }
  }, [playbackRate, playingId]);

  useEffect(() => {
    if (playingId) {
      const howl = howlCache.get(playingId);
      if (howl) howl.loop(isLooping);
    }
  }, [isLooping, playingId]);

  useEffect(() => {
    return () => cancelAnimationFrame(activeRaf);
  }, []);

  return { togglePlay, playingId };
}
