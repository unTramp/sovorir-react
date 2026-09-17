import {
  ApiCourseLessonListSchema,
  ApiCourseListSchema,
  ApiLearningItemListSchema,
  ApiLessonDetailSchema,
} from './curriculumApiSchemas';

export function validateApiResponse(method: string, path: string, data: unknown): unknown {
  if (method !== 'GET') return data;

  if (path === '/courses') {
    return ApiCourseListSchema.parse(data);
  }

  if (/^\/courses\/[^/]+\/lessons$/.test(path)) {
    return ApiCourseLessonListSchema.parse(data);
  }

  if (/^\/lessons\/[^/]+$/.test(path)) {
    return ApiLessonDetailSchema.parse(data);
  }

  if (path === '/learning-items' || path.startsWith('/learning-items?')) {
    return ApiLearningItemListSchema.parse(data);
  }

  return data;
}
