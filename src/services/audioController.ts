import { Howl } from 'howler';
import { useAudioStore } from '../stores/useAudioStore';

interface CachedSound {
  src: string;
  howl: Howl;
  fallbackDuration: number;
}

function requestFrame(callback: FrameRequestCallback): number {
  if (typeof requestAnimationFrame === 'function') return requestAnimationFrame(callback);
  return window.setTimeout(() => callback(performance.now()), 16);
}

function cancelFrame(id: number): void {
  if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id);
  else clearTimeout(id);
}

export class AudioController {
  private readonly cache = new Map<string, CachedSound>();
  private activeId: string | null = null;
  private progressFrame = 0;

  toggle(id: string, src: string, duration = 0): void {
    const cached = this.getOrCreate(id, src, duration);
    if (this.activeId === id && cached.howl.playing()) {
      this.pause(id);
      return;
    }
    this.play(id, src, duration);
  }

  play(id: string, src: string, duration = 0): void {
    const state = useAudioStore.getState();
    state.setErrorId(null);

    if (this.activeId && this.activeId !== id) this.stop(this.activeId);

    const cached = this.getOrCreate(id, src, duration);
    cached.fallbackDuration = duration || cached.fallbackDuration;
    cached.howl.rate(state.playbackRate);
    cached.howl.loop(state.isLooping);
    this.activeId = id;
    state.setPlayingId(id);

    const soundId = cached.howl.play();
    if (soundId === undefined) state.setLoadingId(id);
    this.startProgress(id);
  }

  pause(id: string): void {
    const cached = this.cache.get(id);
    if (!cached) return;
    cached.howl.pause();
    this.activeId = null;
    cancelFrame(this.progressFrame);
    useAudioStore.getState().setPlayingId(null);
    useAudioStore.getState().setLoadingId(null);
  }

  stop(id: string): void {
    const cached = this.cache.get(id);
    cached?.howl.stop();
    if (this.activeId === id) this.activeId = null;
    cancelFrame(this.progressFrame);
    const state = useAudioStore.getState();
    if (state.playingId === id) state.setPlayingId(null);
    if (state.loadingId === id) state.setLoadingId(null);
    state.resetProgress(id);
  }

  stopAll(): void {
    this.cache.forEach(({ howl }) => howl.stop());
    this.activeId = null;
    cancelFrame(this.progressFrame);
    const state = useAudioStore.getState();
    const activeIds = new Set([
      ...this.cache.keys(),
      ...(state.playingId ? [state.playingId] : []),
    ]);
    activeIds.forEach((id) => state.resetProgress(id));
    state.setPlayingId(null);
    state.setLoadingId(null);
  }

  release(id: string): void {
    const cached = this.cache.get(id);
    if (!cached) return;
    this.stop(id);
    cached.howl.unload();
    this.cache.delete(id);
  }

  setPlaybackRate(rate: number): void {
    if (!this.activeId) return;
    this.cache.get(this.activeId)?.howl.rate(rate);
  }

  setLoop(loop: boolean): void {
    if (!this.activeId) return;
    this.cache.get(this.activeId)?.howl.loop(loop);
  }

  private getOrCreate(id: string, src: string, duration: number): CachedSound {
    const existing = this.cache.get(id);
    if (existing?.src === src) return existing;
    if (existing) {
      existing.howl.unload();
      this.cache.delete(id);
    }

    useAudioStore.getState().setLoadingId(id);
    const howl = new Howl({
      src: [src],
      preload: true,
      onload: () => useAudioStore.getState().setLoadingId(null),
      onplay: () => useAudioStore.getState().setLoadingId(null),
      onend: () => this.finish(id),
      onstop: () => {
        if (this.activeId === id) this.activeId = null;
      },
      onloaderror: () => this.fail(id),
      onplayerror: () => this.fail(id),
    });
    const cached = { src, howl, fallbackDuration: duration };
    this.cache.set(id, cached);
    return cached;
  }

  private startProgress(id: string): void {
    cancelFrame(this.progressFrame);
    const update = () => {
      if (this.activeId !== id) return;
      const cached = this.cache.get(id);
      if (!cached) return;
      const duration = cached.howl.duration() || cached.fallbackDuration;
      const position = Number(cached.howl.seek()) || 0;
      if (duration > 0) useAudioStore.getState().setProgress(id, Math.min(1, position / duration));
      this.progressFrame = requestFrame(update);
    };
    this.progressFrame = requestFrame(update);
  }

  private finish(id: string): void {
    if (useAudioStore.getState().isLooping) return;
    if (this.activeId === id) this.activeId = null;
    cancelFrame(this.progressFrame);
    const state = useAudioStore.getState();
    state.setPlayingId(null);
    state.setLoadingId(null);
    state.resetProgress(id);
  }

  private fail(id: string): void {
    if (this.activeId === id) this.activeId = null;
    cancelFrame(this.progressFrame);
    const state = useAudioStore.getState();
    state.setPlayingId(null);
    state.setLoadingId(null);
    state.setErrorId(id);
    console.warn('Audio playback error for', id);
  }
}

export const audioController = new AudioController();

