import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FlashcardProgress, FlashcardSession } from '../types/flashcard';
import type { DictionaryWord } from '../types/dictionary';
import { contentRepository } from '../lib/contentRepository';
import { practiceEvents } from '../lib/practiceEvents';
import { useLearningItemStore } from './useLearningItemStore';

interface FlashcardState {
  progress: Record<string, FlashcardProgress>;
  availableWordIds: string[];
  session: FlashcardSession | null;
  wordsReady: boolean;
  words: Record<string, DictionaryWord>;

  _initWords: (words: DictionaryWord[]) => void;
  startSession: () => void;
  unlockWords: (wordIds: string[]) => void;
  answerCard: (wordId: string, quality: 'again' | 'hard' | 'easy') => void;
  getNextReviewDate: (wordId: string) => number;
  getLearnedCount: () => number;
  getDueCount: () => number;
  getAvailableCount: () => number;
}

const SESSION_SIZE = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

contentRepository.getFlashcardWords().then((words) => {
  useFlashcardStore.getState()._initWords(words);
});

function selectCards(
  progress: Record<string, FlashcardProgress>,
  availableWordIds: string[],
  words: Record<string, DictionaryWord>,
): string[] {
  const now = Date.now();
  return availableWordIds
    .filter((id) => words[id] && (!progress[id] || progress[id].nextReview <= now))
    .sort((a, b) => (progress[a]?.nextReview ?? 0) - (progress[b]?.nextReview ?? 0))
    .slice(0, SESSION_SIZE);
}

export const useFlashcardStore = create<FlashcardState>()(
  persist(
    (set, get) => ({
      progress: {},
      availableWordIds: [],
      session: null,
      wordsReady: false,
      words: {},

      _initWords: (words: DictionaryWord[]) => {
        set((state) => {
          const mergedWords = {
            ...state.words,
            ...Object.fromEntries(words.map((word) => [word.id, word])),
          };
          return {
            words: mergedWords,
            wordsReady: true,
            availableWordIds: Array.from(new Set([
              ...state.availableWordIds,
              ...Object.keys(state.progress),
            ])).filter((id) => Boolean(mergedWords[id])),
          };
        });
      },

      startSession: () => {
        const cards = selectCards(get().progress, get().availableWordIds, get().words);
        set({
          session: {
            cards,
            currentIndex: 0,
            results: {},
          },
        });
      },

      unlockWords: (wordIds) => set((state) => {
        const nextIds = wordIds.filter((id) => state.words[id]);
        const nextReview = Date.now() + DAY_MS;
        const progress = { ...state.progress };
        nextIds.forEach((id) => {
          if (!progress[id]) {
            progress[id] = { wordId: id, interval: 1, nextReview, easeFactor: 2.5 };
          }
        });
        return {
          progress,
          availableWordIds: Array.from(new Set([...state.availableWordIds, ...nextIds])),
        };
      }),

      answerCard: (wordId, quality) =>
        set((state) => {
          const prev = state.progress[wordId];
          const now = Date.now();
          let interval: number;
          let easeFactor: number;

          if (quality === 'again') {
            interval = 1;
            easeFactor = prev ? Math.max(1.3, prev.easeFactor - 0.2) : 2.5;
          } else if (quality === 'hard') {
            interval = prev ? prev.interval * 1 : 1;
            easeFactor = prev ? prev.easeFactor : 2.5;
          } else {
            interval = prev ? prev.interval * 2.5 : 3;
            easeFactor = prev ? Math.min(3.0, prev.easeFactor + 0.1) : 2.5;
          }

          const newProgress: FlashcardProgress = {
            wordId,
            interval: Math.round(interval),
            nextReview: now + interval * DAY_MS,
            easeFactor,
          };

          useLearningItemStore.getState().scheduleReview(wordId, quality);

          const session = state.session;
          if (!session) return state;

          const newResults = { ...session.results, [wordId]: quality };
          const newIndex = session.currentIndex + 1;

          if (newIndex >= session.cards.length) {
            practiceEvents.emit('flashcard');
          }

          return {
            progress: { ...state.progress, [wordId]: newProgress },
            session: { ...session, currentIndex: newIndex, results: newResults },
          };
        }),

      getNextReviewDate: (wordId) => {
        const p = get().progress[wordId];
        return p ? p.nextReview : 0;
      },

      getLearnedCount: () => {
        return get().availableWordIds.length;
      },

      getDueCount: () => selectCards(get().progress, get().availableWordIds, get().words).length,

      getAvailableCount: () => get().availableWordIds.length,
    }),
    {
      name: 'sovorir-flashcard-progress',
      partialize: (state) => ({
        progress: state.progress,
        availableWordIds: state.availableWordIds,
      }),
    },
  ),
);
