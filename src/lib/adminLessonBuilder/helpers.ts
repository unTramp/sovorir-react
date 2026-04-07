import { lessons as staticLessons } from '../../data/lessons';
import { lesson1Draft } from '../../data/lesson1Draft';
import type {
  AdminAiLessonDraft,
  AdminBlockType,
  AdminCourseSummary,
  AdminLessonBlock,
  AdminLessonBuilder,
  AdminLessonSection,
  AdminLessonSummary,
  AdminLessonStatus,
} from '../../types/admin';
import type { ContentBlock } from '../../types/lessonContent';
import type { LessonStatus } from '../../types/lesson';
import {
  ADMIN_LESSON_BUILDER_STORAGE_KEY,
  emitAdminLessonBuilderSync,
} from '../adminLessonBuilderStorage';
import type { AdminDraftStore } from './types';

export function nowIso() {
  return new Date().toISOString();
}

export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function slugify(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return slug || `lesson-${Date.now()}`;
}

export function makeId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mapLessonStatus(status: LessonStatus): AdminLessonStatus {
  if (status === 'locked') return 'draft';
  return 'published';
}

export function buildLessonSectionsFromDraft(
  lessonId: string,
  draft: AdminAiLessonDraft,
  createdAt: string,
): AdminLessonSection[] {
  return draft.sections.map<AdminLessonSection>((section, sectionIndex) => {
    const sectionId = `section-${lessonId}-${sectionIndex + 1}`;
    return {
      id: sectionId,
      lessonId,
      title: section.title,
      orderIndex: sectionIndex + 1,
      type: section.type,
      content: section.content ?? null,
      createdAt,
      blocks: section.blocks.map<AdminLessonBlock>((block, blockIndex) => ({
        id: `block-${lessonId}-${sectionIndex + 1}-${blockIndex + 1}`,
        sectionId,
        orderIndex: blockIndex + 1,
        type: block.type as AdminBlockType,
        content: deepClone(block as ContentBlock),
        createdAt,
      })),
    };
  });
}

export function seedStore(): AdminDraftStore {
  const defaultCourseId = 'course-a1';
  const createdAt = nowIso();
  const courses: AdminCourseSummary[] = [
    { id: defaultCourseId, title: 'Армянский с нуля' },
  ];

  const remainingStaticLessons = staticLessons.filter((lesson) => !lesson.title.includes('Приветствия'));

  const lessons: AdminLessonBuilder[] = [
    {
      id: 'lesson-1',
      courseId: defaultCourseId,
      title: lesson1Draft.title,
      slug: slugify(lesson1Draft.title),
      description: lesson1Draft.description,
      status: 'published',
      orderIndex: 1,
      publishedAt: createdAt,
      createdAt,
      sections: buildLessonSectionsFromDraft('lesson-1', lesson1Draft, createdAt),
    },
    ...remainingStaticLessons.map<AdminLessonBuilder>((lesson, index) => ({
      id: `lesson-${index + 2}`,
      courseId: defaultCourseId,
      title: lesson.title,
      slug: slugify(lesson.title),
      description: lesson.status === 'locked' ? 'Черновик будущего урока' : 'Урок опубликован и доступен ученикам.',
      status: mapLessonStatus(lesson.status),
      orderIndex: index + 2,
      publishedAt: lesson.status === 'locked' ? null : createdAt,
      createdAt,
      sections: [],
    })),
  ];

  return { courses, lessons };
}

export function loadStore(): AdminDraftStore {
  if (typeof window === 'undefined') {
    return seedStore();
  }

  const raw = window.localStorage.getItem(ADMIN_LESSON_BUILDER_STORAGE_KEY);
  if (!raw) {
    const seeded = seedStore();
    window.localStorage.setItem(ADMIN_LESSON_BUILDER_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    return JSON.parse(raw) as AdminDraftStore;
  } catch {
    const seeded = seedStore();
    window.localStorage.setItem(ADMIN_LESSON_BUILDER_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

export function saveStore(store: AdminDraftStore) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ADMIN_LESSON_BUILDER_STORAGE_KEY, JSON.stringify(store));
  emitAdminLessonBuilderSync();
}

export function toLessonSummary(lesson: AdminLessonBuilder, courseTitle: string): AdminLessonSummary {
  return {
    id: lesson.id,
    courseId: lesson.courseId,
    title: lesson.title,
    slug: lesson.slug,
    description: lesson.description,
    status: lesson.status,
    orderIndex: lesson.orderIndex,
    courseTitle,
    publishedAt: lesson.publishedAt,
    createdAt: lesson.createdAt,
  };
}
