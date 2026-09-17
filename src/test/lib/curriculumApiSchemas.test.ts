import { describe, expect, it } from 'vitest';
import {
  ApiCourseLessonListSchema,
  ApiLessonBlockSchema,
  ApiLessonDetailSchema,
} from '../../lib/curriculumApiSchemas';
import { validateApiResponse } from '../../lib/apiResponseValidation';

const ids = {
  course: '11853d2c-7948-4229-bcc0-050dc2bb0732',
  lesson: 'a00827d0-7029-4a6b-8e93-b7e155ff0be0',
  section: 'a56ddde2-73e3-4785-91d9-b73aa52df7eb',
  block: 'a6b5ac21-c11f-4b72-ae73-ab585d967b50',
  block2: '3de7dc48-c9ff-4f2d-9964-f687efdeafdc',
  step: '1ce3ffae-b4d6-46ec-bbd3-501320925539',
  interaction: '435ff6f8-0ca5-4485-8e6c-136a1f34ff30',
  interaction2: 'edc18a1d-d01c-4e33-9294-c2909d883e8d',
  item: 'af02007b-b132-4021-8ae0-7b122e05c506',
};

const tracking = (interactionId: string) => ({
  lessonId: ids.lesson,
  lessonRevision: 2,
  stepId: ids.step,
  interactionId,
  learningItemIds: [ids.item],
});

describe('curriculum API schemas', () => {
  it('accepts a valid course lesson catalog response', () => {
    const result = ApiCourseLessonListSchema.parse([{
      id: ids.lesson,
      courseId: ids.course,
      orderIndex: 0,
      title: 'Приветствия',
      slug: 'greetings',
      description: 'Первый урок',
      status: 'published',
      publishedAt: '2026-09-15T10:00:00.000Z',
      createdAt: '2026-09-15T09:00:00.000Z',
      totalSections: 5,
      completedSections: 2,
      sections: [{
        id: ids.section,
        lessonId: ids.lesson,
        orderIndex: 0,
        type: 'lesson',
        title: 'Контекст',
        createdAt: '2026-09-15T09:00:00.000Z',
        completed: true,
      }],
    }]);

    expect(result[0].sections[0].completed).toBe(true);
  });

  it('accepts the normalized public dialogue and active-recall contract', () => {
    const result = ApiLessonDetailSchema.parse({
      id: ids.lesson,
      courseId: ids.course,
      orderIndex: 2,
      title: 'Познакомиться',
      slug: 'introduce-yourself',
      description: 'Поддержать короткое знакомство',
      status: 'published',
      publishedAt: '2026-09-18T10:00:00.000Z',
      createdAt: '2026-09-15T09:00:00.000Z',
      sections: [{
        id: ids.section,
        lessonId: ids.lesson,
        orderIndex: 1,
        type: 'practice',
        title: 'Мини-миссия',
        content: { stepId: ids.step, lessonRevision: 2 },
        createdAt: '2026-09-15T09:00:00.000Z',
        progress: null,
        blocks: [
          {
            id: ids.block,
            sectionId: ids.section,
            orderIndex: 1,
            type: 'dialogue',
            content: {
              type: 'dialogue',
              characterName: 'Ани',
              characterRole: 'наставник',
              message: 'Բարև։',
              instruction: 'Ответьте естественно.',
              options: [
                { id: 'a', text: 'Բարև։', correct: true, reply: 'Լավ։' },
                { id: 'b', text: 'Ցտեսություն։', correct: false, reply: '' },
                { id: 'c', text: 'Շատ հաճելի է։', correct: false, reply: '' },
              ],
              tracking: tracking(ids.interaction),
            },
            createdAt: '2026-09-15T09:00:00.000Z',
          },
          {
            id: ids.block2,
            sectionId: ids.section,
            orderIndex: 2,
            type: 'activeRecall',
            content: {
              type: 'activeRecall',
              prompt: 'Поздоровайтесь.',
              hint: 'barev',
              answer: {
                armenian: 'Բարև',
                transcription: 'barev',
                translation: 'Привет',
              },
              reviewIds: [ids.item],
              tracking: tracking(ids.interaction2),
            },
            createdAt: '2026-09-15T09:00:00.000Z',
          },
        ],
      }],
    });

    expect(result.sections[0].blocks.map((block) => block.type)).toEqual(['dialogue', 'activeRecall']);
    const dialogue = result.sections[0].blocks[0].content;
    expect(dialogue.type === 'dialogue' ? dialogue.tracking?.stepId : undefined).toBe(ids.step);
  });

  it('rejects a lesson block whose envelope type disagrees with its content', () => {
    expect(() => ApiLessonBlockSchema.parse({
      id: ids.block,
      sectionId: ids.section,
      orderIndex: 0,
      type: 'record',
      content: { type: 'heading', text: 'Начинаем' },
      createdAt: '2026-09-15T09:00:00.000Z',
    })).toThrow();
  });

  it('rejects a leaked storage alias for semantic dialogue content', () => {
    expect(() => ApiLessonBlockSchema.parse({
      id: ids.block,
      sectionId: ids.section,
      orderIndex: 0,
      type: 'multipleChoice',
      content: {
        type: 'dialogue',
        characterName: 'Ани',
        message: 'Բարև։',
        instruction: 'Ответьте.',
        options: [],
        tracking: tracking(ids.interaction),
      },
      createdAt: '2026-09-15T09:00:00.000Z',
    })).toThrow();
  });

  it('rejects malformed curriculum responses at the API boundary', () => {
    expect(() => validateApiResponse('GET', '/courses', [{
      id: 'not-a-uuid',
      title: 'Course',
      isActive: true,
      createdAt: 'today',
    }])).toThrow();
  });

  it('does not affect unrelated API responses', () => {
    const payload = { ok: true };
    expect(validateApiResponse('GET', '/notifications', payload)).toBe(payload);
  });
});
