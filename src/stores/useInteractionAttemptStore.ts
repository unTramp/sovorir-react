import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InteractionAttempt, InteractionAttemptOutcome, UUID } from '../domain/learning';
import {
  createRemoteInteractionAttempt,
  listRemoteInteractionAttempts,
  updateRemoteInteractionAttempt,
} from '../lib/interactionAttemptApi';

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

type SyncState = 'pending' | 'synced' | 'error';

interface InteractionAttemptState {
  attempts: Record<UUID, InteractionAttempt>;
  syncState: Record<UUID, SyncState>;
  startAttempt: (input: StartAttemptInput) => UUID;
  completeAttempt: (id: UUID, outcome: InteractionAttemptOutcome, patch?: CompleteAttemptPatch) => void;
  skipAttempt: (id: UUID, completedAt?: string) => void;
  hydrateLessonAttempts: (lessonId: UUID) => Promise<void>;
  getLatestAttempt: (lessonAttemptId: UUID, interactionId: UUID) => InteractionAttempt | undefined;
  clearLessonAttempts: (lessonAttemptId: UUID) => void;
}

const syncQueues = new Map<UUID, Promise<void>>();

function enqueueSync(id: UUID, task: () => Promise<void>): Promise<void> {
  const previous = syncQueues.get(id) ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(task);
  syncQueues.set(id, next);
  void next.finally(() => {
    if (syncQueues.get(id) === next) syncQueues.delete(id);
  }).catch(() => undefined);
  return next;
}

function newUuid(): UUID {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function shouldKeepLocal(local: InteractionAttempt, remote: InteractionAttempt): boolean {
  if (local.status !== 'started' && remote.status === 'started') return true;
  if (!local.completedAt) return false;
  if (!remote.completedAt) return true;
  return local.completedAt > remote.completedAt;
}

export const useInteractionAttemptStore = create<InteractionAttemptState>()(
  persist(
    (set, get) => {
      const markSync = (id: UUID, state: SyncState) => {
        set((current) => ({ syncState: { ...current.syncState, [id]: state } }));
      };

      const syncCreated = (attempt: InteractionAttempt) => {
        markSync(attempt.id, 'pending');
        void enqueueSync(attempt.id, () => createRemoteInteractionAttempt(attempt))
          .then(() => markSync(attempt.id, 'synced'))
          .catch(() => markSync(attempt.id, 'error'));
      };

      const syncUpdated = (attempt: InteractionAttempt) => {
        markSync(attempt.id, 'pending');
        void enqueueSync(attempt.id, () => updateRemoteInteractionAttempt(attempt))
          .then(() => markSync(attempt.id, 'synced'))
          .catch(() => markSync(attempt.id, 'error'));
      };

      return {
        attempts: {},
        syncState: {},
        startAttempt: (input) => {
          const id = input.id ?? newUuid();
          const attempt: InteractionAttempt = {
            ...input,
            id,
            status: 'started',
            startedAt: input.startedAt ?? new Date().toISOString(),
          };
          set((state) => ({ attempts: { ...state.attempts, [id]: attempt } }));
          syncCreated(attempt);
          return id;
        },
        completeAttempt: (id, outcome, patch = {}) => {
          const current = get().attempts[id];
          if (!current) return;
          const attempt: InteractionAttempt = {
            ...current,
            ...patch,
            status: 'completed',
            outcome,
            completedAt: patch.completedAt ?? new Date().toISOString(),
          };
          set((state) => ({ attempts: { ...state.attempts, [id]: attempt } }));
          syncUpdated(attempt);
        },
        skipAttempt: (id, completedAt) => {
          const current = get().attempts[id];
          if (!current) return;
          const attempt: InteractionAttempt = {
            ...current,
            status: 'skipped',
            completedAt: completedAt ?? new Date().toISOString(),
          };
          set((state) => ({ attempts: { ...state.attempts, [id]: attempt } }));
          syncUpdated(attempt);
        },
        hydrateLessonAttempts: async (lessonId) => {
          try {
            const remoteAttempts = await listRemoteInteractionAttempts(lessonId);
            if (remoteAttempts.length === 0) return;
            set((state) => {
              const attempts = { ...state.attempts };
              const syncState = { ...state.syncState };
              remoteAttempts.forEach((remote) => {
                const local = attempts[remote.id];
                if (!local || !shouldKeepLocal(local, remote)) {
                  attempts[remote.id] = remote;
                  syncState[remote.id] = 'synced';
                }
              });
              return { attempts, syncState };
            });
          } catch {
            // Local attempts remain usable when the network is unavailable.
          }
        },
        getLatestAttempt: (lessonAttemptId, interactionId) => Object.values(get().attempts)
          .filter((attempt) => attempt.lessonAttemptId === lessonAttemptId && attempt.interactionId === interactionId)
          .sort((left, right) => right.startedAt.localeCompare(left.startedAt))[0],
        clearLessonAttempts: (lessonAttemptId) => set((state) => {
          const removedIds = Object.values(state.attempts)
            .filter((attempt) => attempt.lessonAttemptId === lessonAttemptId)
            .map((attempt) => attempt.id);
          const attempts = Object.fromEntries(
            Object.entries(state.attempts).filter(([, attempt]) => attempt.lessonAttemptId !== lessonAttemptId),
          );
          const syncState = { ...state.syncState };
          removedIds.forEach((id) => delete syncState[id]);
          return { attempts, syncState };
        }),
      };
    },
    { name: 'sovorir-interaction-attempts-v1', version: 1 },
  ),
);
