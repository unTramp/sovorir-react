import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { contentRepository } from '../lib/contentRepository';
import type { LessonPage } from '../types/lessonContent';
import type { QuizResult } from '../types/quiz';
import { practiceEvents } from '../lib/practiceEvents';

interface PageProgress {
  completedRecords: number[];  // indices of completed record blocks
}

interface LessonProgressState {
  // pageId → PageProgress
  pages: Record<number, PageProgress>;
  quizResults: Record<number, QuizResult>;

  // Actions
  completeRecord: (pageId: number, recordIndex: number) => void;
  getCompletedCount: (pageId: number) => number;
  getTotalRecords: (pageId: number) => number;
  isPageCompleted: (pageId: number) => boolean;
  getOverallPercentage: () => number;
  getCompletedLessons: () => number;
  saveQuizResult: (pageId: number, result: QuizResult) => void;
  isQuizPassed: (pageId: number) => boolean;
}

// Module-level cache — populated once from the async interface.
// Safe to use synchronously after app initialises (Promise.resolve resolves in the next microtask).
let _lessonPages: LessonPage[] = [];
contentRepository.getLessonPages().then((pages) => { _lessonPages = pages; });

function countRecords(pageId: number): number {
  const page = _lessonPages.find((p) => p.id === pageId);
  if (!page) return 0;
  return page.blocks.filter((b) => b.type === 'record').length;
}

export const useLessonProgress = create<LessonProgressState>()(
  persist(
    (set, get) => ({
      pages: {},
      quizResults: {},

      completeRecord: (pageId, recordIndex) =>
        set((state) => {
          const current = state.pages[pageId]?.completedRecords || [];
          if (current.includes(recordIndex)) return state;
          return {
            pages: {
              ...state.pages,
              [pageId]: { completedRecords: [...current, recordIndex] },
            },
          };
        }),

      getCompletedCount: (pageId) => {
        return get().pages[pageId]?.completedRecords.length || 0;
      },

      getTotalRecords: (pageId) => countRecords(pageId),

      isPageCompleted: (pageId) => {
        const total = countRecords(pageId);
        if (total === 0) return true;
        const completed = get().pages[pageId]?.completedRecords.length || 0;
        return completed >= total;
      },

      getOverallPercentage: () => {
        const state = get();
        let totalRecords = 0;
        let completedRecords = 0;
        for (const page of _lessonPages) {
          const recs = page.blocks.filter((b) => b.type === 'record').length;
          totalRecords += recs;
          completedRecords += Math.min(
            state.pages[page.id]?.completedRecords.length || 0,
            recs,
          );
        }
        return totalRecords > 0 ? Math.round((completedRecords / totalRecords) * 100) : 0;
      },

      getCompletedLessons: () => {
        const state = get();
        let count = 0;
        for (const page of _lessonPages) {
          const total = page.blocks.filter((b) => b.type === 'record').length;
          const completed = state.pages[page.id]?.completedRecords.length || 0;
          if (total === 0 || completed >= total) count++;
        }
        return count;
      },

      saveQuizResult: (pageId, result) => {
        if (result.passed) {
          practiceEvents.emit('quiz');
        }
        return set((state) => ({
          quizResults: { ...state.quizResults, [pageId]: result },
        }));
      },

      isQuizPassed: (pageId) => {
        const result = get().quizResults[pageId];
        return result?.passed ?? false;
      },
    }),
    {
      name: 'sovorir-lesson-progress',
    },
  ),
);
