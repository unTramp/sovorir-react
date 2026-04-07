import type { AdminLessonBuilder, AdminSectionType } from '../types/admin';
import type { LessonContentSection } from '../types/lessonContent';
import type { Lesson, Section, SectionStatus, SectionType } from '../types/lesson';
import { lessons as staticLessons } from '../data/lessons';

export const ADMIN_LESSON_BUILDER_STORAGE_KEY = 'sovorir-admin-builder';
export const ADMIN_ACTIVE_LESSON_ID_STORAGE_KEY = 'sovorir-admin-active-lesson-id';
export const ADMIN_LESSON_BUILDER_SYNC_EVENT = 'sovorir:admin-builder-sync';
export const ADMIN_LESSON_BUILDER_SYNC_CHANNEL = 'sovorir-admin-builder-sync-channel';
const STATIC_TRAILING_LESSONS = staticLessons.slice(1);

interface AdminDraftStoreSnapshot {
  lessons: AdminLessonBuilder[];
}

function readRawStore() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(ADMIN_LESSON_BUILDER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AdminDraftStoreSnapshot;
  } catch {
    return null;
  }
}

function mapSectionType(type: AdminSectionType): SectionType {
  switch (type) {
    case 'dictionary':
      return 'dictionary';
    case 'notes':
      return 'notes';
    case 'video':
      return 'video';
    case 'practice':
    case 'speaking':
    case 'ai_practice':
      return 'practice';
    default:
      return 'lesson';
  }
}

function iconForSectionType(type: SectionType) {
  switch (type) {
    case 'dictionary':
      return '\u{1F4D8}';
    case 'notes':
      return '\u{1F4DD}';
    case 'video':
      return '\u{1F3AC}';
    case 'practice':
      return '\u{26A1}';
    case 'audio':
      return '\u{1F3A7}';
    default:
      return '\u{1F4C4}';
  }
}

function buildSectionStatuses(count: number): SectionStatus[] {
  return Array.from({ length: count }, (_, index) => (index === 0 ? 'in-progress' : 'pending'));
}

function sortByOrder<T extends { orderIndex: number }>(items: T[]) {
  return items.slice().sort((a, b) => a.orderIndex - b.orderIndex);
}

function getPreferredLesson(store: AdminDraftStoreSnapshot): AdminLessonBuilder | null {
  const orderedLessons = sortByOrder(store.lessons);
  const activeLessonId =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(ADMIN_ACTIVE_LESSON_ID_STORAGE_KEY)
      : null;

  if (activeLessonId) {
    return orderedLessons.find((lesson) => lesson.id === activeLessonId) ?? orderedLessons[0] ?? null;
  }

  return orderedLessons[0] ?? null;
}

export function getSyncedAdminLessonId(): string | null {
  const store = readRawStore();
  if (!store?.lessons?.length) return null;
  return getPreferredLesson(store)?.id ?? null;
}

export function setSyncedAdminLessonId(lessonId: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ADMIN_ACTIVE_LESSON_ID_STORAGE_KEY, lessonId);
  emitAdminLessonBuilderSync();
}

export function emitAdminLessonBuilderSync() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ADMIN_LESSON_BUILDER_SYNC_EVENT));
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(ADMIN_LESSON_BUILDER_SYNC_CHANNEL);
    channel.postMessage({ type: 'sync' });
    channel.close();
  }
}

export function subscribeAdminLessonBuilderSync(onSync: () => void) {
  if (typeof window === 'undefined') return () => {};

  function handleStorage(event: StorageEvent) {
    if (
      event.key === ADMIN_LESSON_BUILDER_STORAGE_KEY
      || event.key === ADMIN_ACTIVE_LESSON_ID_STORAGE_KEY
    ) {
      onSync();
    }
  }

  function handleCustomSync() {
    onSync();
  }

  let channel: BroadcastChannel | null = null;

  window.addEventListener('storage', handleStorage);
  window.addEventListener(ADMIN_LESSON_BUILDER_SYNC_EVENT, handleCustomSync);

  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(ADMIN_LESSON_BUILDER_SYNC_CHANNEL);
    channel.addEventListener('message', handleCustomSync);
  }

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(ADMIN_LESSON_BUILDER_SYNC_EVENT, handleCustomSync);
    channel?.removeEventListener('message', handleCustomSync);
    channel?.close();
  };
}

export function getSyncedAdminLesson(): AdminLessonBuilder | null {
  const store = readRawStore();
  if (!store?.lessons?.length) return null;
  return getPreferredLesson(store);
}

export function getSyncedAdminLessonSections(): LessonContentSection[] | null {
  const lesson = getSyncedAdminLesson();
  if (!lesson) return null;

  return sortByOrder(lesson.sections).map((section, index) => ({
    id: index + 1,
    title: section.title,
    quizId:
      section.content && typeof section.content.quizId === 'string'
        ? section.content.quizId
        : undefined,
    blocks: sortByOrder(section.blocks).map((block) => block.content),
  }));
}

export function getSyncedAdminLessonsCatalog(): Lesson[] | null {
  const lesson = getSyncedAdminLesson();
  if (!lesson) return null;

  const orderedSections = sortByOrder(lesson.sections);
  const sectionStatuses = buildSectionStatuses(orderedSections.length);

  const currentLesson: Lesson = {
    id: 1,
    title: lesson.title,
    icon: '\u{1F4D6}',
    status: 'current',
    sections: orderedSections.map<Section>((section, index) => {
      const navType = mapSectionType(section.type);
      return {
        id: section.id,
        title: section.title,
        type: navType,
        icon: iconForSectionType(navType),
        status: sectionStatuses[index],
      };
    }),
  };

  const trailingLessons = STATIC_TRAILING_LESSONS
    .map<Lesson>((item, index) => ({
      ...item,
      id: index + 2,
      status: 'locked',
      sections: item.sections.map((section) => ({
        ...section,
        status: 'locked',
      })),
    }));

  return [currentLesson, ...trailingLessons];
}
