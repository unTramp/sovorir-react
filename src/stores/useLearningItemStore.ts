import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LearningItem, UUID } from '../domain/learning';

interface LearningItemState {
  items: Record<UUID, LearningItem>;
  replaceItems: (items: LearningItem[]) => void;
  upsertItems: (items: LearningItem[]) => void;
  removeItem: (id: UUID) => void;
  getItem: (id: UUID) => LearningItem | undefined;
}

export const useLearningItemStore = create<LearningItemState>()(
  persist(
    (set, get) => ({
      items: {},
      replaceItems: (items) => set({ items: Object.fromEntries(items.map((item) => [item.id, item])) }),
      upsertItems: (items) => set((state) => ({
        items: { ...state.items, ...Object.fromEntries(items.map((item) => [item.id, item])) },
      })),
      removeItem: (id) => set((state) => {
        const next = { ...state.items };
        delete next[id];
        return { items: next };
      }),
      getItem: (id) => get().items[id],
    }),
    { name: 'sovorir-learning-items-v1', version: 1 },
  ),
);

