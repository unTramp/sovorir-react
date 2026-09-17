import { describe, expect, it } from 'vitest';
import type { LearningItem } from '../../domain/learning';
import { buildPracticeQueue, getDueLearningItemIds } from '../../lib/practiceEngine';

const ids = [
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
];

function item(id: string, audio = true): LearningItem {
  return {
    id,
    revision: 1,
    type: 'phrase',
    armenian: `հայերեն-${id[0]}`,
    transliteration: `phrase-${id[0]}`,
    translation: `Фраза ${id[0]}`,
    audio: audio ? {
      normal: {
        id: `aaaaaaaa-aaaa-4aaa-8aaa-${id.slice(0, 12)}`,
        url: `https://example.com/${id}.opus`,
        mimeType: 'audio/ogg; codecs=opus',
      },
    } : undefined,
    contexts: [],
    register: 'neutral',
    difficulty: 1,
    tags: [],
    reviewable: true,
  };
}

describe('practiceEngine', () => {
  const now = new Date('2026-09-18T12:00:00.000Z');

  it('selects only due canonical learning items and orders oldest due first', () => {
    const items = Object.fromEntries(ids.map((id) => [id, item(id)]));
    const reviewQueue = {
      [ids[0]]: { sourceLessonId: ids[3], unlockedAt: '2026-09-10T00:00:00.000Z', nextReviewAt: '2026-09-18T10:00:00.000Z' },
      [ids[1]]: { sourceLessonId: ids[3], unlockedAt: '2026-09-11T00:00:00.000Z', nextReviewAt: '2026-09-17T10:00:00.000Z' },
      [ids[2]]: { sourceLessonId: ids[3], unlockedAt: '2026-09-12T00:00:00.000Z', nextReviewAt: '2026-09-19T10:00:00.000Z' },
    };

    expect(getDueLearningItemIds(items, reviewQueue, now)).toEqual([ids[1], ids[0]]);
  });

  it('mixes recall, listening and recognition instead of producing a flashcard-only queue', () => {
    const items = Object.fromEntries(ids.map((id) => [id, item(id)]));
    const reviewQueue = Object.fromEntries(ids.map((id, index) => [id, {
      sourceLessonId: ids[3],
      unlockedAt: `2026-09-${10 + index}T00:00:00.000Z`,
      nextReviewAt: `2026-09-${10 + index}T00:00:00.000Z`,
    }]));

    expect(buildPracticeQueue({ items, reviewQueue, now }).map((card) => card.mode))
      .toEqual(['recall', 'listening', 'recognition', 'recall']);
  });

  it('falls back from listening to recall when final audio is not available yet', () => {
    const items = {
      [ids[0]]: item(ids[0]),
      [ids[1]]: item(ids[1], false),
    };
    const reviewQueue = {
      [ids[0]]: { sourceLessonId: ids[3], unlockedAt: '2026-09-10T00:00:00.000Z', nextReviewAt: '2026-09-10T00:00:00.000Z' },
      [ids[1]]: { sourceLessonId: ids[3], unlockedAt: '2026-09-11T00:00:00.000Z', nextReviewAt: '2026-09-11T00:00:00.000Z' },
    };

    expect(buildPracticeQueue({ items, reviewQueue, now }).map((card) => card.mode))
      .toEqual(['recall', 'recall']);
  });
});
