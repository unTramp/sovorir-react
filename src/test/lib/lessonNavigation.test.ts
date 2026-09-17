import { describe, expect, it } from 'vitest';
import { getLessonPath, getResumeSectionNumber, resolveLessonForRoute } from '../../lib/lessonNavigation';
import type { Lesson } from '../../types/lesson';

function makeLesson(overrides: Partial<Lesson> = {}): Lesson {
  return {
    id: 1,
    apiId: 'lesson-1',
    title: 'Lesson 1',
    icon: '📖',
    status: 'current',
    sections: [
      { id: 's1', title: 'One', type: 'lesson', icon: '1', status: 'completed' },
      { id: 's2', title: 'Two', type: 'lesson', icon: '2', status: 'in-progress' },
      { id: 's3', title: 'Three', type: 'lesson', icon: '3', status: 'pending' },
    ],
    ...overrides,
  };
}

describe('getResumeSectionNumber', () => {
  it('returns the first incomplete section', () => {
    expect(getResumeSectionNumber(makeLesson())).toBe(2);
  });

  it('ignores video sections when choosing resume position', () => {
    const lesson = makeLesson({
      sections: [
        { id: 'video', title: 'Video', type: 'video', icon: 'v', status: 'pending' },
        { id: 's1', title: 'One', type: 'lesson', icon: '1', status: 'in-progress' },
      ],
    });

    expect(getResumeSectionNumber(lesson)).toBe(2);
  });

  it('reopens completed lessons from section one for review', () => {
    expect(getResumeSectionNumber(makeLesson({ status: 'completed' }))).toBe(1);
  });
});

describe('stable lesson routing', () => {
  const completedLesson1 = makeLesson({ id: 1, apiId: 'api-lesson-1', status: 'completed' });
  const currentLesson2 = makeLesson({ id: 2, apiId: 'api-lesson-2', title: 'Lesson 2', status: 'current' });
  const lockedLesson3 = makeLesson({ id: 3, apiId: 'api-lesson-3', title: 'Lesson 3', status: 'locked' });
  const lessons = [completedLesson1, currentLesson2, lockedLesson3];

  it('builds a URL that survives reload without numeric lesson state', () => {
    expect(getLessonPath('api-lesson-2', 3)).toBe('/lesson?lesson=api-lesson-2&section=3');
  });

  it('opens catalog current lesson for a direct legacy /lesson route', () => {
    expect(resolveLessonForRoute(lessons, currentLesson2, null)).toBe(currentLesson2);
  });

  it('reopens an explicitly linked completed lesson for review', () => {
    expect(resolveLessonForRoute(lessons, currentLesson2, 'api-lesson-1')).toBe(completedLesson1);
  });

  it('does not fall back when an explicit lesson id is locked or invalid', () => {
    expect(resolveLessonForRoute(lessons, currentLesson2, 'api-lesson-3')).toBeNull();
    expect(resolveLessonForRoute(lessons, currentLesson2, 'missing')).toBeNull();
  });
});
