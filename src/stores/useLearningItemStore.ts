import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LearningItem, UUID } from '../domain/learning';

interface LearningItemState {
  items: Record<UUID, LearningItem>;
  reviewQueue: Record<UUID, { sourceLessonId: UUID; unlockedAt: string; nextReviewAt: string }>;
  replaceItems: (items: LearningItem[]) => void;
  upsertItems: (items: LearningItem[]) => void;
  removeItem: (id: UUID) => void;
  getItem: (id: UUID) => LearningItem | undefined;
  enqueueForReview: (itemIds: UUID[], sourceLessonId: UUID, now?: Date) => void;
  getReviewQueue: () => LearningItem[];
}

export const useLearningItemStore = create<LearningItemState>()(
  persist(
    (set, get) => ({
      items: {},
      reviewQueue: {},
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
      enqueueForReview: (itemIds, sourceLessonId, now = new Date()) => set((state) => {
        const unlockedAt = now.toISOString();
        const nextReviewAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
        const additions = Object.fromEntries(itemIds
          .filter((id) => state.items[id]?.reviewable)
          .map((id) => [id, { sourceLessonId, unlockedAt, nextReviewAt }]));
        return { reviewQueue: { ...state.reviewQueue, ...additions } };
      }),
      getReviewQueue: () => Object.keys(get().reviewQueue)
        .map((id) => get().items[id])
        .filter((item): item is LearningItem => Boolean(item)),
    }),
    { name: 'sovorir-learning-items-v1', version: 1 },
  ),
);
