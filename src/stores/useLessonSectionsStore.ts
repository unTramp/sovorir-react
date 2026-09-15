import { create } from 'zustand';
import { contentRepository, apiContentRepository } from '../lib/contentRepository';
import { subscribeAdminLessonBuilderSync } from '../lib/adminLessonBuilderStorage';
import { syncLessonSectionsCache } from './useLessonProgress';
import type { LessonContentSection } from '../types/lessonContent';

interface LessonSectionsState {
  sections: LessonContentSection[];
  isLoading: boolean;
  error: string | null;
  reload: (invalidate?: boolean) => void;
}

export const useLessonSectionsStore = create<LessonSectionsState>((set) => ({
  sections: [],
  isLoading: true,
  error: null,

  reload: (invalidate = false) => {
    if (invalidate) apiContentRepository.invalidate();
    set({ isLoading: true, error: null });
    void contentRepository.getLessonSections()
      .then((sections) => {
        set({ sections, isLoading: false });
        syncLessonSectionsCache(sections); // keep useLessonProgress._lessonSections in sync
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Не удалось загрузить урок';
        set({ sections: [], isLoading: false, error: message });
      });
  },
}));

// Initial load
useLessonSectionsStore.getState().reload();

// Reload when admin builder pushes changes
subscribeAdminLessonBuilderSync(() => useLessonSectionsStore.getState().reload());

// Reload on window focus and tab visibility restore
if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => useLessonSectionsStore.getState().reload());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      useLessonSectionsStore.getState().reload();
    }
  });
}
