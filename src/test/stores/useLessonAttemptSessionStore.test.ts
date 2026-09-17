import { beforeEach, describe, expect, it } from 'vitest';
import { useLessonAttemptSessionStore } from '../../stores/useLessonAttemptSessionStore';

const lessonId = 'a00827d0-7029-4a6b-8e93-b7e155ff0be0';
const hydratedId = '23b55515-ef1a-47c2-a793-3cb25080ca77';
const existingId = '1d165d11-ad56-469a-a1ee-e708d42a90ab';

beforeEach(() => useLessonAttemptSessionStore.setState({ attemptIds: {} }));

describe('useLessonAttemptSessionStore', () => {
  it('adopts a hydrated session when no local session exists', () => {
    useLessonAttemptSessionStore.getState().adoptAttemptId(lessonId, hydratedId);
    expect(useLessonAttemptSessionStore.getState().attemptIds[lessonId]).toBe(hydratedId);
  });

  it('does not replace an existing local session with hydrated history', () => {
    useLessonAttemptSessionStore.setState({ attemptIds: { [lessonId]: existingId } });
    useLessonAttemptSessionStore.getState().adoptAttemptId(lessonId, hydratedId);
    expect(useLessonAttemptSessionStore.getState().attemptIds[lessonId]).toBe(existingId);
  });
});
