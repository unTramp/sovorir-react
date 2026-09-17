import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isMockApiEnabled } from '../lib/apiClient';
import type { LessonContentSection } from '../types/lessonContent';
import type { QuizResult } from '../types/quiz';
import { practiceEvents } from '../lib/practiceEvents';
import { apiClient } from '../lib/apiClient';

interface SectionProgress {
  completedRecords: number[];
  completed: boolean;
  completionStatus?: 'idle' | 'syncing' | 'confirmed' | 'error';
  completionError?: string;
}

interface LessonProgressState {
  // sectionId → SectionProgress
  sections: Record<number, SectionProgress>;
  quizResults: Record<number, QuizResult>;
  sectionsReady: boolean;

  // Actions
  _initSections: (sections: LessonContentSection[]) => void;
  completeRecord: (sectionId: number, recordIndex: number) => void;
  retryRecord: (sectionId: number, recordIndex: number) => void;
  completeSection: (sectionId: number) => Promise<boolean>;
  getCompletedCount: (sectionId: number) => number;
  getTotalRecords: (sectionId: number) => number;
  areSectionInteractionsComplete: (sectionId: number) => boolean;
  isSectionCompleted: (sectionId: number) => boolean;
  getOverallPercentage: () => number;
  getCompletedSections: () => number;
  saveQuizResult: (sectionId: number, result: QuizResult) => void;
  isQuizPassed: (sectionId: number) => boolean;
}

// Module-level cache — populated only by useLessonSectionsStore.
let _lessonSections: LessonContentSection[] = [];

/** Keep progress calculations aligned with the latest accepted sections response. */
export function syncLessonSectionsCache(sections: LessonContentSection[]): void {
  _lessonSections = sections;
  useLessonProgress.getState()._initSections(sections);
}

/** POSTs all locally-completed sections that have a server UUID — awaitable before navigation. */
export async function syncCompletedSectionsToServer(): Promise<void> {
  if (isMockApiEnabled) return;
  const completedSectionIds = Object.entries(useLessonProgress.getState().sections)
    .filter(([, v]) => v.completed)
    .map(([k]) => Number(k));
  await Promise.allSettled(
    completedSectionIds
      .map((id) => _lessonSections.find((s) => s.id === id))
      .filter((s): s is LessonContentSection & { apiId: string } => Boolean(s?.apiId))
      .map((s) => apiClient.post(`/sections/${s.apiId}/complete`, {})),
  );
}

function countRecords(sectionId: number): number {
  const section = _lessonSections.find((item) => item.id === sectionId);
  if (!section) return 0;
  return section.blocks.filter((b) => b.type === 'record'
    || b.type === 'pronunciationPrompt'
    || b.type === 'dialogue'
    || b.type === 'activeRecall').length;
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
        set((state) => {
          const nextSections = { ...state.sections };
          sections.forEach((section) => {
            if (!section.serverCompleted) return;
            const current = nextSections[section.id];
            nextSections[section.id] = {
              completedRecords: current?.completedRecords ?? [],
              completed: true,
              completionStatus: 'confirmed',
            };
          });
          return { sections: nextSections, sectionsReady: true };
        });
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
                completionStatus: state.sections[sectionId]?.completionStatus ?? 'idle',
              },
            },
          };
        }),

      retryRecord: (sectionId, recordIndex) =>
        set((state) => ({
          sections: {
            ...state.sections,
            [sectionId]: {
              completed: false,
              completedRecords: (state.sections[sectionId]?.completedRecords ?? [])
                .filter((index) => index < recordIndex),
              completionStatus: 'idle',
              completionError: undefined,
            },
          },
        })),

      completeSection: async (sectionId) => {
        if (!get().areSectionInteractionsComplete(sectionId)) return false;

        const setCompletionState = (
          completed: boolean,
          completionStatus: SectionProgress['completionStatus'],
          completionError?: string,
        ) => set((state) => ({
          sections: {
            ...state.sections,
            [sectionId]: {
              completed,
              completedRecords: state.sections[sectionId]?.completedRecords ?? [],
              completionStatus,
              completionError,
            },
          },
        }));

        const section = _lessonSections.find((item) => item.id === sectionId);
        if (isMockApiEnabled || !section?.apiId) {
          setCompletionState(true, 'confirmed');
          return true;
        }

        setCompletionState(false, 'syncing');
        try {
          await apiClient.post(`/sections/${section.apiId}/complete`, {});
          setCompletionState(true, 'confirmed');
          return true;
        } catch {
          setCompletionState(false, 'error', 'Не удалось сохранить прогресс. Проверьте соединение и попробуйте ещё раз.');
          return false;
        }
      },

      getCompletedCount: (sectionId) => {
        return get().sections[sectionId]?.completedRecords.length || 0;
      },

      getTotalRecords: (sectionId) => countRecords(sectionId),

      areSectionInteractionsComplete: (sectionId) => {
        const total = countRecords(sectionId);
        const sectionProgress = get().sections[sectionId];
        const recordsCompleted = (sectionProgress?.completedRecords.length || 0) >= total;
        const quizCompleted = !hasQuiz(sectionId) || get().isQuizPassed(sectionId);
        return recordsCompleted && quizCompleted;
      },

      isSectionCompleted: (sectionId) => {
        return Boolean(get().sections[sectionId]?.completed);
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
