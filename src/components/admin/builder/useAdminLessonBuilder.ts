import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminLessonBuilderRepository } from '../../../lib/adminLessonBuilderRepository';
import {
  getSyncedAdminLessonId,
  setSyncedAdminLessonId,
} from '../../../lib/adminLessonBuilderStorage';
import {
  deepClone,
  normalizeLesson,
  parseObjectJson,
  slugifyLessonTitle,
} from './utils';
import type {
  AdminLessonBuilder,
  AdminLessonStatus,
  AdminLessonSummary,
} from '../../../types/admin';
import { ADMIN_NAV_COLLAPSED_STORAGE_KEY, type LessonMetaDraft } from './state';
import { useSectionDraftSync } from './useSectionDraftSync';
import { useSectionActions } from './useSectionActions';
import { useBlockActions } from './useBlockActions';
import type { SectionDraftState } from './state';
import { validateLessonForPublish } from './validation';

export function useAdminLessonBuilder(enabled: boolean) {
  const [lessons, setLessons] = useState<AdminLessonSummary[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<AdminLessonBuilder | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [metaDraft, setMetaDraft] = useState<LessonMetaDraft>({
    title: '',
    description: '',
    status: 'draft',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isMetaCollapsed, setIsMetaCollapsed] = useState(false);
  const [dragSectionId, setDragSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [publishValidationErrors, setPublishValidationErrors] = useState<string[]>([]);
  const [sectionDraft, setSectionDraft] = useState<SectionDraftState | null>(null);
  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(null);

  const orderedSections = useMemo(
    () => (selectedLesson ? [...selectedLesson.sections].sort((a, b) => a.orderIndex - b.orderIndex) : []),
    [selectedLesson],
  );
  const selectedSection = useMemo(
    () => orderedSections.find((section) => section.id === selectedSectionId) ?? null,
    [orderedSections, selectedSectionId],
  );
  const orderedBlocks = useMemo(
    () => (selectedSection ? [...selectedSection.blocks].sort((a, b) => a.orderIndex - b.orderIndex) : []),
    [selectedSection],
  );
  const displayedLessonTitle = metaDraft.title || selectedLesson?.title || lessons[0]?.title || 'Урок';

  const markDirty = useCallback(() => {
    setHasUnsavedChanges(true);
    setNotice(null);
    setError(null);
    setPublishValidationErrors([]);
  }, []);

  const updateDraftLesson = useCallback((
    updater: (draft: AdminLessonBuilder) => AdminLessonBuilder | void,
    options?: { markDirty?: boolean },
  ) => {
    setSelectedLesson((current) => {
      if (!current) return current;
      const draft = deepClone(current);
      const result = updater(draft);
      return normalizeLesson(result ?? draft);
    });

    if (options?.markDirty !== false) {
      markDirty();
    }
  }, [markDirty]);

  const buildPersistableLesson = useCallback((overrideStatus?: AdminLessonStatus) => {
    if (!selectedLesson) {
      throw new Error('Урок не загружен');
    }

    const nextLesson = normalizeLesson({
      ...deepClone(selectedLesson),
      title: metaDraft.title,
      slug: slugifyLessonTitle(metaDraft.title),
      description: metaDraft.description || null,
      status: overrideStatus ?? metaDraft.status,
    });

    if (selectedSectionId && sectionDraft) {
      const targetSection = nextLesson.sections.find((section) => section.id === selectedSectionId);
      if (targetSection) {
        targetSection.title = sectionDraft.title;
        targetSection.type = sectionDraft.type;
        targetSection.content = parseObjectJson(sectionDraft.contentJson);
      }
    }

    return normalizeLesson(nextLesson);
  }, [metaDraft.description, metaDraft.status, metaDraft.title, sectionDraft, selectedLesson, selectedSectionId]);
  useSectionDraftSync({ selectedSection, sectionDraft, setSectionDraft });

  const refreshLesson = useCallback(async (lessonId?: string) => {
    const id = lessonId ?? selectedLesson?.id;
    if (!id) return null;
    const lesson = await adminLessonBuilderRepository.getLessonBuilder(id);
    setSelectedLesson(lesson);
    if (lesson) {
      setSyncedAdminLessonId(lesson.id);
    }
    setLessons(await adminLessonBuilderRepository.listLessons());
    setHasUnsavedChanges(false);
    return lesson;
  }, [selectedLesson?.id]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let active = true;

    void (async () => {
      try {
        const nextLessons = await adminLessonBuilderRepository.listLessons();
        if (!active) return;

        setLessons(nextLessons);
        const syncedLessonId = getSyncedAdminLessonId();
        const target = nextLessons.find((lesson) => lesson.id === syncedLessonId) ?? nextLessons[0] ?? null;
        if (!target) {
          setLoading(false);
          return;
        }

        const lesson = await adminLessonBuilderRepository.getLessonBuilder(target.id);
        if (!active) return;

        setSelectedLesson(lesson);
        if (lesson) {
          setSyncedAdminLessonId(lesson.id);
          setMetaDraft({
            title: lesson.title,
            description: lesson.description ?? '',
            status: lesson.status,
          });
          setHasUnsavedChanges(false);
          const firstSection = [...lesson.sections].sort((a, b) => a.orderIndex - b.orderIndex)[0];
          setSelectedSectionId(firstSection?.id ?? null);
        }

        setError(null);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Не удалось загрузить данные');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [enabled]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsNavCollapsed(window.localStorage.getItem(ADMIN_NAV_COLLAPSED_STORAGE_KEY) === 'true');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ADMIN_NAV_COLLAPSED_STORAGE_KEY, String(isNavCollapsed));
  }, [isNavCollapsed]);

  useEffect(() => {
    if (!highlightedBlockId) return;
    const timeoutId = window.setTimeout(() => {
      setHighlightedBlockId((current) => (current === highlightedBlockId ? null : current));
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [highlightedBlockId]);

  const runAction = useCallback(async (task: () => Promise<void>, successMessage: string) => {
    setSaving(true);
    setNotice(null);
    try {
      await task();
      setNotice(successMessage);
      setError(null);
      setPublishValidationErrors([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setSaving(false);
    }
  }, []);

  const handleSaveLessonMeta = useCallback(async (overrideStatus?: AdminLessonStatus) => {
    if (!selectedLesson) return;
    const status = overrideStatus ?? metaDraft.status;
    const lessonToSave = buildPersistableLesson(status);

    if (status === 'published') {
      const validationErrors = validateLessonForPublish(lessonToSave);
      if (validationErrors.length > 0) {
        setNotice(null);
        setError(null);
        setPublishValidationErrors(validationErrors);
        return;
      }
    }

    await runAction(async () => {
      const lesson = await adminLessonBuilderRepository.saveLessonBuilder(lessonToSave);
      setSelectedLesson(lesson);
      setMetaDraft({
        title: lesson.title,
        description: lesson.description ?? '',
        status: lesson.status,
      });
      setHasUnsavedChanges(false);
      await refreshLesson(lesson.id);
    }, overrideStatus === 'published' ? 'Урок опубликован' : 'Изменения сохранены');
  }, [buildPersistableLesson, metaDraft.status, refreshLesson, runAction, selectedLesson]);

  const {
    handleCreateSection,
    handleUpdateSectionDraft,
    handleDeleteSection,
    handleMoveSection,
    handleDropSection,
  } = useSectionActions({
    selectedLesson,
    selectedSection,
    orderedSections,
    selectedSectionId,
    sectionDraft,
    updateDraftLesson,
    setSelectedSectionId,
    setSectionDraft,
    setNotice,
    setError,
  });

  const {
    handleCreateBlock,
    handleInsertBlockAfter,
    handleSaveBlock,
    handleDeleteBlock,
    handleReorderBlock,
  } = useBlockActions({
    selectedLesson,
    selectedSection,
    orderedBlocks,
    updateDraftLesson,
    setNotice,
    setHighlightedBlockId,
  });

  return {
    selectedLesson,
    selectedSectionId,
    setSelectedSectionId,
    metaDraft,
    setMetaDraft,
    loading,
    saving,
    hasUnsavedChanges,
    isNavCollapsed,
    setIsNavCollapsed,
    isMetaCollapsed,
    setIsMetaCollapsed,
    dragSectionId,
    setDragSectionId,
    dragOverSectionId,
    setDragOverSectionId,
    error,
    notice,
    publishValidationErrors,
    highlightedBlockId,
    sectionDraft,
    setSectionDraft,
    orderedSections,
    selectedSection,
    orderedBlocks,
    displayedLessonTitle,
    markDirty,
    handleSaveLessonMeta,
    handleCreateSection,
    handleUpdateSectionDraft,
    handleDeleteSection,
    handleMoveSection,
    handleDropSection,
    handleCreateBlock,
    handleInsertBlockAfter,
    handleSaveBlock,
    handleDeleteBlock,
    handleReorderBlock,
  };
}
