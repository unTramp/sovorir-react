import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { todayISO, yesterdayISO } from '../lib/dateUtils';
import { practiceEvents } from '../lib/practiceEvents';

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  practiceDates: string[];
  lastPracticeDate: string | null;

  recordPractice: () => void;
  recalculateStreak: () => void;
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      practiceDates: [],
      lastPracticeDate: null,

      recordPractice: () => {
        const today = todayISO();
        const state = get();
        if (state.practiceDates.includes(today)) return;

        const yesterday = yesterdayISO();
        const newStreak = state.lastPracticeDate === yesterday
          ? state.currentStreak + 1
          : state.lastPracticeDate === today
            ? state.currentStreak
            : 1;
        const newLongest = Math.max(state.longestStreak, newStreak);

        set({
          practiceDates: [...state.practiceDates, today],
          lastPracticeDate: today,
          currentStreak: newStreak,
          longestStreak: newLongest,
        });
      },

      recalculateStreak: () => {
        const state = get();
        const today = todayISO();
        const yesterday = yesterdayISO();
        if (
          state.lastPracticeDate !== today &&
          state.lastPracticeDate !== yesterday
        ) {
          set({ currentStreak: 0 });
        }
      },
    }),
    {
      name: 'sovorir-streak',
      onRehydrateStorage: () => (state) => {
        state?.recalculateStreak();
      },
    },
  ),
);

practiceEvents.on(() => useStreakStore.getState().recordPractice());
