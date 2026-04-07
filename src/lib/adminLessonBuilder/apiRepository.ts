import { apiClient } from '../apiClient';
import type {
  AdminAiLessonDraft,
  AdminAiLessonDraftRequest,
  AdminAiLessonReview,
  AdminAiQuizDraft,
  AdminCourseSummary,
  AdminLessonBlock,
  AdminLessonBuilder,
  AdminLessonSection,
  AdminLessonSummary,
} from '../../types/admin';
import type {
  AdminLessonBuilderRepository,
  CreateBlockInput,
  CreateLessonInput,
  CreateSectionInput,
  UpdateBlockInput,
  UpdateLessonInput,
  UpdateSectionInput,
} from './types';

export class ApiAdminLessonBuilderRepository implements AdminLessonBuilderRepository {
  async listCourses(): Promise<AdminCourseSummary[]> {
    const courses = await apiClient.get<Array<AdminCourseSummary & { isActive?: boolean; createdAt?: string }>>('/admin/courses');
    return courses.map((course) => ({
      id: course.id,
      title: course.title,
    }));
  }

  listLessons(): Promise<AdminLessonSummary[]> {
    return apiClient.get<AdminLessonSummary[]>('/admin/lessons');
  }

  getLessonBuilder(lessonId: string): Promise<AdminLessonBuilder | null> {
    return apiClient.get<AdminLessonBuilder>(`/admin/lessons/${lessonId}`);
  }

  async saveLessonBuilder(lesson: AdminLessonBuilder): Promise<AdminLessonBuilder> {
    await apiClient.patch(`/admin/lessons/${lesson.id}`, {
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description,
      status: lesson.status,
      orderIndex: lesson.orderIndex,
    });

    const existing = await this.getLessonBuilder(lesson.id);
    if (!existing) {
      throw new Error('Не удалось загрузить урок перед сохранением');
    }

    for (const section of existing.sections) {
      await this.deleteSection(section.id);
    }

    for (const [sectionIndex, section] of lesson.sections.entries()) {
      const createdSection = await this.createSection({
        lessonId: lesson.id,
        title: section.title,
        orderIndex: sectionIndex + 1,
        type: section.type,
        content: section.content ?? null,
      });

      for (const [blockIndex, block] of section.blocks.entries()) {
        await this.createBlock({
          sectionId: createdSection.id,
          orderIndex: blockIndex + 1,
          type: block.type,
          content: block.content,
        });
      }
    }

    const updated = await this.getLessonBuilder(lesson.id);
    if (!updated) {
      throw new Error('Не удалось загрузить сохранённый урок');
    }

    return updated;
  }

  async createLesson(input: CreateLessonInput): Promise<AdminLessonBuilder> {
    const lesson = await apiClient.post<{ id: string }>('/admin/lessons', input);
    const builder = await this.getLessonBuilder(lesson.id);
    if (!builder) {
      throw new Error('Не удалось загрузить созданный урок');
    }

    return builder;
  }

  async updateLesson(lessonId: string, input: UpdateLessonInput): Promise<AdminLessonBuilder> {
    await apiClient.patch(`/admin/lessons/${lessonId}`, input);
    const builder = await this.getLessonBuilder(lessonId);
    if (!builder) {
      throw new Error('Не удалось загрузить обновлённый урок');
    }

    return builder;
  }

  deleteLesson(lessonId: string): Promise<void> {
    return apiClient.delete<void>(`/admin/lessons/${lessonId}`);
  }

  createSection(input: CreateSectionInput): Promise<AdminLessonSection> {
    return apiClient.post<AdminLessonSection>(`/admin/lessons/${input.lessonId}/sections`, {
      title: input.title,
      orderIndex: input.orderIndex,
      type: input.type,
      content: input.content ?? null,
    });
  }

  updateSection(sectionId: string, input: UpdateSectionInput): Promise<AdminLessonSection> {
    return apiClient.patch<AdminLessonSection>(`/admin/sections/${sectionId}`, input);
  }

  deleteSection(sectionId: string): Promise<void> {
    return apiClient.delete<void>(`/admin/sections/${sectionId}`);
  }

  reorderSections(lessonId: string, sectionIds: string[]): Promise<AdminLessonBuilder> {
    return apiClient.post<AdminLessonBuilder>(`/admin/lessons/${lessonId}/reorder-sections`, { sectionIds });
  }

  createBlock(input: CreateBlockInput): Promise<AdminLessonBlock> {
    return apiClient.post<AdminLessonBlock>(`/admin/sections/${input.sectionId}/blocks`, {
      orderIndex: input.orderIndex,
      type: input.type,
      content: input.content,
    });
  }

  updateBlock(blockId: string, input: UpdateBlockInput): Promise<AdminLessonBlock> {
    return apiClient.patch<AdminLessonBlock>(`/admin/blocks/${blockId}`, input);
  }

  deleteBlock(blockId: string): Promise<void> {
    return apiClient.delete<void>(`/admin/blocks/${blockId}`);
  }

  reorderBlocks(sectionId: string, blockIds: string[]): Promise<AdminLessonBuilder> {
    return apiClient.post<AdminLessonBuilder>(`/admin/sections/${sectionId}/reorder-blocks`, { blockIds });
  }

  generateLessonDraft(input: AdminAiLessonDraftRequest) {
    return apiClient.post<AdminAiLessonDraft>('/admin/ai/lesson-draft', input);
  }

  generateQuizDraft(lesson: AdminLessonBuilder) {
    return apiClient.post<AdminAiQuizDraft>('/admin/ai/quiz-draft', { lesson });
  }

  reviewLessonDraft(lesson: AdminLessonBuilder) {
    return apiClient.post<AdminAiLessonReview>('/admin/ai/review-lesson', { lesson });
  }
}
