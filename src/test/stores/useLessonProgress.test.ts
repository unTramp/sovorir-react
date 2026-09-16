import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../lib/contentRepository', () => ({
  contentRepository: {
    getLessonSections: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../lib/practiceEvents', () => ({
  practiceEvents: { emit: vi.fn() },
}));

import { useLessonProgress } from '../../stores/useLessonProgress';
import type { LessonContentSection } from '../../types/lessonContent';

const sectionsFixture: LessonContentSection[] = [
  {
    id: 1,
    title: 'Введение',
    blocks: [
      { type: 'heading', text: 'Введение' },
      { type: 'text', content: 'Короткое объяснение' },
    ],
  },
  {
    id: 2,
    title: 'Практика',
    blocks: [
      { type: 'heading', text: 'Практика' },
      { type: 'record', prompt: 'Повторите фразу' },
    ],
  },
  {
    id: 3,
    title: 'Итог',
    quizId: 'quiz-1',
    blocks: [
      { type: 'heading', text: 'Итог' },
      { type: 'text', content: 'Проверьте себя' },
    ],
  },
  {
    id: 4,
    title: 'Произношение',
    blocks: [
      { type: 'heading', text: 'Произношение' },
      { type: 'pronunciationPrompt', prompt: 'Повторите: Բարև' },
    ],
  },
];

beforeEach(() => {
  useLessonProgress.setState({
    sections: {},
    quizResults: {},
    sectionsReady: false,
  });
  useLessonProgress.getState()._initSections(sectionsFixture);
});

describe('useLessonProgress', () => {
  it('does not auto-complete content-only sections until they are explicitly completed', async () => {
    expect(useLessonProgress.getState().isSectionCompleted(1)).toBe(false);
    expect(useLessonProgress.getState().areSectionInteractionsComplete(1)).toBe(true);

    await useLessonProgress.getState().completeSection(1);

    expect(useLessonProgress.getState().isSectionCompleted(1)).toBe(true);
  });

  it('keeps interaction readiness separate from confirmed section completion', async () => {
    expect(useLessonProgress.getState().isSectionCompleted(2)).toBe(false);
    expect(useLessonProgress.getState().areSectionInteractionsComplete(2)).toBe(false);

    useLessonProgress.getState().completeRecord(2, 0);

    expect(useLessonProgress.getState().areSectionInteractionsComplete(2)).toBe(true);
    expect(useLessonProgress.getState().isSectionCompleted(2)).toBe(false);

    await useLessonProgress.getState().completeSection(2);
    expect(useLessonProgress.getState().isSectionCompleted(2)).toBe(true);
  });

  it('rewinds the interaction sequence when a recording is retried', () => {
    const store = useLessonProgress.getState();
    store.completeRecord(2, 0);
    store.completeRecord(2, 1);
    store.completeRecord(2, 2);

    store.retryRecord(2, 1);

    expect(useLessonProgress.getState().sections[2]).toMatchObject({
      completed: false,
      completedRecords: [0],
      completionStatus: 'idle',
    });
  });

  it('treats pronunciation prompts as record-like completion gates', async () => {
    expect(useLessonProgress.getState().isSectionCompleted(4)).toBe(false);

    useLessonProgress.getState().completeRecord(4, 0);

    expect(useLessonProgress.getState().areSectionInteractionsComplete(4)).toBe(true);
    await useLessonProgress.getState().completeSection(4);
    expect(useLessonProgress.getState().isSectionCompleted(4)).toBe(true);
  });

  it('requires a passed quiz before explicit completion', async () => {
    expect(await useLessonProgress.getState().completeSection(3)).toBe(false);
    expect(useLessonProgress.getState().isSectionCompleted(3)).toBe(false);

    useLessonProgress.getState().saveQuizResult(3, {
      quizId: 'quiz-1',
      score: 100,
      total: 1,
      passed: true,
      completedAt: Date.now(),
    });

    expect(useLessonProgress.getState().areSectionInteractionsComplete(3)).toBe(true);
    expect(await useLessonProgress.getState().completeSection(3)).toBe(true);
    expect(useLessonProgress.getState().isSectionCompleted(3)).toBe(true);
  });

  it('computes overall percentage from explicitly completed sections', async () => {
    await useLessonProgress.getState().completeSection(1);
    useLessonProgress.getState().completeRecord(2, 0);
    await useLessonProgress.getState().completeSection(2);

    expect(useLessonProgress.getState().getOverallPercentage()).toBe(50);
    expect(useLessonProgress.getState().getCompletedSections()).toBe(2);
  });

  it('hydrates confirmed completion returned by the server', () => {
    useLessonProgress.getState()._initSections([{ ...sectionsFixture[0], serverCompleted: true }]);
    expect(useLessonProgress.getState().isSectionCompleted(1)).toBe(true);
    expect(useLessonProgress.getState().sections[1]?.completionStatus).toBe('confirmed');
  });
});
