import type {
  AdminBlockType,
  AdminLessonBuilder,
  AdminLessonStatus,
  AdminSectionType,
} from '../../../types/admin';
import type { ContentBlock } from '../../../types/lessonContent';

export const SECTION_TYPE_OPTIONS: AdminSectionType[] = [
  'intro', 'vocabulary', 'grammar', 'practice', 'quiz', 'speaking', 'review',
  'dictionary', 'notes', 'video', 'ai_practice',
];

export const STATUS_OPTIONS: AdminLessonStatus[] = ['draft', 'published', 'archived'];
export const PHRASE_STATUS_OPTIONS = ['new', 'learned', 'review'] as const;

export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function serializeJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function parseObjectJson(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === 'null') return null;
  const parsed = JSON.parse(trimmed) as unknown;
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Ожидался JSON-объект');
  }

  return parsed as Record<string, unknown>;
}

export function parseBlockJson(raw: string, type: AdminBlockType): ContentBlock {
  const parsed = JSON.parse(raw) as unknown;
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Ожидался JSON-объект блока');
  }

  return { ...(parsed as Record<string, unknown>), type } as ContentBlock;
}

export function statusLabel(status: AdminLessonStatus) {
  if (status === 'draft') return 'Черновик';
  if (status === 'published') return 'Опубликован';
  return 'Архив';
}

export function phraseStatusLabel(status: (typeof PHRASE_STATUS_OPTIONS)[number]) {
  if (status === 'new') return 'Новое';
  if (status === 'learned') return 'Изучено';
  return 'Повтор';
}

export function sectionTypeLabel(type: AdminSectionType): string {
  const map: Record<string, string> = {
    intro: 'Введение',
    vocabulary: 'Лексика',
    grammar: 'Грамматика',
    practice: 'Практика',
    quiz: 'Тест',
    speaking: 'Разговорная практика',
    review: 'Повторение',
    dictionary: 'Словарь',
    notes: 'Заметки',
    video: 'Видео',
    ai_practice: 'AI-практика',
  };

  return map[type] ?? type;
}

export function sectionTypeDescription(type: AdminSectionType): string {
  const map: Record<string, string> = {
    intro: 'Вступление и настройка контекста урока',
    vocabulary: 'Слова, выражения и карточки',
    grammar: 'Объяснение правил и структуры',
    practice: 'Упражнения и закрепление',
    quiz: 'Проверка знаний и итог',
    speaking: 'Разговорный сценарий',
    review: 'Краткое повторение и выводы',
    dictionary: 'Справочный словарный раздел',
    notes: 'Заметки преподавателя',
    video: 'Видеообъяснение внутри урока',
    ai_practice: 'Адаптивная AI-практика',
  };

  return map[type] ?? 'Содержимое секции';
}

export function getSectionDisplayTitle(title: string) {
  const trimmed = title.trim();
  if (!trimmed) return 'Новая секция';
  if (/^section\s+\d+$/i.test(trimmed)) return 'Новая секция';
  if (/^секция\s+\d+$/i.test(trimmed)) return 'Новая секция';
  return trimmed;
}

export function semanticBlockDescription(type: string): string {
  const map: Record<string, string> = {
    heading: 'Внутренний заголовок внутри секции',
    text: 'Короткое объяснение или инструкция',
    audioExample: 'Отдельный аудио-пример для прослушивания',
    pronunciationPrompt: 'Задание для записи и устной практики',
    multipleChoice: 'Короткий тест с одним правильным ответом',
    phraseCard: 'Фраза с переводом и транскрипцией',
    teacherBubble: 'Сообщение преподавателя с текстом и аудио',
    rule: 'Правило произношения или грамматики',
    readingText: 'Более длинный текст для чтения',
    video: 'Встроенный видеофрагмент урока',
  };

  return map[type] ?? 'Контентный блок урока';
}

export function makeClientId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function slugifyLessonTitle(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return slug || `lesson-${Date.now()}`;
}

export function normalizeLesson(lesson: AdminLessonBuilder): AdminLessonBuilder {
  const nextLesson = deepClone(lesson);
  nextLesson.sections = [...nextLesson.sections]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((section, sectionIndex) => ({
      ...section,
      orderIndex: sectionIndex + 1,
      blocks: [...section.blocks]
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((block, blockIndex) => ({
          ...block,
          orderIndex: blockIndex + 1,
        })),
    }));
  return nextLesson;
}
