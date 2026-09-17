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
