import { apiClient, isMockApiEnabled } from './apiClient';
import { lessons as staticLessons } from '../data/lessons';
import { lessonPages } from '../data/lessonPages';
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
} from '../types/admin';
import type { ContentBlock } from '../types/lessonContent';
import type { LessonStatus } from '../types/lesson';

const STORAGE_KEY = 'sovorir-admin-builder';

interface AdminDraftStore {
  courses: AdminCourseSummary[];
  lessons: AdminLessonBuilder[];
}

interface CreateLessonInput {
  courseId: string;
  title: string;
  orderIndex: number;
  slug?: string | null;
  description?: string | null;
  status?: AdminLessonStatus;
}

interface UpdateLessonInput {
  title?: string;
  orderIndex?: number;
  slug?: string | null;
  description?: string | null;
  status?: AdminLessonStatus;
}

interface CreateSectionInput {
  lessonId: string;
  title: string;
  orderIndex: number;
  type: AdminSectionType;
  content?: Record<string, unknown> | null;
}

interface UpdateSectionInput {
  title?: string;
  orderIndex?: number;
  type?: AdminSectionType;
  content?: Record<string, unknown> | null;
}

interface CreateBlockInput {
  sectionId: string;
  orderIndex: number;
  type: AdminBlockType;
  content: ContentBlock;
}

interface UpdateBlockInput {
  orderIndex?: number;
  type?: AdminBlockType;
  content?: ContentBlock;
}

