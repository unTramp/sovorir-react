import { create } from 'zustand';
import { contentRepository, apiContentRepository } from '../lib/contentRepository';
import type { Lesson } from '../types/lesson';

interface LessonCatalogState {
  lessons: Lesson[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  loadLessons: () => Promise<void>;
  reloadLessons: () => Promise<void>;
}

let loadPromise: Promise<void> | null = null;

export const useLessonCatalogStore = create<LessonCatalogState>((set) => ({
  lessons: [],
  isLoading: false,
  hasLoaded: false,
  error: null,

  loadLessons: async () => {
    const state = useLessonCatalogStore.getState();

    if (state.hasLoaded || state.isLoading) {
      return loadPromise ?? Promise.resolve();
    }

    set({ isLoading: true, error: null });

    loadPromise = contentRepository
      .getLessons()
      .then((lessons) => {
        set({
          lessons,
          isLoading: false,
          hasLoaded: true,
          error: null,
        });
      })
      .catch((error: unknown) => {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Не удалось загрузить уроки',
        });
      })
      .finally(() => {
        loadPromise = null;
      });

    return loadPromise;
  },

  reloadLessons: async () => {
    apiContentRepository.invalidate();
    set({ isLoading: true, error: null });
    try {
      const lessons = await contentRepository.getLessons();
      set({
        lessons,
        isLoading: false,
        hasLoaded: true,
        error: null,
      });
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Не удалось загрузить уроки',
      });
    }
  },
}));
