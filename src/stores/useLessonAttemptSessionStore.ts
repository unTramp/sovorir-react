import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UUID } from '../domain/learning';

function createUuid(): UUID {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

interface LessonAttemptSessionState {
  attemptIds: Record<UUID, UUID>;
  getOrCreateAttemptId: (lessonId: UUID) => UUID;
  adoptAttemptId: (lessonId: UUID, attemptId: UUID) => void;
  finishAttempt: (lessonId: UUID) => void;
}

export const useLessonAttemptSessionStore = create<LessonAttemptSessionState>()(
  persist(
    (set, get) => ({
      attemptIds: {},
      getOrCreateAttemptId: (lessonId) => {
        const existing = get().attemptIds[lessonId];
        if (existing) return existing;
        const attemptId = createUuid();
        set((state) => ({ attemptIds: { ...state.attemptIds, [lessonId]: attemptId } }));
        return attemptId;
      },
      adoptAttemptId: (lessonId, attemptId) => set((state) => {
        if (state.attemptIds[lessonId]) return state;
        return { attemptIds: { ...state.attemptIds, [lessonId]: attemptId } };
      }),
      finishAttempt: (lessonId) => set((state) => {
        const attemptIds = { ...state.attemptIds };
        delete attemptIds[lessonId];
        return { attemptIds };
      }),
    }),
    { name: 'sovorir-lesson-attempt-sessions-v1', version: 1 },
  ),
);

