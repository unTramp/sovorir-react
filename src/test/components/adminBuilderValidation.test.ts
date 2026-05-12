import { describe, expect, it } from 'vitest';
import { validateLessonForPublish } from '../../components/admin/builder/validation';
import type { AdminLessonBuilder } from '../../types/admin';

function makeLesson(overrides?: Partial<AdminLessonBuilder>): AdminLessonBuilder {
  return {
    id: 'lesson-1',
    courseId: 'course-1',
    title: 'Приветствия',
    slug: 'privetstviya',
    description: 'Описание урока',
    status: 'draft',
    orderIndex: 1,
    publishedAt: null,
    createdAt: new Date().toISOString(),
    sections: [],
    ...overrides,
  };
}

describe('validateLessonForPublish', () => {
  it('requires at least one section with blocks', () => {
    const errors = validateLessonForPublish(makeLesson());

    expect(errors).toEqual(['Добавьте хотя бы одну секцию с контентным блоком.']);
  });

  it('validates multiple choice content before publish', () => {
    const errors = validateLessonForPublish(makeLesson({
      sections: [
        {
          id: 'section-1',
          lessonId: 'lesson-1',
          title: 'Практика',
          orderIndex: 1,
          type: 'practice',
          content: null,
          createdAt: new Date().toISOString(),
          blocks: [
            {
              id: 'block-1',
              sectionId: 'section-1',
              orderIndex: 1,
              type: 'multipleChoice',
              createdAt: new Date().toISOString(),
              content: {
                type: 'multipleChoice',
                question: '',
                options: ['', '', '', ''],
                correctIndex: 0,
              },
            },
          ],
        },
      ],
    }));

    expect(errors[0]).toContain('не заполнен вопрос');
  });

  it('accepts a minimally valid published lesson payload', () => {
    const errors = validateLessonForPublish(makeLesson({
      sections: [
        {
          id: 'section-1',
          lessonId: 'lesson-1',
          title: 'Введение',
          orderIndex: 1,
          type: 'intro',
          content: null,
          createdAt: new Date().toISOString(),
          blocks: [
            {
              id: 'block-1',
              sectionId: 'section-1',
              orderIndex: 1,
              type: 'audioExample',
              createdAt: new Date().toISOString(),
              content: {
                type: 'audioExample',
                title: 'Послушайте приветствие',
                description: 'Короткий пример',
                audioSrc: 'https://example.com/audio.opus',
              },
            },
            {
              id: 'block-2',
              sectionId: 'section-1',
              orderIndex: 2,
              type: 'pronunciationPrompt',
              createdAt: new Date().toISOString(),
              content: {
                type: 'pronunciationPrompt',
                prompt: 'Повторите: Բարև',
              },
            },
            {
              id: 'block-3',
              sectionId: 'section-1',
              orderIndex: 3,
              type: 'multipleChoice',
              createdAt: new Date().toISOString(),
              content: {
                type: 'multipleChoice',
                question: 'Что значит Բարև?',
                options: ['Привет', 'Пока', '', ''],
                correctIndex: 0,
                explanation: 'Это базовое приветствие.',
              },
            },
          ],
        },
      ],
    }));

    expect(errors).toEqual([]);
  });
});
