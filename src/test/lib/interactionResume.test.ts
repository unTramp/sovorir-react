import { describe, expect, it } from 'vitest';
import type { InteractionAttempt } from '../../domain/learning';
import { completedRecordIndicesFromAttempts, latestLessonAttemptId } from '../../lib/interactionResume';
import type { LessonContentSection } from '../../types/lessonContent';

const ids = {
  lesson: 'a00827d0-7029-4a6b-8e93-b7e155ff0be0',
  sessionOld: '23b55515-ef1a-47c2-a793-3cb25080ca77',
  sessionNew: '1d165d11-ad56-469a-a1ee-e708d42a90ab',
  step: 'a56ddde2-73e3-4785-91d9-b73aa52df7eb',
  interaction1: 'a6b5ac21-c11f-4b72-ae73-ab585d967b50',
  interaction2: 'c9c0e429-bd85-4b2a-a681-cbb7bf2d5fe0',
};

function attempt(overrides: Partial<InteractionAttempt>): InteractionAttempt {
  return {
    id: crypto.randomUUID(),
    lessonAttemptId: ids.sessionNew,
    lessonId: ids.lesson,
    lessonRevision: 1,
    stepId: ids.step,
    interactionId: ids.interaction1,
    status: 'completed',
    hintUsed: false,
    retryCount: 0,
    startedAt: '2026-09-17T10:00:00.000Z',
    completedAt: '2026-09-17T10:00:10.000Z',
    ...overrides,
  };
}

const section = {
  id: 3,
  title: 'Practice',
  blocks: [
    {
      type: 'dialogue',
      characterName: 'Ани',
      message: 'Բարև',
      instruction: 'Ответьте',
      options: [],
      tracking: {
        lessonId: ids.lesson,
        lessonRevision: 1,
        stepId: ids.step,
        interactionId: ids.interaction1,
        learningItemIds: [],
      },
    },
    {
      type: 'activeRecall',
      prompt: 'Вспомните фразу',
      hint: 'Подсказка',
      answer: { armenian: 'Բարև', transcription: 'barev', translation: 'привет' },
      reviewIds: [],
      tracking: {
        lessonId: ids.lesson,
        lessonRevision: 1,
        stepId: ids.step,
        interactionId: ids.interaction2,
        learningItemIds: [],
      },
    },
  ],
} satisfies LessonContentSection;

describe('interaction resume', () => {
  it('adopts the session containing the newest lesson attempt', () => {
    const attempts = [
      attempt({ lessonAttemptId: ids.sessionOld, startedAt: '2026-09-17T09:00:00.000Z' }),
      attempt({ lessonAttemptId: ids.sessionNew, startedAt: '2026-09-17T10:00:00.000Z' }),
    ];

    expect(latestLessonAttemptId(attempts, ids.lesson)).toBe(ids.sessionNew);
  });

  it('restores only the sequential completed prefix for the active session', () => {
    const attempts = [
      attempt({ interactionId: ids.interaction1, status: 'completed' }),
      attempt({
        interactionId: ids.interaction2,
        status: 'started',
        startedAt: '2026-09-17T10:01:00.000Z',
        completedAt: undefined,
      }),
    ];

    expect(completedRecordIndicesFromAttempts(section, attempts, ids.sessionNew)).toEqual([0]);
  });

  it('restores all interactions once the latest attempts are complete', () => {
    const attempts = [
      attempt({ interactionId: ids.interaction1, status: 'completed' }),
      attempt({ interactionId: ids.interaction2, status: 'completed', startedAt: '2026-09-17T10:01:00.000Z' }),
    ];

    expect(completedRecordIndicesFromAttempts(section, attempts, ids.sessionNew)).toEqual([0, 1]);
  });
});
