import { beforeEach, describe, expect, it } from 'vitest';
import { saveStore, seedStore } from '../../../lib/adminLessonBuilder/helpers';
import { MockAdminLessonBuilderRepository } from '../../../lib/adminLessonBuilder/mockRepository';

describe('MockAdminLessonBuilderRepository reorder flows', () => {
  beforeEach(() => {
    localStorage.clear();
    saveStore(seedStore());
  });

  it('reorders sections with contiguous order indices and preserves content', async () => {
    const repository = new MockAdminLessonBuilderRepository();
    const lesson = await repository.getLessonBuilder('lesson-1');
    expect(lesson).not.toBeNull();

    const orderedSectionIds = lesson!.sections
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((section) => section.id);

    const reorderedIds = [orderedSectionIds[1], orderedSectionIds[0], ...orderedSectionIds.slice(2)];
    const updatedLesson = await repository.reorderSections('lesson-1', reorderedIds);

    expect(updatedLesson.sections.map((section) => section.orderIndex)).toEqual(
      updatedLesson.sections.map((_, index) => index + 1),
    );
    expect(updatedLesson.sections.map((section) => section.id)).toEqual(reorderedIds);
    expect(updatedLesson.sections[0]?.blocks.length).toBeGreaterThan(0);
  });

  it('reorders blocks inside a section with contiguous order indices', async () => {
    const repository = new MockAdminLessonBuilderRepository();
    const lesson = await repository.getLessonBuilder('lesson-1');
    expect(lesson).not.toBeNull();

    const targetSection = lesson!.sections.find((section) => section.blocks.length > 1);
    expect(targetSection).toBeTruthy();

    const orderedBlockIds = targetSection!.blocks
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((block) => block.id);

    const reorderedBlockIds = [orderedBlockIds[1], orderedBlockIds[0], ...orderedBlockIds.slice(2)];
    const updatedLesson = await repository.reorderBlocks(targetSection!.id, reorderedBlockIds);
    const updatedSection = updatedLesson.sections.find((section) => section.id === targetSection!.id);

    expect(updatedSection?.blocks.map((block) => block.orderIndex)).toEqual(
      updatedSection?.blocks.map((_, index) => index + 1),
    );
    expect(updatedSection?.blocks.map((block) => block.id)).toEqual(reorderedBlockIds);
  });
});
