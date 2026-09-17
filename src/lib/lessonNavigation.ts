import type { Lesson } from '../types/lesson';

/**
 * Returns the 1-based section number the learner should resume from.
 * Completed lessons reopen at section 1 for intentional review.
 */
export function getResumeSectionNumber(lesson: Lesson): number {
  if (lesson.status === 'completed') return 1;

  const firstIncompleteIndex = lesson.sections.findIndex(
    (section) => section.type !== 'video' && section.status !== 'completed',
  );

  return firstIncompleteIndex >= 0 ? firstIncompleteIndex + 1 : 1;
}

/**
 * Builds a reload-safe lesson URL. `apiId` is the stable backend identity;
 * numeric `lesson.id` remains presentation/order only.
 */
export function getLessonPath(lessonApiId: string | undefined, section: number): string {
  const params = new URLSearchParams();
  if (lessonApiId) params.set('lesson', lessonApiId);
  params.set('section', String(Math.max(1, Math.trunc(section))));
  return `/lesson?${params.toString()}`;
}

/**
 * Resolves lesson identity from the URL. A direct legacy `/lesson` intentionally
 * follows the catalog's current lesson instead of an in-memory numeric selection.
 * Explicit deep links may reopen completed lessons, but never locked lessons.
 */
export function resolveLessonForRoute(
  lessons: Lesson[],
  currentLesson: Lesson | null,
  requestedLessonApiId: string | null,
): Lesson | null {
  if (!requestedLessonApiId) return currentLesson;
  return lessons.find(
    (lesson) => lesson.apiId === requestedLessonApiId && lesson.status !== 'locked',
  ) ?? null;
}
