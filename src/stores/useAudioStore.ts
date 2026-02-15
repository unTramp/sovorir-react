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
    set((s) => ({ progress: { ...s.progress, [id]: value } })),
  resetProgress: (id) =>
    set((s) => {
      const next = { ...s.progress };
      delete next[id];
      return { progress: next };
    }),
}));
