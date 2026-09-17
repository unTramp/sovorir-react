import { beforeEach, describe, expect, it } from 'vitest';
import { resetUserProgress } from '../../lib/resetUserProgress';
import { useAppStore } from '../../stores/useAppStore';
import { useInteractionAttemptStore } from '../../stores/useInteractionAttemptStore';
import { useLearningItemStore } from '../../stores/useLearningItemStore';
import { useLessonAttemptSessionStore } from '../../stores/useLessonAttemptSessionStore';
import { useLessonProgress } from '../../stores/useLessonProgress';
import { useLessonSectionsStore } from '../../stores/useLessonSectionsStore';
import { useLessonStore } from '../../stores/useLessonStore';
import { useFlashcardStore } from '../../stores/useFlashcardStore';
import { usePracticeSessionStore } from '../../stores/usePracticeSessionStore';
import { useRecordingStore } from '../../stores/useRecordingStore';

const id = '0e4f97bb-9e24-4fbb-8f88-c44a3ff6e710';

describe('resetUserProgress', () => {
  beforeEach(() => {
    useLessonProgress.setState({
      sections: { 4: { completedRecords: [0, 1], completed: true } },
      quizResults: { 4: { quizId: 'quiz', score: 1, total: 1, passed: true, completedAt: Date.now() } },
      sectionsReady: true,
    });
    useLearningItemStore.setState({ items: {}, reviewQueue: { [id]: { sourceLessonId: id, unlockedAt: '2026-09-15', nextReviewAt: '2026-09-16' } } });
    useInteractionAttemptStore.setState({ attempts: { [id]: {} as never }, syncState: { [id]: 'error' } });
    useLessonAttemptSessionStore.setState({ attemptIds: { [id]: id } });
    useFlashcardStore.setState({
      progress: { word: { wordId: 'word', interval: 3, nextReview: Date.now(), easeFactor: 2.5 } },
      availableWordIds: ['word'],
      session: { cards: ['word'], currentIndex: 0, results: {} },
    });
    usePracticeSessionStore.setState({
      session: {
        cards: [{ itemId: id, mode: 'recall' }],
        currentIndex: 0,
        results: {},
        startedAt: '2026-09-18T00:00:00.000Z',
      },
    });
    useRecordingStore.setState({ recordings: {} });
    useAppStore.getState().setCurrentLesson(3);
    useLessonStore.setState({ currentSection: 4, isFullscreen: true });
  });

  it('clears learning progress and returns navigation state to Lesson 1', async () => {
    await resetUserProgress();

    expect(useLessonProgress.getState()).toMatchObject({ sections: {}, quizResults: {}, sectionsReady: false });
    expect(useLearningItemStore.getState()).toMatchObject({ items: {}, reviewQueue: {} });
    expect(useInteractionAttemptStore.getState()).toMatchObject({ attempts: {}, syncState: {} });
    expect(useLessonAttemptSessionStore.getState().attemptIds).toEqual({});
    expect(useFlashcardStore.getState()).toMatchObject({ progress: {}, availableWordIds: [], session: null });
    expect(usePracticeSessionStore.getState().session).toBeNull();
    expect(useRecordingStore.getState().recordings).toEqual({});
    expect(useAppStore.getState().currentLesson).toBe(1);
    expect(useLessonStore.getState()).toMatchObject({ currentSection: 1, isFullscreen: false });
    expect(useLessonSectionsStore.getState().sections).toEqual([]);
  });
});