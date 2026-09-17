import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UUID } from '../domain/learning';
import { buildPracticeQueue, type PracticeCardPlan } from '../lib/practiceEngine';
import { practiceEvents } from '../lib/practiceEvents';
import { useLearningItemStore } from './useLearningItemStore';

export type PracticeQuality = 'again' | 'hard' | 'easy';

export interface PracticeSession {
  cards: PracticeCardPlan[];
  currentIndex: number;
  results: Record<UUID, PracticeQuality>;
  startedAt: string;
}

interface PracticeSessionState {
  session: PracticeSession | null;
  startSession: (now?: Date) => void;
  answerCurrent: (quality: PracticeQuality, now?: Date) => void;
  clearSession: () => void;
  getDueCount: (now?: Date) => number;
  getAvailableCount: () => number;
}

export const usePracticeSessionStore = create<PracticeSessionState>()(
  persist(
    (set, get) => ({
      session: null,

      startSession: (now = new Date()) => {
        const learning = useLearningItemStore.getState();
        const cards = buildPracticeQueue({
          items: learning.items,
          reviewQueue: learning.reviewQueue,
          now,
        });

        set({
          session: {
            cards,
            currentIndex: 0,
            results: {},
            startedAt: now.toISOString(),
          },
        });
      },

      answerCurrent: (quality, now = new Date()) => {
        const session = get().session;
        if (!session) return;
        const card = session.cards[session.currentIndex];
        if (!card) return;

        useLearningItemStore.getState().scheduleReview(card.itemId, quality, now);

        const nextIndex = session.currentIndex + 1;
        const results = { ...session.results, [card.itemId]: quality };
        if (nextIndex >= session.cards.length) {
          practiceEvents.emit('flashcard');
        }

        set({
          session: {
            ...session,
            currentIndex: nextIndex,
            results,
          },
        });
      },

      clearSession: () => set({ session: null }),

      getDueCount: (now = new Date()) => {
        const learning = useLearningItemStore.getState();
        return buildPracticeQueue({
          items: learning.items,
          reviewQueue: learning.reviewQueue,
          now,
          limit: Number.MAX_SAFE_INTEGER,
        }).length;
      },

      getAvailableCount: () => Object.keys(useLearningItemStore.getState().reviewQueue).length,
    }),
    {
      name: 'sovorir-practice-session-v1',
      version: 1,
      partialize: (state) => ({ session: state.session }),
    },
  ),
);
