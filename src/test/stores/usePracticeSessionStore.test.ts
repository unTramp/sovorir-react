import { beforeEach, describe, expect, it } from 'vitest';
import type { LearningItem } from '../../domain/learning';
import { useLearningItemStore } from '../../stores/useLearningItemStore';
import { usePracticeSessionStore } from '../../stores/usePracticeSessionStore';

const itemId = '11111111-1111-4111-8111-111111111111';
const lessonId = '22222222-2222-4222-8222-222222222222';

const learningItem: LearningItem = {
  id: itemId,
  revision: 1,
  type: 'phrase',
  armenian: 'Բարև',
  transliteration: 'barev',
  translation: 'Привет',
  contexts: ['Знакомый человек'],
  register: 'informal',
  difficulty: 1,
  tags: ['greeting'],
  reviewable: true,
};

describe('usePracticeSessionStore', () => {
  beforeEach(() => {
    useLearningItemStore.setState({
      items: { [itemId]: learningItem },
      reviewQueue: {
        [itemId]: {
          sourceLessonId: lessonId,
          unlockedAt: '2026-09-15T10:00:00.000Z',
          nextReviewAt: '2026-09-17T10:00:00.000Z',
        },
      },
    });
    usePracticeSessionStore.setState({ session: null });
  });

  it('starts a session from due canonical review items', () => {
    usePracticeSessionStore.getState().startSession(new Date('2026-09-18T10:00:00.000Z'));

    const session = usePracticeSessionStore.getState().session;
    expect(session?.cards).toEqual([{ itemId, mode: 'recall' }]);
    expect(session?.currentIndex).toBe(0);
  });

  it('schedules the next review and advances after self-rating', () => {
    const now = new Date('2026-09-18T10:00:00.000Z');
    usePracticeSessionStore.getState().startSession(now);
    usePracticeSessionStore.getState().answerCurrent('easy', now);

    const session = usePracticeSessionStore.getState().session;
    expect(session?.currentIndex).toBe(1);
    expect(session?.results[itemId]).toBe('easy');
    expect(useLearningItemStore.getState().reviewQueue[itemId].nextReviewAt)
      .toBe('2026-09-25T10:00:00.000Z');
  });
});
