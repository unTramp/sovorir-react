import { z } from 'zod';
import type { InteractionAttempt, InteractionAttemptOutcome } from '../domain/learning';
import { apiClient, isMockApiEnabled } from './apiClient';

const ApiInteractionAttemptSchema = z.object({
  id: z.string().uuid(),
  lessonAttemptId: z.string().uuid(),
  lessonId: z.string().uuid(),
  lessonRevision: z.number().int().positive(),
  stepId: z.string().uuid(),
  interactionId: z.string().uuid(),
  status: z.enum(['started', 'completed', 'skipped']),
  outcome: z.enum(['correct', 'incorrect', 'needs_review', 'completed']).nullable().optional(),
  hintUsed: z.boolean(),
  retryCount: z.number().int().nonnegative(),
  selectedOptionId: z.string().uuid().nullable().optional(),
  recordingId: z.string().uuid().nullable().optional(),
  startedAt: z.string(),
  completedAt: z.string().nullable().optional(),
});

const ApiInteractionAttemptListSchema = z.array(ApiInteractionAttemptSchema);
type ApiInteractionAttempt = z.infer<typeof ApiInteractionAttemptSchema>;

function toDomainOutcome(outcome: ApiInteractionAttempt['outcome']): InteractionAttemptOutcome | undefined {
  if (!outcome) return undefined;
  return outcome === 'needs_review' ? 'needs-review' : outcome;
}

export function toApiOutcome(outcome: InteractionAttemptOutcome | undefined) {
  if (!outcome) return undefined;
  return outcome === 'needs-review' ? 'needs_review' : outcome;
}

export function mapApiInteractionAttempt(raw: unknown): InteractionAttempt {
  const attempt = ApiInteractionAttemptSchema.parse(raw);
  return {
    id: attempt.id,
    lessonAttemptId: attempt.lessonAttemptId,
    lessonId: attempt.lessonId,
    lessonRevision: attempt.lessonRevision,
    stepId: attempt.stepId,
    interactionId: attempt.interactionId,
    status: attempt.status,
    outcome: toDomainOutcome(attempt.outcome),
    hintUsed: attempt.hintUsed,
    retryCount: attempt.retryCount,
    selectedOptionId: attempt.selectedOptionId ?? undefined,
    recordingId: attempt.recordingId ?? undefined,
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt ?? undefined,
  };
}

export async function listRemoteInteractionAttempts(lessonId: string): Promise<InteractionAttempt[]> {
  if (isMockApiEnabled) return [];
  const raw = await apiClient.get<unknown>(`/lessons/${lessonId}/interaction-attempts`);
  return ApiInteractionAttemptListSchema.parse(raw).map(mapApiInteractionAttempt);
}

export async function createRemoteInteractionAttempt(attempt: InteractionAttempt): Promise<void> {
  if (isMockApiEnabled) return;
  await apiClient.post('/interaction-attempts', {
    id: attempt.id,
    lessonId: attempt.lessonId,
    lessonAttemptId: attempt.lessonAttemptId,
    lessonRevision: attempt.lessonRevision,
    stepId: attempt.stepId,
    interactionId: attempt.interactionId,
    hintUsed: attempt.hintUsed,
    retryCount: attempt.retryCount,
    selectedOptionId: attempt.selectedOptionId,
    recordingId: attempt.recordingId,
    startedAt: attempt.startedAt,
  });
}

export async function updateRemoteInteractionAttempt(attempt: InteractionAttempt): Promise<void> {
  if (isMockApiEnabled || attempt.status === 'started') return;
  await apiClient.patch(`/interaction-attempts/${attempt.id}`, {
    status: attempt.status,
    outcome: toApiOutcome(attempt.outcome),
    hintUsed: attempt.hintUsed,
    retryCount: attempt.retryCount,
    selectedOptionId: attempt.selectedOptionId,
    recordingId: attempt.recordingId,
    completedAt: attempt.completedAt,
  });
}
