import { beforeEach, describe, expect, it } from 'vitest';
import {
  ADMIN_LESSON_BUILDER_STORAGE_KEY,
  getSyncedAdminLesson,
  getSyncedAdminLessonId,
  getSyncedAdminLessonsCatalog,
  getSyncedAdminLessonSections,
  setSyncedAdminLessonId,
} from '../../lib/adminLessonBuilderStorage';
import { saveStore, seedStore } from '../../lib/adminLessonBuilder/helpers';

describe('adminLessonBuilderStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('prefers the explicitly selected lesson id over title-based assumptions', () => {
    const store = seedStore();
    const secondLesson = store.lessons[1];
    secondLesson.title = 'Переименованный второй урок';
    saveStore(store);
    setSyncedAdminLessonId(secondLesson.id);

    expect(getSyncedAdminLessonId()).toBe(secondLesson.id);
    expect(getSyncedAdminLesson()?.id).toBe(secondLesson.id);
    expect(getSyncedAdminLessonsCatalog()?.[0]?.title).toBe('Переименованный второй урок');
  });

  it('falls back to the first ordered lesson when the stored lesson id is missing', () => {
    const store = seedStore();
    saveStore(store);
    setSyncedAdminLessonId('missing-lesson');

    expect(getSyncedAdminLesson()?.id).toBe(store.lessons[0]?.id);
    expect(getSyncedAdminLessonSections()?.[0]?.title).toBe(store.lessons[0]?.sections[0]?.title);
  });

  it('fails safely when the local draft store contains malformed json', () => {
    localStorage.setItem(ADMIN_LESSON_BUILDER_STORAGE_KEY, '{broken-json');

    expect(getSyncedAdminLesson()).toBeNull();
    expect(getSyncedAdminLessonId()).toBeNull();
    expect(getSyncedAdminLessonsCatalog()).toBeNull();
    expect(getSyncedAdminLessonSections()).toBeNull();
  });
});
