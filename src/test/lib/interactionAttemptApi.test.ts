import { describe, expect, it } from 'vitest';
import { mapApiInteractionAttempt, toApiOutcome } from '../../lib/interactionAttemptApi';

const ids = {
  attempt: 'ce71c206-0190-4b63-b783-93a86bcfd9f0',
  lessonAttempt: '23b55515-ef1a-47c2-a793-3cb25080ca77',
  lesson: 'a00827d0-7029-4a6b-8e93-b7e155ff0be0',
  step: 'a56ddde2-73e3-4785-91d9-b73aa52df7eb',
  interaction: 'a6b5ac21-c11f-4b72-ae73-ab585d967b50',
};

describe('interactionAttemptApi', () => {
  it('maps backend needs_review outcome to the domain representation', () => {
    const attempt = mapApiInteractionAttempt({
      id: ids.attempt,
      lessonAttemptId: ids.lessonAttempt,
      lessonId: ids.lesson,
      lessonRevision: 1,
      stepId: ids.step,
      interactionId: ids.interaction,
      status: 'completed',
      outcome: 'needs_review',
      hintUsed: true,
      retryCount: 1,
      selectedOptionId: null,
      recordingId: null,
      startedAt: '2026-09-15T10:00:00.000Z',
      completedAt: '2026-09-15T10:00:10.000Z',
    });

    expect(attempt.outcome).toBe('needs-review');
    expect(attempt.selectedOptionId).toBeUndefined();
    expect(attempt.recordingId).toBeUndefined();
  });

  it('maps the domain needs-review outcome back to the backend contract', () => {
    expect(toApiOutcome('needs-review')).toBe('needs_review');
    expect(toApiOutcome('correct')).toBe('correct');
  });
});
