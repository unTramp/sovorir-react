import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InteractionAttempt, InteractionAttemptOutcome, UUID } from '../domain/learning';

type StartAttemptInput = Omit<InteractionAttempt, 'id' | 'status' | 'outcome' | 'startedAt' | 'completedAt'> & {
  id?: UUID;
  startedAt?: string;
};

interface CompleteAttemptPatch {
  hintUsed?: boolean;
  retryCount?: number;
  selectedOptionId?: UUID;
  recordingId?: UUID;
  completedAt?: string;
}

interface InteractionAttemptState {
  attempts: Record<UUID, InteractionAttempt>;
  startAttempt: (input: StartAttemptInput) => UUID;
  completeAttempt: (id: UUID, outcome: InteractionAttemptOutcome, patch?: CompleteAttemptPatch) => void;
  skipAttempt: (id: UUID, completedAt?: string) => void;
  getLatestAttempt: (lessonAttemptId: UUID, interactionId: UUID) => InteractionAttempt | undefined;
  clearLessonAttempts: (lessonAttemptId: UUID) => void;
}

function newUuid(): UUID {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export const useInteractionAttemptStore = create<InteractionAttemptState>()(
  persist(
    (set, get) => ({
      attempts: {},
      startAttempt: (input) => {
        const id = input.id ?? newUuid();
        const attempt: InteractionAttempt = {
          ...input,
          id,
          status: 'started',
          startedAt: input.startedAt ?? new Date().toISOString(),
        };
        set((state) => ({ attempts: { ...state.attempts, [id]: attempt } }));
        return id;
      },
      completeAttempt: (id, outcome, patch = {}) => set((state) => {
        const attempt = state.attempts[id];
        if (!attempt) return state;
        return {
          attempts: {
            ...state.attempts,
            [id]: {
              ...attempt,
              ...patch,
              status: 'completed',
              outcome,
              completedAt: patch.completedAt ?? new Date().toISOString(),
            },
          },
        };
      }),
      skipAttempt: (id, completedAt) => set((state) => {
        const attempt = state.attempts[id];
        if (!attempt) return state;
        return {
          attempts: {
            ...state.attempts,
            [id]: { ...attempt, status: 'skipped', completedAt: completedAt ?? new Date().toISOString() },
          },
        };
      }),
      getLatestAttempt: (lessonAttemptId, interactionId) => Object.values(get().attempts)
        .filter((attempt) => attempt.lessonAttemptId === lessonAttemptId && attempt.interactionId === interactionId)
        .sort((left, right) => right.startedAt.localeCompare(left.startedAt))[0],
      clearLessonAttempts: (lessonAttemptId) => set((state) => ({
        attempts: Object.fromEntries(Object.entries(state.attempts).filter(([, attempt]) => attempt.lessonAttemptId !== lessonAttemptId)),
      })),
    }),
    { name: 'sovorir-interaction-attempts-v1', version: 1 },
  ),
);
