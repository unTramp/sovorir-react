import { apiClient, isMockApiEnabled } from './apiClient';
import { apiContentRepository } from './contentRepository';
import { useAppStore } from '../stores/useAppStore';
import { useInteractionAttemptStore } from '../stores/useInteractionAttemptStore';
import { useLearningItemStore } from '../stores/useLearningItemStore';
import { useLessonAttemptSessionStore } from '../stores/useLessonAttemptSessionStore';
import { useLessonCatalogStore } from '../stores/useLessonCatalogStore';
import { useLessonProgress } from '../stores/useLessonProgress';
import { useLessonSectionsStore } from '../stores/useLessonSectionsStore';
import { useLessonStore } from '../stores/useLessonStore';
import { useFlashcardStore } from '../stores/useFlashcardStore';
import { useRecordingStore } from '../stores/useRecordingStore';

export async function resetUserProgress(): Promise<void> {
  if (!isMockApiEnabled) {
    await apiClient.delete('/progress');
  }

  useLessonProgress.setState({ sections: {}, quizResults: {}, sectionsReady: false });
  useLearningItemStore.setState({ items: {}, reviewQueue: {} });
  useInteractionAttemptStore.setState({ attempts: {} });
  useLessonAttemptSessionStore.setState({ attemptIds: {} });
  useFlashcardStore.setState({ progress: {}, availableWordIds: [], session: null });
  await useRecordingStore.getState().clearRecordings();

  useAppStore.getState().setCurrentLesson(1);
  useLessonStore.setState({ currentSection: 1, isFullscreen: false });

  apiContentRepository.selectLesson(null);
  apiContentRepository.invalidate();
  useLessonCatalogStore.setState({ lessons: [], isLoading: false, hasLoaded: false, error: null });
  useLessonSectionsStore.setState({ sections: [], isLoading: true, error: null });

  await useLessonCatalogStore.getState().reloadLessons();
}
