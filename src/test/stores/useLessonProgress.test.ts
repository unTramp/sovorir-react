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
  it('does not auto-complete content-only sections until they are explicitly completed', () => {
    expect(useLessonProgress.getState().isSectionCompleted(1)).toBe(false);

    useLessonProgress.getState().completeSection(1);

    expect(useLessonProgress.getState().isSectionCompleted(1)).toBe(true);
  });

  it('completes record sections only after all record prompts are done', () => {
    expect(useLessonProgress.getState().isSectionCompleted(2)).toBe(false);

    useLessonProgress.getState().completeRecord(2, 0);

    expect(useLessonProgress.getState().isSectionCompleted(2)).toBe(true);
  });

  it('requires a passed quiz for quiz sections even when there are no record prompts', () => {
    useLessonProgress.getState().completeSection(3);
    expect(useLessonProgress.getState().isSectionCompleted(3)).toBe(false);

    useLessonProgress.getState().saveQuizResult(3, {
      quizId: 'quiz-1',
      score: 100,
      total: 1,
      passed: true,
      completedAt: Date.now(),
    });

    expect(useLessonProgress.getState().isSectionCompleted(3)).toBe(true);
  });

  it('computes overall percentage from completed sections instead of record counts', () => {
    useLessonProgress.getState().completeSection(1);
    useLessonProgress.getState().completeRecord(2, 0);

    expect(useLessonProgress.getState().getOverallPercentage()).toBe(67);
    expect(useLessonProgress.getState().getCompletedSections()).toBe(2);
  });
});
