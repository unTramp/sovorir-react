import { create } from 'zustand';

interface AudioState {
  playingId: string | null;
  loadingId: string | null;
  errorId: string | null;
  playbackRate: number;
  isLooping: boolean;
  progress: Record<string, number>;

  setPlayingId: (id: string | null) => void;
  setLoadingId: (id: string | null) => void;
  setErrorId: (id: string | null) => void;
  setPlaybackRate: (rate: number) => void;
  toggleLoop: () => void;
  setProgress: (id: string, value: number) => void;
  resetProgress: (id: string) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  playingId: null,
  loadingId: null,
  errorId: null,
  playbackRate: 1.0,
  isLooping: false,
  progress: {},

  setPlayingId: (id) => set({ playingId: id }),
  setLoadingId: (id) => set({ loadingId: id }),
  setErrorId: (id) => set({ errorId: id }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  toggleLoop: () => set((s) => ({ isLooping: !s.isLooping })),
  setProgress: (id, value) =>
    set((s) => {
      const rounded = Math.round(value * 200) / 200; // update every 0.5%
      if (s.progress[id] === rounded) return s;
      return { progress: { ...s.progress, [id]: rounded } };
    }),
  resetProgress: (id) =>
    set((s) => {
      const next = { ...s.progress };
      delete next[id];
      return { progress: next };
    }),
}));
