import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { contentRepository } from '../lib/contentRepository';
import { isMockApiEnabled } from '../lib/apiClient';
import type { LessonContentSection } from '../types/lessonContent';
import type { QuizResult } from '../types/quiz';
import { practiceEvents } from '../lib/practiceEvents';
import { apiClient } from '../lib/apiClient';

interface SectionProgress {
  completedRecords: number[];
  completed: boolean;
}

interface LessonProgressState {
  // sectionId → SectionProgress
  sections: Record<number, SectionProgress>;
  quizResults: Record<number, QuizResult>;
  sectionsReady: boolean;

  // Actions
  _initSections: (sections: LessonContentSection[]) => void;
  completeRecord: (sectionId: number, recordIndex: number) => void;
  completeSection: (sectionId: number) => void;
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
  return section.blocks.filter((b) => b.type === 'record' || b.type === 'pronunciationPrompt').length;
}

function hasQuiz(sectionId: number): boolean {
  const section = _lessonSections.find((item) => item.id === sectionId);
  return Boolean(section?.quizId);
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
              [sectionId]: {
                completed: state.sections[sectionId]?.completed ?? false,
                completedRecords: [...current, recordIndex],
              },
            },
          };
        }),

      completeSection: (sectionId) => {
        set((state) => ({
          sections: {
            ...state.sections,
            [sectionId]: {
              completed: true,
              completedRecords: state.sections[sectionId]?.completedRecords ?? [],
            },
          },
        }));
        // Sync to server when using real API
        if (!isMockApiEnabled) {
          const section = _lessonSections.find((s) => s.id === sectionId);
          if (section?.apiId) {
            void apiClient.post(`/sections/${section.apiId}/complete`, {}).catch(() => {});
          }
        }
      },

      getCompletedCount: (sectionId) => {
        return get().sections[sectionId]?.completedRecords.length || 0;
      },

      getTotalRecords: (sectionId) => countRecords(sectionId),

      isSectionCompleted: (sectionId) => {
        const total = countRecords(sectionId);
        const sectionProgress = get().sections[sectionId];
        const recordsCompleted = (sectionProgress?.completedRecords.length || 0) >= total;
        const quizCompleted = !hasQuiz(sectionId) || get().isQuizPassed(sectionId);

        if (total > 0) {
          return recordsCompleted && quizCompleted;
        }

        return Boolean(sectionProgress?.completed) && quizCompleted;
      },

      getOverallPercentage: () => {
        const totalSections = _lessonSections.length;
        if (totalSections === 0) return 0;
        const completedSections = _lessonSections.filter((section) => get().isSectionCompleted(section.id)).length;
        return Math.round((completedSections / totalSections) * 100);
      },

      getCompletedSections: () => {
        return _lessonSections.filter((section) => get().isSectionCompleted(section.id)).length;
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
