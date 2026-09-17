import { describe, expect, it } from 'vitest';
import { getResumeSectionNumber } from '../../lib/lessonNavigation';
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
