import { describe, expect, it } from 'vitest';
import {
  ApiCourseLessonListSchema,
  ApiLessonBlockSchema,
} from '../../lib/curriculumApiSchemas';
import { validateApiResponse } from '../../lib/apiResponseValidation';

const ids = {
  course: '11853d2c-7948-4229-bcc0-050dc2bb0732',
  lesson: 'a00827d0-7029-4a6b-8e93-b7e155ff0be0',
  section: 'a56ddde2-73e3-4785-91d9-b73aa52df7eb',
  block: 'a6b5ac21-c11f-4b72-ae73-ab585d967b50',
};

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
