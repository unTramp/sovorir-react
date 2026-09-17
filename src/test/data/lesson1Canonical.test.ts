import { describe, expect, it } from 'vitest';
import { LessonSchema } from '../../domain/learning';
import { lesson1Canonical, lesson1LearningItems } from '../../data/lesson1Canonical';
import { adaptCanonicalLessonToLegacySections } from '../../lib/canonicalLessonAdapter';
import { handoffLessonItemsToReview } from '../../lib/lessonReviewHandoff';
import { useLearningItemStore } from '../../stores/useLearningItemStore';

describe('canonical reference Lesson 1', () => {
  it('is schema-valid and contains the exact five-step learning journey', () => {
    expect(() => LessonSchema.parse(lesson1Canonical)).not.toThrow();
    expect(lesson1Canonical.steps.map((step) => step.type)).toEqual([
      'context', 'phrase-intro', 'listen-repeat', 'dialogue', 'active-recall',
    ]);
    expect(lesson1Canonical.steps).toHaveLength(5);
  });

  it('contains exactly the four approved reviewable phrases', () => {
    expect(lesson1LearningItems.map((item) => ({
      armenian: item.armenian,
      transliteration: item.transliteration,
      translation: item.translation,
      context: item.contexts[0],
      register: item.register,
      reviewable: item.reviewable,
    }))).toEqual([
      { armenian: 'Բարև', transliteration: 'barev', translation: 'Привет', context: '👥 Друзья / знакомые', register: 'informal', reviewable: true },
      { armenian: 'Բարև ձեզ', transliteration: 'barev dzez', translation: 'Здравствуйте', context: '👔 Вежливо / незнакомые / старшие', register: 'polite', reviewable: true },
      { armenian: 'Ցտեսություն', transliteration: 'stesityun', translation: 'До свидания', context: '👔 Формально', register: 'formal', reviewable: true },
      { armenian: 'Առայժմ', transliteration: 'arayzhm', translation: 'Пока / До скорого', context: '👥 Неформально', register: 'informal', reviewable: true },
    ]);
  });

  it('adapts every required interaction to the current lesson UI', () => {
    const sections = adaptCanonicalLessonToLegacySections(lesson1Canonical, lesson1LearningItems);
    expect(sections).toHaveLength(5);
    expect(sections[2].blocks.filter((block) => block.type === 'pronunciationPrompt')).toHaveLength(4);
    expect(sections[3].blocks.filter((block) => block.type === 'dialogue')).toHaveLength(2);
    expect(sections[4].blocks.filter((block) => block.type === 'activeRecall')).toHaveLength(4);
  });

  it('hands all four phrases to the personal review queue after completion', () => {
    useLearningItemStore.setState({ items: {}, reviewQueue: {} });
    const ids = handoffLessonItemsToReview(
      lesson1Canonical.id,
      lesson1LearningItems,
      new Date('2026-09-15T10:00:00.000Z'),
    );
    expect(ids).toEqual(lesson1Canonical.learningItemIds);
    expect(useLearningItemStore.getState().getReviewQueue()).toHaveLength(4);
  });
});
