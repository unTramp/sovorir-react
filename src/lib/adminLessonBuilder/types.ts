import type {
  AdminAiLessonDraft,
  AdminAiLessonDraftRequest,
  AdminAiLessonReview,
  AdminAiQuizDraft,
  AdminBlockType,
  AdminCourseSummary,
  AdminLessonBlock,
  AdminLessonBuilder,
  AdminLessonSection,
  AdminLessonStatus,
  AdminLessonSummary,
  AdminSectionType,
} from '../../types/admin';
import type { ContentBlock } from '../../types/lessonContent';

export interface AdminDraftStore {
  courses: AdminCourseSummary[];
  lessons: AdminLessonBuilder[];
}

export interface CreateLessonInput {
  courseId: string;
  title: string;
  orderIndex: number;
  slug?: string | null;
  description?: string | null;
  status?: AdminLessonStatus;
}

export interface UpdateLessonInput {
  title?: string;
  orderIndex?: number;
  slug?: string | null;
  description?: string | null;
  status?: AdminLessonStatus;
}

export interface CreateSectionInput {
  lessonId: string;
  title: string;
  orderIndex: number;
  type: AdminSectionType;
  content?: Record<string, unknown> | null;
}

export interface UpdateSectionInput {
  title?: string;
  orderIndex?: number;
  type?: AdminSectionType;
  content?: Record<string, unknown> | null;
}

export interface CreateBlockInput {
  sectionId: string;
  orderIndex: number;
  type: AdminBlockType;
  content: ContentBlock;
}

export interface UpdateBlockInput {
  orderIndex?: number;
  type?: AdminBlockType;
  content?: ContentBlock;
}

export interface AdminLessonBuilderRepository {
  listCourses(): Promise<AdminCourseSummary[]>;
  listLessons(): Promise<AdminLessonSummary[]>;
  getLessonBuilder(lessonId: string): Promise<AdminLessonBuilder | null>;
  saveLessonBuilder(lesson: AdminLessonBuilder): Promise<AdminLessonBuilder>;
  createLesson(input: CreateLessonInput): Promise<AdminLessonBuilder>;
  updateLesson(lessonId: string, input: UpdateLessonInput): Promise<AdminLessonBuilder>;
  deleteLesson(lessonId: string): Promise<void>;
  createSection(input: CreateSectionInput): Promise<AdminLessonSection>;
  updateSection(sectionId: string, input: UpdateSectionInput): Promise<AdminLessonSection>;
  deleteSection(sectionId: string): Promise<void>;
  reorderSections(lessonId: string, sectionIds: string[]): Promise<AdminLessonBuilder>;
  createBlock(input: CreateBlockInput): Promise<AdminLessonBlock>;
  updateBlock(blockId: string, input: UpdateBlockInput): Promise<AdminLessonBlock>;
  deleteBlock(blockId: string): Promise<void>;
  reorderBlocks(sectionId: string, blockIds: string[]): Promise<AdminLessonBuilder>;
  generateLessonDraft(input: AdminAiLessonDraftRequest): Promise<AdminAiLessonDraft>;
  generateQuizDraft(lesson: AdminLessonBuilder): Promise<AdminAiQuizDraft>;
  reviewLessonDraft(lesson: AdminLessonBuilder): Promise<AdminAiLessonReview>;
}
