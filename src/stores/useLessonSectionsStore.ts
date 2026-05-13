import { create } from 'zustand';
import { contentRepository } from '../lib/contentRepository';
import { subscribeAdminLessonBuilderSync } from '../lib/adminLessonBuilderStorage';
import type { LessonContentSection } from '../types/lessonContent';

interface LessonSectionsState {
  sections: LessonContentSection[];
  reload: () => void;
}

export const useLessonSectionsStore = create<LessonSectionsState>((set) => ({
  sections: [],

  reload: () => {
    void contentRepository.getLessonSections().then((sections) => {
      set({ sections });
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
