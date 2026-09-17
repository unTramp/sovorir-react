import { create } from 'zustand';
import { contentRepository, apiContentRepository } from '../lib/contentRepository';
import { subscribeAdminLessonBuilderSync } from '../lib/adminLessonBuilderStorage';
import { syncLessonSectionsCache } from './useLessonProgress';
import type { LessonContentSection } from '../types/lessonContent';
import { useLearningItemStore } from './useLearningItemStore';
import { useFlashcardStore } from './useFlashcardStore';
import type { DictionaryWord } from '../types/dictionary';

interface LessonSectionsState {
  sections: LessonContentSection[];
  isLoading: boolean;
  error: string | null;
  reload: (invalidate?: boolean) => void;
  selectLesson: (apiId?: string) => void;
}

let reloadSequence = 0;

export const useLessonSectionsStore = create<LessonSectionsState>((set) => ({
  sections: [],
  isLoading: true,
  error: null,

  reload: (invalidate = false) => {
    const requestId = ++reloadSequence;
    if (invalidate) apiContentRepository.invalidate();
    set({ isLoading: true, error: null });
    void contentRepository.getLessonSections()
      .then((sections) => {
        if (requestId !== reloadSequence) return;
        set({ sections, isLoading: false });
        const canonicalItems = [...new Map(sections
          .flatMap((section) => section.canonical?.learningItems ?? [])
          .map((item) => [item.id, item])).values()];
        if (canonicalItems.length > 0) useLearningItemStore.getState().upsertItems(canonicalItems);
        if (canonicalItems.length > 0) {
          const practiceWords: DictionaryWord[] = canonicalItems.map((item) => ({
            id: item.id,
            armenian: item.armenian,
            transcription: item.transliteration,
            translation: item.translation,
            example: item.contexts[0] ?? '',
            exampleTranslation: '',
            category: item.tags[0] ?? item.type,
            audioSrc: item.audio?.normal.url,
          }));
          useFlashcardStore.getState()._initWords(practiceWords);
        }
        syncLessonSectionsCache(sections);
      })
      .catch((error: unknown) => {
        if (requestId !== reloadSequence) return;
        const message = error instanceof Error ? error.message : 'Не удалось загрузить урок';
        set({ sections: [], isLoading: false, error: message });
      });
  },
  selectLesson: (apiId) => {
    reloadSequence++;
    apiContentRepository.selectLesson(apiId ?? null);
    set({ sections: [], isLoading: true, error: null });
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
