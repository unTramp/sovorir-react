import { useCallback } from 'react';
import { makeClientId } from './utils';
import type { AdminLessonBuilder, AdminLessonSection } from '../../../types/admin';
import type { SectionDraftState } from './state';

interface UseSectionActionsParams {
  selectedLesson: AdminLessonBuilder | null;
  selectedSection: AdminLessonSection | null;
  orderedSections: AdminLessonSection[];
  selectedSectionId: string | null;
  sectionDraft: SectionDraftState | null;
  updateDraftLesson: (
    updater: (draft: AdminLessonBuilder) => AdminLessonBuilder | void,
    options?: { markDirty?: boolean },
  ) => void;
  setSelectedSectionId: React.Dispatch<React.SetStateAction<string | null>>;
  setSectionDraft: React.Dispatch<React.SetStateAction<SectionDraftState | null>>;
  setNotice: React.Dispatch<React.SetStateAction<string | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useSectionActions({
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
}: UseSectionActionsParams) {
  const applyReorderedSections = useCallback((reordered: AdminLessonSection[]) => {
    updateDraftLesson((draft) => {
      draft.sections = reordered.map((section, index) => ({
        ...structuredClone(section),
        orderIndex: index + 1,
      }));
    });
    setNotice('Порядок секций обновлён в черновике');
  }, [setNotice, updateDraftLesson]);

  const handleCreateSection = useCallback(async () => {
    if (!selectedLesson) return;
    const nextOrder = orderedSections.length > 0
      ? Math.max(...orderedSections.map((section) => section.orderIndex)) + 1
      : 1;
    const sectionId = makeClientId('section');
    const createdAt = new Date().toISOString();

    updateDraftLesson((draft) => {
      draft.sections.push({
        id: sectionId,
        lessonId: draft.id,
        title: `Section ${nextOrder}`,
        orderIndex: nextOrder,
        type: 'intro',
        content: null,
        createdAt,
        blocks: [],
      });
    });

    setSelectedSectionId(sectionId);
    setSectionDraft({
      title: `Section ${nextOrder}`,
      type: 'intro',
      contentJson: 'null',
    });
    setNotice('Секция добавлена в черновик');
  }, [orderedSections, selectedLesson, setNotice, setSectionDraft, setSelectedSectionId, updateDraftLesson]);

  const handleUpdateSectionDraft = useCallback((patch: Partial<SectionDraftState>) => {
    if (!selectedLesson || !selectedSection || !sectionDraft) return;

    const nextDraft = { ...sectionDraft, ...patch };
    setSectionDraft(nextDraft);
    setError(null);

    updateDraftLesson((draft) => {
      const section = draft.sections.find((item) => item.id === selectedSection.id);
      if (!section) return;
      section.title = nextDraft.title;
      section.type = nextDraft.type;
    });
  }, [sectionDraft, selectedLesson, selectedSection, setError, setSectionDraft, updateDraftLesson]);

  const handleDeleteSection = useCallback(async (sectionId: string) => {
    if (!selectedLesson) return;
    const remaining = orderedSections.filter((section) => section.id !== sectionId);
    updateDraftLesson((draft) => {
      draft.sections = draft.sections.filter((section) => section.id !== sectionId);
    });
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(remaining[0]?.id ?? null);
    }
    setNotice('Секция удалена из черновика');
  }, [orderedSections, selectedLesson, selectedSectionId, setNotice, setSelectedSectionId, updateDraftLesson]);

  const handleMoveSection = useCallback(async (sectionId: string, direction: 'up' | 'down') => {
    if (!selectedLesson) return;
    const currentIndex = orderedSections.findIndex((section) => section.id === sectionId);
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= orderedSections.length) return;
    const reordered = [...orderedSections];
    [reordered[currentIndex], reordered[nextIndex]] = [reordered[nextIndex], reordered[currentIndex]];
    applyReorderedSections(reordered);
  }, [applyReorderedSections, orderedSections, selectedLesson]);

  const handleDropSection = useCallback(async (dragId: string, overId: string) => {
    if (!selectedLesson || dragId === overId) return;
    const reordered = [...orderedSections];
    const fromIndex = reordered.findIndex((section) => section.id === dragId);
    const toIndex = reordered.findIndex((section) => section.id === overId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [movedSection] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movedSection);
    applyReorderedSections(reordered);
  }, [applyReorderedSections, orderedSections, selectedLesson]);

  return {
    handleCreateSection,
    handleUpdateSectionDraft,
    handleDeleteSection,
    handleMoveSection,
    handleDropSection,
  };
}
