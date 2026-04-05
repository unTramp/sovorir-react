import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FlashcardProgress, FlashcardSession } from '../types/flashcard';
import type { DictionaryWord } from '../types/dictionary';
import { contentRepository } from '../lib/contentRepository';
import { practiceEvents } from '../lib/practiceEvents';

interface FlashcardState {
  progress: Record<string, FlashcardProgress>;
  session: FlashcardSession | null;
  wordsReady: boolean;

  _initWords: (words: DictionaryWord[]) => void;
  startSession: () => void;
  answerCard: (wordId: string, quality: 'again' | 'hard' | 'easy') => void;
  getNextReviewDate: (wordId: string) => number;
  getLearnedCount: () => number;
}

const SESSION_SIZE = 10;

let _flashcardWords: DictionaryWord[] = [];

contentRepository.getFlashcardWords().then((words) => {
  useFlashcardStore.getState()._initWords(words);
});

function selectCards(progress: Record<string, FlashcardProgress>): string[] {
  const now = Date.now();
  const allIds = _flashcardWords.map((w) => w.id);

  const overdue: { id: string; priority: number }[] = [];
  const newCards: string[] = [];
  const reviewed: { id: string; interval: number }[] = [];

  for (const id of allIds) {
    const p = progress[id];
    if (!p) {
      newCards.push(id);
    } else if (p.nextReview <= now) {
      overdue.push({ id, priority: now - p.nextReview });
    } else {
      reviewed.push({ id, interval: p.interval });
    }
  }

  overdue.sort((a, b) => b.priority - a.priority);
  reviewed.sort((a, b) => a.interval - b.interval);

  const selected: string[] = [];
  for (const o of overdue) {
    if (selected.length >= SESSION_SIZE) break;
    selected.push(o.id);
  }
  for (const n of newCards) {
    if (selected.length >= SESSION_SIZE) break;
    selected.push(n);
  }
  for (const r of reviewed) {
    if (selected.length >= SESSION_SIZE) break;
    selected.push(r.id);
  }

  return selected;
}

export const useFlashcardStore = create<FlashcardState>()(
  persist(
    (set, get) => ({
      progress: {},
      session: null,
      wordsReady: false,

      _initWords: (words: DictionaryWord[]) => {
        _flashcardWords = words;
        set({ wordsReady: true });
      },

      startSession: () => {
        const cards = selectCards(get().progress);
        set({
          session: {
            cards,
            currentIndex: 0,
            results: {},
          },
        });
      },

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
            nextReview: now + interval * 24 * 60 * 60 * 1000,
            easeFactor,
          };

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
        return Object.keys(get().progress).length;
      },
    }),
    {
      name: 'sovorir-flashcard-progress',
      partialize: (state) => ({ progress: state.progress }),
    },
  ),
);
