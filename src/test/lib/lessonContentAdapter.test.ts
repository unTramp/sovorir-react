import { describe, expect, it } from 'vitest';
import { LessonSchema, LearningItemSchema } from '../../domain/learning';
import { adaptLegacyLessonContent, stableLegacyUuid } from '../../lib/lessonContentAdapter';
import type { LessonContentSection } from '../../types/lessonContent';

const sections: LessonContentSection[] = [
  {
    id: 1,
    kind: 'phrases',
    title: 'Приветствия',
    blocks: [
      { type: 'heading', text: 'Приветствия' },
      {
        type: 'phrase', id: 'hello', russian: 'Привет', armenian: 'Բարև',
        transcription: 'barev', translation: 'Привет', audioSrc: '/audio/hello.mp3', reviewable: true,
      },
      { type: 'pronunciationPrompt', prompt: 'Повторите: Բարև' },
    ],
  },
  {
    id: 2,
    kind: 'recall',
    title: 'Вспомните',
    blocks: [{
      type: 'activeRecall', prompt: 'Как сказать «Привет»?', hint: 'Начинается на Բ',
      answer: { armenian: 'Բարև', transcription: 'barev', translation: 'Привет' }, reviewIds: ['hello'],
    }],
  },
];

describe('lessonContentAdapter', () => {
  it('creates deterministic UUIDs for unchanged legacy content', () => {
    expect(stableLegacyUuid('lesson', 'hello')).toBe(stableLegacyUuid('lesson', 'hello'));
    expect(stableLegacyUuid('lesson', 'hello')).not.toBe(stableLegacyUuid('step', 'hello'));
    expect(stableLegacyUuid('lesson', 'hello')).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('adapts legacy sections into a schema-valid canonical lesson', () => {
    const first = adaptLegacyLessonContent(sections, { slug: 'hello', title: 'Первый урок' });
    const second = adaptLegacyLessonContent(sections, { slug: 'hello', title: 'Первый урок' });

    expect(() => LessonSchema.parse(first.lesson)).not.toThrow();
    first.learningItems.forEach((item) => expect(() => LearningItemSchema.parse(item)).not.toThrow());
    expect(first.lesson).toEqual(second.lesson);
    expect(first.learningItems).toHaveLength(1);
    expect(first.lesson.steps[0].interactions[0].type).toBe('listen-repeat');
    expect(first.lesson.steps[1].interactions[0].learningItemIds).toEqual([first.learningItems[0].id]);
  });
});
