import type { LearningItem, UUID } from '../domain/learning';

export type PracticeCardMode = 'recall' | 'recognition' | 'listening';

export interface ReviewQueueEntry {
  sourceLessonId: UUID;
  unlockedAt: string;
  nextReviewAt: string;
}

export interface PracticeCardPlan {
  itemId: UUID;
  mode: PracticeCardMode;
}

export interface BuildPracticeQueueInput {
  items: Record<UUID, LearningItem>;
  reviewQueue: Record<UUID, ReviewQueueEntry>;
  now?: Date;
  limit?: number;
}

const MODE_CYCLE: PracticeCardMode[] = ['recall', 'listening', 'recognition'];

function modeFor(item: LearningItem, index: number): PracticeCardMode {
  const preferred = MODE_CYCLE[index % MODE_CYCLE.length];
  if (preferred === 'listening' && !item.audio?.normal.url) return 'recall';
  return preferred;
}

export function getDueLearningItemIds(
  items: Record<UUID, LearningItem>,
  reviewQueue: Record<UUID, ReviewQueueEntry>,
  now = new Date(),
): UUID[] {
  const nowMs = now.getTime();

  return Object.entries(reviewQueue)
    .filter(([itemId, entry]) => {
      const item = items[itemId];
      return Boolean(item?.reviewable) && Date.parse(entry.nextReviewAt) <= nowMs;
    })
    .sort(([, left], [, right]) => {
      const dueDelta = Date.parse(left.nextReviewAt) - Date.parse(right.nextReviewAt);
      if (dueDelta !== 0) return dueDelta;
      return Date.parse(left.unlockedAt) - Date.parse(right.unlockedAt);
    })
    .map(([itemId]) => itemId);
}

export function buildPracticeQueue({
  items,
  reviewQueue,
  now = new Date(),
  limit = 10,
}: BuildPracticeQueueInput): PracticeCardPlan[] {
  return getDueLearningItemIds(items, reviewQueue, now)
    .slice(0, limit)
    .map((itemId, index) => ({
      itemId,
      mode: modeFor(items[itemId], index),
    }));
}

export function practiceModeLabel(mode: PracticeCardMode): string {
  if (mode === 'listening') return 'На слух';
  if (mode === 'recognition') return 'Узнавание';
  return 'Вспомнить';
}

export function practicePrompt(item: LearningItem, mode: PracticeCardMode): string {
  if (mode === 'listening') return 'Послушайте и вспомните смысл фразы.';
  if (mode === 'recognition') return `Что означает «${item.armenian}»?`;
  const context = item.contexts[0];
  return context
    ? `${context.replace(/^\S+\s*/, '')}: как сказать «${item.translation}»?`
    : `Как сказать по-армянски: «${item.translation}»?`;
}
