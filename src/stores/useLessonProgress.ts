import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { contentRepository } from '../lib/contentRepository';
import type { LessonContentSection } from '../types/lessonContent';
import type { QuizResult } from '../types/quiz';
import { practiceEvents } from '../lib/practiceEvents';

interface SectionProgress {
  completedRecords: number[];  // indices of completed record blocks
}

interface LessonProgressState {
  // sectionId → SectionProgress
  sections: Record<number, SectionProgress>;
  quizResults: Record<number, QuizResult>;
  sectionsReady: boolean;

  // Actions
  _initSections: (sections: LessonContentSection[]) => void;
  completeRecord: (sectionId: number, recordIndex: number) => void;
  getCompletedCount: (sectionId: number) => number;
  getTotalRecords: (sectionId: number) => number;
  isSectionCompleted: (sectionId: number) => boolean;
  getOverallPercentage: () => number;
  getCompletedSections: () => number;
  saveQuizResult: (sectionId: number, result: QuizResult) => void;
  isQuizPassed: (sectionId: number) => boolean;
}

// Module-level cache populated via _initSections action.
let _lessonSections: LessonContentSection[] = [];

// Kick off the load immediately; the store action will set sectionsReady when done.
contentRepository.getLessonSections().then((sections) => {
  _lessonSections = sections;
  useLessonProgress.getState()._initSections(sections);
});

function countRecords(sectionId: number): number {
  const section = _lessonSections.find((item) => item.id === sectionId);
  if (!section) return 0;
  return section.blocks.filter((b) => b.type === 'record').length;
}

export const useLessonProgress = create<LessonProgressState>()(
  persist(
    (set, get) => ({
      sections: {},
      quizResults: {},
      sectionsReady: false,

      _initSections: (sections: LessonContentSection[]) => {
        _lessonSections = sections;
        set({ sectionsReady: true });
      },

      completeRecord: (sectionId, recordIndex) =>
        set((state) => {
          const current = state.sections[sectionId]?.completedRecords || [];
          if (current.includes(recordIndex)) return state;
          return {
            sections: {
              ...state.sections,
              [sectionId]: { completedRecords: [...current, recordIndex] },
            },
          };
        }),

      getCompletedCount: (sectionId) => {
        return get().sections[sectionId]?.completedRecords.length || 0;
      },

      getTotalRecords: (sectionId) => countRecords(sectionId),

      isSectionCompleted: (sectionId) => {
        const total = countRecords(sectionId);
        if (total === 0) return true;
        const completed = get().sections[sectionId]?.completedRecords.length || 0;
        return completed >= total;
      },

      getOverallPercentage: () => {
        const state = get();
        let totalRecords = 0;
        let completedRecords = 0;
        for (const section of _lessonSections) {
          const recs = section.blocks.filter((b) => b.type === 'record').length;
          totalRecords += recs;
          completedRecords += Math.min(
            state.sections[section.id]?.completedRecords.length || 0,
            recs,
          );
        }
        return totalRecords > 0 ? Math.round((completedRecords / totalRecords) * 100) : 0;
      },

      getCompletedSections: () => {
        const state = get();
        let count = 0;
        for (const section of _lessonSections) {
          const total = section.blocks.filter((b) => b.type === 'record').length;
          const completed = state.sections[section.id]?.completedRecords.length || 0;
          if (total === 0 || completed >= total) count++;
        }
        return count;
      },

      saveQuizResult: (sectionId, result) => {
        if (result.passed) {
          practiceEvents.emit('quiz');
        }
        return set((state) => ({
          quizResults: { ...state.quizResults, [sectionId]: result },
        }));
      },

      isQuizPassed: (sectionId) => {
        const result = get().quizResults[sectionId];
        return result?.passed ?? false;
      },
    }),
    {
      name: 'sovorir-lesson-progress',
    },
  ),
);
