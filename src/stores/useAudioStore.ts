import { create } from 'zustand';

interface AudioState {
  playingId: string | null;
  playbackRate: number;
  progress: Record<string, number>;

  setPlayingId: (id: string | null) => void;
  setPlaybackRate: (rate: number) => void;
  setProgress: (id: string, value: number) => void;
  resetProgress: (id: string) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  playingId: null,
  playbackRate: 1.0,
  progress: {},

  setPlayingId: (id) => set({ playingId: id }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
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
