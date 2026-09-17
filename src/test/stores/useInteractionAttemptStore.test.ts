import { beforeEach, describe, expect, it } from 'vitest';
import { useInteractionAttemptStore } from '../../stores/useInteractionAttemptStore';

const ids = {
  attempt: 'ce71c206-0190-4b63-b783-93a86bcfd9f0',
  lessonAttempt: '23b55515-ef1a-47c2-a793-3cb25080ca77',
  lesson: 'a00827d0-7029-4a6b-8e93-b7e155ff0be0',
  step: 'a56ddde2-73e3-4785-91d9-b73aa52df7eb',
  interaction: 'a6b5ac21-c11f-4b72-ae73-ab585d967b50',
  recording: 'a0b58b59-6557-4d26-9613-b0b59b4be662',
};

beforeEach(() => useInteractionAttemptStore.setState({ attempts: {} }));

describe('useInteractionAttemptStore', () => {
  it('moves an attempt from started to completed and keeps learning signals', () => {
    const id = useInteractionAttemptStore.getState().startAttempt({
      id: ids.attempt,
      lessonAttemptId: ids.lessonAttempt,
      lessonId: ids.lesson,
      lessonRevision: 1,
      stepId: ids.step,
      interactionId: ids.interaction,
      hintUsed: false,
      retryCount: 0,
      startedAt: '2026-09-15T10:00:00.000Z',
    });

    useInteractionAttemptStore.getState().completeAttempt(id, 'needs-review', {
      hintUsed: true,
      retryCount: 1,
      recordingId: ids.recording,
      completedAt: '2026-09-15T10:00:10.000Z',
    });

    expect(useInteractionAttemptStore.getState().attempts[id]).toMatchObject({
      status: 'completed', outcome: 'needs-review', hintUsed: true, retryCount: 1, recordingId: ids.recording,
    });
  });

  it('returns the latest attempt and clears only one lesson session', () => {
    useInteractionAttemptStore.getState().startAttempt({
      id: ids.attempt, lessonAttemptId: ids.lessonAttempt, lessonId: ids.lesson, lessonRevision: 1,
      stepId: ids.step, interactionId: ids.interaction, hintUsed: false, retryCount: 0,
      startedAt: '2026-09-15T10:00:00.000Z',
    });
    const latestId = useInteractionAttemptStore.getState().startAttempt({
      lessonAttemptId: ids.lessonAttempt, lessonId: ids.lesson, lessonRevision: 1,
      stepId: ids.step, interactionId: ids.interaction, hintUsed: false, retryCount: 1,
      startedAt: '2026-09-15T10:01:00.000Z',
    });
    expect(useInteractionAttemptStore.getState().getLatestAttempt(ids.lessonAttempt, ids.interaction)?.id).toBe(latestId);
    useInteractionAttemptStore.getState().clearLessonAttempts(ids.lessonAttempt);
    expect(Object.keys(useInteractionAttemptStore.getState().attempts)).toHaveLength(0);
  });
});
