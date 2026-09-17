import type { InteractionAttempt, UUID } from '../domain/learning';
import type { ContentBlock, LessonContentSection } from '../types/lessonContent';

function isRequiredInteraction(block: ContentBlock): boolean {
  return block.type === 'record'
    || block.type === 'pronunciationPrompt'
    || block.type === 'dialogue'
    || block.type === 'activeRecall';
}

export function latestLessonAttemptId(
  attempts: InteractionAttempt[],
  lessonId: UUID,
): UUID | undefined {
  return attempts
    .filter((attempt) => attempt.lessonId === lessonId)
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt))[0]
    ?.lessonAttemptId;
}

export function completedRecordIndicesFromAttempts(
  section: LessonContentSection | undefined,
  attempts: InteractionAttempt[],
  lessonAttemptId: UUID | undefined,
): number[] {
  if (!section || !lessonAttemptId) return [];

  const completed: number[] = [];
  let recordIndex = 0;

  for (const block of section.blocks) {
    if (!isRequiredInteraction(block)) continue;

    const tracking = 'tracking' in block ? block.tracking : undefined;
    if (!tracking) break;

    const latest = attempts
      .filter((attempt) => attempt.lessonAttemptId === lessonAttemptId
        && attempt.interactionId === tracking.interactionId
        && attempt.lessonRevision === tracking.lessonRevision)
      .sort((left, right) => right.startedAt.localeCompare(left.startedAt))[0];

    if (!latest || (latest.status !== 'completed' && latest.status !== 'skipped')) break;

    completed.push(recordIndex);
    recordIndex += 1;
  }

  return completed;
}
