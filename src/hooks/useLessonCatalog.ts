import { useEffect, useMemo } from 'react';
import { useLessonCatalogStore } from '../stores/useLessonCatalogStore';
import {
  subscribeAdminLessonBuilderSync,
} from '../lib/adminLessonBuilderStorage';

export function useLessonCatalog() {
  const lessons = useLessonCatalogStore((s) => s.lessons);
  const isLoading = useLessonCatalogStore((s) => s.isLoading);
  const hasLoaded = useLessonCatalogStore((s) => s.hasLoaded);
  const error = useLessonCatalogStore((s) => s.error);
  const reloadLessons = useLessonCatalogStore((s) => s.reloadLessons);

  useEffect(() => {
    void useLessonCatalogStore.getState().loadLessons();
  }, []);

  useEffect(() => {
    function handleSync() {
      void reloadLessons();
    }

    function handleFocus() {
      void reloadLessons();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void reloadLessons();
      }
    }

    const unsubscribeSync = subscribeAdminLessonBuilderSync(handleSync);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      unsubscribeSync();
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [reloadLessons]);

  const currentLesson = useMemo(
    () => lessons.find((lesson) => lesson.status === 'current') ?? lessons[0] ?? null,
    [lessons],
  );

  const completedLessons = useMemo(
    () => lessons.filter((lesson) => lesson.status === 'completed').length,
    [lessons],
  );

  return {
    lessons,
    currentLesson,
    completedLessons,
    isLoading,
    hasLoaded,
    error,
  };
}
