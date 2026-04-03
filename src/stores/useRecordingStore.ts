import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Recording } from '../types/recording';
import { saveBlob, getBlob, deleteBlob } from '../lib/indexedDB';
import { practiceEvents } from '../lib/practiceEvents';

interface RecordingState {
  recordings: Record<string, Recording>;

  saveRecording: (meta: Recording, blob: Blob) => Promise<void>;
  getRecordingUrl: (id: string) => Promise<string | null>;
  deleteRecording: (id: string) => Promise<void>;
  getRecordingForPrompt: (pageId: number, recordIndex: number) => Recording | undefined;
}

export const useRecordingStore = create<RecordingState>()(
  persist(
    (set, get) => ({
      recordings: {},

      saveRecording: async (meta, blob) => {
        await saveBlob(meta.id, blob);
        set((state) => ({
          recordings: { ...state.recordings, [meta.id]: meta },
        }));
        practiceEvents.emit('recording');
      },

      getRecordingUrl: async (id) => {
        const blob = await getBlob(id);
        if (!blob) return null;
        return URL.createObjectURL(blob);
      },

      deleteRecording: async (id) => {
        await deleteBlob(id);
        set((state) => {
          const { [id]: _, ...rest } = state.recordings;
          return { recordings: rest };
        });
      },

      getRecordingForPrompt: (pageId, recordIndex) => {
        const recordings = get().recordings;
        return Object.values(recordings).find(
          (r) => r.pageId === pageId && r.recordIndex === recordIndex,
        );
      },
    }),
    {
      name: 'sovorir-recordings-meta',
      partialize: (state) => ({ recordings: state.recordings }),
    },
  ),
);
