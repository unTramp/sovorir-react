import type {
  AdminAiLessonDraft,
  AdminAiLessonDraftRequest,
  AdminAiLessonReview,
  AdminAiQuizDraft,
  AdminLessonBlock,
  AdminLessonBuilder,
  AdminLessonSection,
} from '../../types/admin';
import type { ContentBlock } from '../../types/lessonContent';
import {
  deepClone,
  loadStore,
  makeId,
  nowIso,
  saveStore,
  slugify,
  toLessonSummary,
} from './helpers';
import type {
  AdminLessonBuilderRepository,
  CreateBlockInput,
  CreateLessonInput,
  CreateSectionInput,
  UpdateBlockInput,
  UpdateLessonInput,
  UpdateSectionInput,
} from './types';

export class MockAdminLessonBuilderRepository implements AdminLessonBuilderRepository {
  async listCourses() {
    return deepClone(loadStore().courses);
  }

  async listLessons() {
    const store = loadStore();
    const courseMap = new Map(store.courses.map((course) => [course.id, course.title]));

    return store.lessons
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((lesson) => toLessonSummary(lesson, courseMap.get(lesson.courseId) ?? 'Без курса'));
  }

  async getLessonBuilder(lessonId: string) {
    const lesson = loadStore().lessons.find((item) => item.id === lessonId);
    return lesson ? deepClone(lesson) : null;
  }

  async saveLessonBuilder(lesson: AdminLessonBuilder) {
    const store = loadStore();
    const lessonIndex = store.lessons.findIndex((item) => item.id === lesson.id);
    if (lessonIndex < 0) {
      throw new Error('Lesson not found');
    }

    const previous = store.lessons[lessonIndex];
    const nextLesson: AdminLessonBuilder = {
      ...deepClone(lesson),
      courseId: previous.courseId,
      createdAt: previous.createdAt,
      publishedAt: lesson.status === 'published' ? previous.publishedAt ?? nowIso() : null,
      sections: lesson.sections.map((section, sectionIndex) => ({
        ...deepClone(section),
        lessonId: lesson.id,
        orderIndex: sectionIndex + 1,
        blocks: section.blocks.map((block, blockIndex) => ({
          ...deepClone(block),
          sectionId: section.id,
          orderIndex: blockIndex + 1,
        })),
      })),
    };

    store.lessons[lessonIndex] = nextLesson;
    saveStore(store);
    return deepClone(nextLesson);
  }

  async createLesson(input: CreateLessonInput) {
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

  async updateLesson(lessonId: string, input: UpdateLessonInput) {
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

  async deleteLesson(lessonId: string) {
    const store = loadStore();
    store.lessons = store.lessons.filter((lesson) => lesson.id !== lessonId);
    saveStore(store);
  }

  async createSection(input: CreateSectionInput) {
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

  async updateSection(sectionId: string, input: UpdateSectionInput) {
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

  async deleteSection(sectionId: string) {
    const store = loadStore();
    for (const lesson of store.lessons) {
      lesson.sections = lesson.sections.filter((section) => section.id !== sectionId);
    }
    saveStore(store);
  }

  async reorderSections(lessonId: string, sectionIds: string[]) {
    const store = loadStore();
    const lesson = store.lessons.find((item) => item.id === lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    lesson.sections = sectionIds.map((sectionId, index) => {
      const section = lesson.sections.find((item) => item.id === sectionId);
      if (!section) {
        throw new Error('Section not found');
      }

      return { ...section, orderIndex: index + 1 };
    });

    saveStore(store);
    return deepClone(lesson);
  }

  async createBlock(input: CreateBlockInput) {
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

  async updateBlock(blockId: string, input: UpdateBlockInput) {
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

  async deleteBlock(blockId: string) {
    const store = loadStore();
    for (const lesson of store.lessons) {
      for (const section of lesson.sections) {
        section.blocks = section.blocks.filter((block) => block.id !== blockId);
      }
    }
    saveStore(store);
  }

  async reorderBlocks(sectionId: string, blockIds: string[]) {
    const store = loadStore();
    const lesson = store.lessons.find((item) => item.sections.some((section) => section.id === sectionId));
    const section = lesson?.sections.find((item) => item.id === sectionId);
    if (!lesson || !section) {
      throw new Error('Section not found');
    }

    section.blocks = blockIds.map((blockId, index) => {
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
        type: 'practice',
        content: null,
        blocks: [
          { type: 'heading', text: 'Скажи это вслух' },
          {
            type: 'audio',
            sender: 'teacher',
            senderName: 'Лусине',
            text: `Повторите ключевую фразу по теме "${title}" вслух и попробуйте использовать её в собственной мини-реплике.`,
            src: 'https://example.com/audio/practice.opus',
          },
          {
            type: 'rule',
            title: 'Фокус во время практики',
            items: [
              'Сначала повторите за преподавателем.',
              'Потом скажите фразу самостоятельно.',
              'Обратите внимание на интонацию и длину фразы.',
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
    const risks: string[] = [];
    const suggestions: string[] = [];

    if (!sectionTypes.has('vocabulary')) {
      risks.push('В уроке нет отдельной vocabulary-секции, из-за чего новые слова могут потеряться.');
      suggestions.push('Добавьте vocabulary-секцию с 3-5 ключевыми фразами.');
    }

    if (!sectionTypes.has('practice')) {
      risks.push('В уроке нет отдельной практической секции, поэтому ученику не хватает шага на самостоятельное применение материала.');
      suggestions.push('Добавьте практическую секцию с повторением фраз, teacherBubble и короткой задачей на применение.');
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