export interface AdminLessonBuilderRepository {
  listCourses(): Promise<AdminCourseSummary[]>;
  listLessons(): Promise<AdminLessonSummary[]>;
  getLessonBuilder(lessonId: string): Promise<AdminLessonBuilder | null>;
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

function nowIso() {
  return new Date().toISOString();
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function slugify(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return slug || `lesson-${Date.now()}`;
}

function makeId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mapLessonStatus(status: LessonStatus): AdminLessonStatus {
  if (status === 'locked') return 'draft';
  return 'published';
}

function inferSectionType(index: number): AdminSectionType {
  if (index === 0) return 'intro';
  if (index === 1) return 'practice';
  return 'review';
}

function sectionTitleFromBlocks(blocks: ContentBlock[], fallbackIndex: number) {
  const heading = blocks.find((block) => block.type === 'heading');
  if (heading?.type === 'heading') {
    return heading.text;
  }

  return `Секция ${fallbackIndex}`;
}

function seedStore(): AdminDraftStore {
  const defaultCourseId = 'course-a1';
  const createdAt = nowIso();
  const courses: AdminCourseSummary[] = [
    { id: defaultCourseId, title: 'Армянский с нуля' },
  ];

  const lessons = staticLessons.map<AdminLessonBuilder>((lesson) => ({
    id: `lesson-${lesson.id}`,
    courseId: defaultCourseId,
    title: lesson.title,
    slug: slugify(lesson.title),
    description: lesson.status === 'locked' ? 'Черновик будущего урока' : 'Урок опубликован и доступен ученикам.',
    status: mapLessonStatus(lesson.status),
    orderIndex: lesson.id,
    publishedAt: lesson.status === 'locked' ? null : createdAt,
    createdAt,
    sections: [],
  }));

  const greetingsLesson = lessons.find((lesson) => lesson.title.includes('Приветствия'));
  if (greetingsLesson) {
    greetingsLesson.sections = lessonPages.map<AdminLessonSection>((section, sectionIndex) => {
      const sectionId = `section-${section.id}`;
      return {
        id: sectionId,
        lessonId: greetingsLesson.id,
        title: section.title ?? sectionTitleFromBlocks(section.blocks, sectionIndex + 1),
        orderIndex: sectionIndex + 1,
        type: inferSectionType(sectionIndex),
        content: null,
        createdAt,
        blocks: section.blocks.map<AdminLessonBlock>((block, blockIndex) => ({
          id: `block-${section.id}-${blockIndex + 1}`,
          sectionId,
          orderIndex: blockIndex + 1,
          type: block.type,
          content: deepClone(block),
          createdAt,
        })),
      };
    });
  }

  return { courses, lessons };
}

function loadStore(): AdminDraftStore {
  if (typeof window === 'undefined') {
    return seedStore();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedStore();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    return JSON.parse(raw) as AdminDraftStore;
  } catch {
    const seeded = seedStore();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function saveStore(store: AdminDraftStore) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function toLessonSummary(lesson: AdminLessonBuilder, courseTitle: string): AdminLessonSummary {
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

class MockAdminLessonBuilderRepository implements AdminLessonBuilderRepository {
  async listCourses(): Promise<AdminCourseSummary[]> {
    return deepClone(loadStore().courses);
  }

  async listLessons(): Promise<AdminLessonSummary[]> {
    const store = loadStore();
    const courseMap = new Map(store.courses.map((course) => [course.id, course.title]));

    return store.lessons
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((lesson) => toLessonSummary(lesson, courseMap.get(lesson.courseId) ?? 'Без курса'));
  }

  async getLessonBuilder(lessonId: string): Promise<AdminLessonBuilder | null> {
    const lesson = loadStore().lessons.find((item) => item.id === lessonId);
    return lesson ? deepClone(lesson) : null;
  }

  async createLesson(input: CreateLessonInput): Promise<AdminLessonBuilder> {
    const store = loadStore();
    const createdAt = nowIso();
    const lesson: AdminLessonBuilder = {
      id: makeId('lesson'),
      courseId: input.courseId,
      title: input.title,
      slug: input.slug ?? slugify(input.title),
      description: input.description ?? null,
      status: input.status ?? 'draft',
      orderIndex: input.orderIndex,
      publishedAt: input.status === 'published' ? createdAt : null,
      createdAt,
      sections: [],
    };

    store.lessons.push(lesson);
    saveStore(store);
    return deepClone(lesson);
  }

  async updateLesson(lessonId: string, input: UpdateLessonInput): Promise<AdminLessonBuilder> {
    const store = loadStore();
    const lesson = store.lessons.find((item) => item.id === lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    if (input.title !== undefined) lesson.title = input.title;
    if (input.orderIndex !== undefined) lesson.orderIndex = input.orderIndex;
    if (input.slug !== undefined) lesson.slug = input.slug;
    if (input.description !== undefined) lesson.description = input.description;
    if (input.status !== undefined) {
      lesson.status = input.status;
      lesson.publishedAt = input.status === 'published' ? nowIso() : null;
    }

    saveStore(store);
    return deepClone(lesson);
  }

  async deleteLesson(lessonId: string): Promise<void> {
    const store = loadStore();
    store.lessons = store.lessons.filter((lesson) => lesson.id !== lessonId);
    saveStore(store);
  }

  async createSection(input: CreateSectionInput): Promise<AdminLessonSection> {
    const store = loadStore();
    const lesson = store.lessons.find((item) => item.id === input.lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const section: AdminLessonSection = {
      id: makeId('section'),
      lessonId: input.lessonId,
      title: input.title,
      orderIndex: input.orderIndex,
      type: input.type,
      content: input.content ?? null,
      createdAt: nowIso(),
      blocks: [],
    };

    lesson.sections.push(section);
    lesson.sections.sort((a, b) => a.orderIndex - b.orderIndex);
    saveStore(store);
    return deepClone(section);
  }

  async updateSection(sectionId: string, input: UpdateSectionInput): Promise<AdminLessonSection> {
    const store = loadStore();
    const section = store.lessons.flatMap((lesson) => lesson.sections).find((item) => item.id === sectionId);
    if (!section) {
      throw new Error('Section not found');
    }

    if (input.title !== undefined) section.title = input.title;
    if (input.orderIndex !== undefined) section.orderIndex = input.orderIndex;
    if (input.type !== undefined) section.type = input.type;
    if (input.content !== undefined) section.content = input.content;

    saveStore(store);
    return deepClone(section);
  }

  async deleteSection(sectionId: string): Promise<void> {
    const store = loadStore();
    for (const lesson of store.lessons) {
      lesson.sections = lesson.sections.filter((section) => section.id !== sectionId);
    }
    saveStore(store);
  }

  async reorderSections(lessonId: string, sectionIds: string[]): Promise<AdminLessonBuilder> {
    const store = loadStore();
    const lesson = store.lessons.find((item) => item.id === lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    lesson.sections = sectionIds
      .map((sectionId, index) => {
        const section = lesson.sections.find((item) => item.id === sectionId);
        if (!section) {
          throw new Error('Section not found');
        }

        return { ...section, orderIndex: index + 1 };
      });

    saveStore(store);
    return deepClone(lesson);
  }

  async createBlock(input: CreateBlockInput): Promise<AdminLessonBlock> {
    const store = loadStore();
    const section = store.lessons.flatMap((lesson) => lesson.sections).find((item) => item.id === input.sectionId);
    if (!section) {
      throw new Error('Section not found');
    }

    const block: AdminLessonBlock = {
      id: makeId('block'),
      sectionId: input.sectionId,
      orderIndex: input.orderIndex,
      type: input.type,
      content: input.content,
      createdAt: nowIso(),
    };

    section.blocks.push(block);
    section.blocks.sort((a, b) => a.orderIndex - b.orderIndex);
    saveStore(store);
    return deepClone(block);
  }

  async updateBlock(blockId: string, input: UpdateBlockInput): Promise<AdminLessonBlock> {
    const store = loadStore();
    const block = store.lessons
      .flatMap((lesson) => lesson.sections)
      .flatMap((section) => section.blocks)
      .find((item) => item.id === blockId);

    if (!block) {
      throw new Error('Block not found');
    }

    if (input.orderIndex !== undefined) block.orderIndex = input.orderIndex;
    if (input.type !== undefined) block.type = input.type;
    if (input.content !== undefined) block.content = input.content;

    saveStore(store);
    return deepClone(block);
  }

  async deleteBlock(blockId: string): Promise<void> {
    const store = loadStore();
    for (const lesson of store.lessons) {
      for (const section of lesson.sections) {
        section.blocks = section.blocks.filter((block) => block.id !== blockId);
      }
    }
    saveStore(store);
  }

  async reorderBlocks(sectionId: string, blockIds: string[]): Promise<AdminLessonBuilder> {
    const store = loadStore();
    const lesson = store.lessons.find((item) => item.sections.some((section) => section.id === sectionId));
    const section = lesson?.sections.find((item) => item.id === sectionId);
    if (!lesson || !section) {
      throw new Error('Section not found');
    }

    section.blocks = blockIds
      .map((blockId, index) => {
        const block = section.blocks.find((item) => item.id === blockId);
        if (!block) {
          throw new Error('Block not found');
        }

        return { ...block, orderIndex: index + 1 };
      });

    saveStore(store);
    return deepClone(lesson);
  }

  async generateLessonDraft(input: AdminAiLessonDraftRequest): Promise<AdminAiLessonDraft> {
    const vocabulary = input.vocabulary?.filter(Boolean) ?? [];
    const sectionCount = Math.max(3, Math.min(input.sectionCount ?? 4, 6));
    const title = input.title.trim() || 'Новый AI-урок';

    const sections: AdminAiLessonDraft['sections'] = [
      {
        title: 'Введение',
        type: 'intro',
        content: null,
        blocks: [
          { type: 'heading', text: title },
          {
            type: 'text',
            content: input.objective
              ? `Цель урока: ${input.objective}`
              : 'Короткое вступление в тему урока и ожидания от ученика.',
          },
          {
            type: 'audio',
            sender: 'teacher',
            senderName: 'Лусине',
            text: `Сегодня разберём тему "${title}" и подготовим ученика к разговорной практике.`,
            duration: 14,
            src: 'https://example.com/audio/intro.opus',
          },
        ],
      },
      {
        title: 'Лексика',
        type: 'vocabulary',
        content: null,
        blocks: [
          { type: 'heading', text: 'Ключевые слова' },
          ...(vocabulary.length > 0
            ? vocabulary.slice(0, 5).map((word) => ({
                type: 'phrase' as const,
                russian: word,
                armenian: `Հայերեն: ${word}`,
                transcription: word.toLowerCase().replace(/\s+/g, '-'),
                translation: `Короткий контекст для фразы "${word}"`,
                status: 'new' as const,
              }))
            : [
                {
                  type: 'phrase' as const,
                  russian: 'Здравствуйте',
                  armenian: 'Բարև',
                  transcription: 'barev',
                  translation: 'Приветствие при встрече',
                  status: 'new' as const,
                },
                {
                  type: 'phrase' as const,
                  russian: 'Спасибо',
                  armenian: 'Շնորհակալություն',
                  transcription: 'shnorhakalutyun',
                  translation: 'Благодарность',
                  status: 'review' as const,
                },
              ]),
        ],
      },
      {
        title: 'Практика',
        type: 'speaking',
        content: null,
        blocks: [
          { type: 'heading', text: 'Скажи это вслух' },
          { type: 'record', prompt: `Запишите короткий ответ по теме "${title}"` },
          {
            type: 'rule',
            title: 'Фокус во время практики',
            items: [
              'Сначала повторите за преподавателем.',
              'Потом скажите фразу самостоятельно.',
              'Запишите лучший вариант произношения.',
            ],
          },
        ],
      },
    ];

    if (input.grammarFocus && sectionCount >= 4) {
      sections.push({
        title: 'Грамматика',
        type: 'grammar',
        content: null,
        blocks: [
          { type: 'heading', text: input.grammarFocus },
          {
            type: 'text',
            content: `Добавьте короткое объяснение по теме "${input.grammarFocus}" с 2-3 бытовыми примерами.`,
          },
        ],
      });
    }

    if (sections.length < sectionCount) {
      sections.push({
        title: 'Итоговое повторение',
        type: 'review',
        content: null,
        blocks: [
          { type: 'heading', text: 'Повторение' },
          { type: 'text', content: 'Соберите 2-3 предложения из новых фраз и повторите их вслух.' },
        ],
      });
    }

    return {
      title,
      description: input.objective
        ? `AI draft: ${input.objective}`
        : 'AI draft для преподавателя. Перед публикацией нужен ручной review.',
      sections: sections.slice(0, sectionCount),
    };
  }

  async generateQuizDraft(lesson: AdminLessonBuilder): Promise<AdminAiQuizDraft> {
    const phraseBlocks = lesson.sections
      .flatMap((section) => section.blocks)
      .filter((block) => block.type === 'phrase');
    const pairs = phraseBlocks.slice(0, 3).map((block) => ({
      left: (block.content as Extract<ContentBlock, { type: 'phrase' }>).armenian,
      right: (block.content as Extract<ContentBlock, { type: 'phrase' }>).russian,
    }));

    return {
      title: `Квиз по уроку "${lesson.title}"`,
      questions: [
        {
          type: 'multiple-choice',
          question: 'Что лучше всего описывает цель этого урока?',
          options: [
            'Закрепить новую лексику и произношение',
            'Изучить серверную архитектуру',
            'Сдать экзамен по математике',
            'Составить финансовый отчёт',
          ],
          correctIndex: 0,
        },
        {
          type: 'match-pairs',
          pairs: pairs.length >= 2
            ? pairs
            : [
                { left: 'Բարև', right: 'Здравствуйте' },
                { left: 'Շնորհակալություն', right: 'Спасибо' },
              ],
        },
        {
          type: 'multiple-choice',
          question: 'Какой следующий шаг полезнее всего после прохождения урока?',
          options: [
            'Повторить фразы вслух и записать себя',
            'Полностью пропустить speaking practice',
            'Сразу удалить все новые слова',
            'Перейти к следующему уроку без повторения',
          ],
          correctIndex: 0,
        },
      ],
    };
  }

  async reviewLessonDraft(lesson: AdminLessonBuilder): Promise<AdminAiLessonReview> {
    const sectionTypes = new Set(lesson.sections.map((section) => section.type));
    const blockTypes = new Set(lesson.sections.flatMap((section) => section.blocks.map((block) => block.type)));
    const risks: string[] = [];
    const suggestions: string[] = [];

    if (!sectionTypes.has('vocabulary')) {
      risks.push('В уроке нет отдельной vocabulary-секции, из-за чего новые слова могут потеряться.');
      suggestions.push('Добавьте vocabulary-секцию с 3-5 ключевыми фразами.');
    }

    if (!blockTypes.has('record')) {
      risks.push('В уроке отсутствует record block, поэтому speaking practice не закрепляется.');
      suggestions.push('Добавьте хотя бы один record block после основной лексики.');
    }

    if (!sectionTypes.has('review')) {
      suggestions.push('Нужна короткая review-секция с recap и итоговой задачей на повторение.');
    }

    return {
      summary: `Урок "${lesson.title}" уже годится как черновик, но перед публикацией стоит проверить баланс между объяснением, лексикой и speaking practice.`,
      strengths: [
        'Секции и блоки уже структурированы для конструктора преподавателя.',
        'Контент можно быстро расширять или упрощать без изменения UI-схемы.',
      ],
      risks: risks.length > 0 ? risks : ['Критичных дыр не найдено, но стоит проверить сложность формулировок и длину секций.'],
      suggestions,
    };
  }
}

class ApiAdminLessonBuilderRepository implements AdminLessonBuilderRepository {
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

  generateLessonDraft(input: AdminAiLessonDraftRequest): Promise<AdminAiLessonDraft> {
    return apiClient.post<AdminAiLessonDraft>('/admin/ai/lesson-draft', input);
  }

  generateQuizDraft(lesson: AdminLessonBuilder): Promise<AdminAiQuizDraft> {
    return apiClient.post<AdminAiQuizDraft>('/admin/ai/quiz-draft', { lesson });
  }

  reviewLessonDraft(lesson: AdminLessonBuilder): Promise<AdminAiLessonReview> {
    return apiClient.post<AdminAiLessonReview>('/admin/ai/review-lesson', { lesson });
  }
}

export const adminLessonBuilderRepository: AdminLessonBuilderRepository = isMockApiEnabled
  ? new MockAdminLessonBuilderRepository()
  : new ApiAdminLessonBuilderRepository();
